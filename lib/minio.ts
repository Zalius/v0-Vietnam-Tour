import { randomUUID } from "crypto"
import { Client } from "minio"

const bucketName = process.env.MINIO_BUCKET_NAME
const endpointUrl = process.env.MINIO_ENDPOINT_URL
let minioClient: Client | null = null
let tourImagesPublicPolicyPromise: Promise<void> | null = null

type BucketPolicyStatement = {
  Sid?: string
  Effect: string
  Principal: "*" | Record<string, unknown>
  Action: string | string[]
  Resource: string | string[]
}

type BucketPolicy = {
  Version: string
  Statement: BucketPolicyStatement[]
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required for MinIO uploads`)
  return value
}

function parseEndpoint() {
  const rawEndpoint = getRequiredEnv("MINIO_ENDPOINT")
  const parsed = new URL(
    rawEndpoint.startsWith("http://") || rawEndpoint.startsWith("https://")
      ? rawEndpoint
      : `http://${rawEndpoint}`,
  )

  return {
    endPoint: parsed.hostname,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : undefined,
    useSSL: parsed.protocol === "https:",
  }
}

function getMinioClient() {
  if (!minioClient) {
    minioClient = new Client({
      ...parseEndpoint(),
      accessKey: getRequiredEnv("MINIO_ACCESS_KEY"),
      secretKey: getRequiredEnv("MINIO_SECRET_KEY"),
    })
  }

  return minioClient
}

function publicObjectUrl(objectName: string): string {
  return minioProxyUrl(objectName)
}

function minioProxyUrl(objectName: string): string {
  return `/api/minio/${objectName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`
}

function safeFileName(fileName: string): string {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || "image"
}

function publicTourImagesStatement(bucket: string): BucketPolicyStatement {
  return {
    Sid: "PublicReadTourImages",
    Effect: "Allow",
    Principal: "*",
    Action: ["s3:GetObject"],
    Resource: [`arn:aws:s3:::${bucket}/tours/*`],
  }
}

async function getBucketPolicy(bucket: string): Promise<BucketPolicy> {
  try {
    const policy = await getMinioClient().getBucketPolicy(bucket)
    return JSON.parse(policy) as BucketPolicy
  } catch {
    return {
      Version: "2012-10-17",
      Statement: [],
    }
  }
}

async function ensureTourImagesArePublic(): Promise<void> {
  if (tourImagesPublicPolicyPromise) return tourImagesPublicPolicyPromise

  tourImagesPublicPolicyPromise = (async () => {
    const bucket = getRequiredEnv("MINIO_BUCKET_NAME")
    const policy = await getBucketPolicy(bucket)
    const statement = publicTourImagesStatement(bucket)
    const statements = Array.isArray(policy.Statement) ? policy.Statement : []
    const hasPublicTourRead = statements.some(
      (item) => item.Sid === statement.Sid,
    )

    if (hasPublicTourRead) return

    await getMinioClient().setBucketPolicy(
      bucket,
      JSON.stringify({
        Version: policy.Version || "2012-10-17",
        Statement: [
          ...statements.filter((item) => item.Sid !== statement.Sid),
          statement,
        ],
      }),
    )
  })()

  return tourImagesPublicPolicyPromise
}

export async function uploadImageToMinio(file: File): Promise<string | null> {
  if (!file.size) return null
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed")
  }

  const objectName = `tours/${randomUUID()}-${safeFileName(file.name)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await ensureTourImagesArePublic()

  await getMinioClient().putObject(
    getRequiredEnv("MINIO_BUCKET_NAME"),
    objectName,
    buffer,
    file.size,
    {
      "Content-Type": file.type,
    },
  )

  return publicObjectUrl(objectName)
}

export function getMinioObjectNameFromUrl(value: string): string | null {
  if (!value) return null

  if (value.startsWith("/api/minio/")) {
    return value
      .slice("/api/minio/".length)
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/")
  }

  if (!bucketName || !endpointUrl) return null

  try {
    const url = new URL(value)
    const publicUrl = new URL(endpointUrl)
    const bucketPrefix = `/${bucketName}/`

    if (url.origin !== publicUrl.origin || !url.pathname.startsWith(bucketPrefix)) {
      return null
    }

    return decodeURIComponent(url.pathname.slice(bucketPrefix.length))
  } catch {
    return null
  }
}

export function getMinioImageUrl(value: string): string {
  const objectName = getMinioObjectNameFromUrl(value)
  if (!objectName) return value
  return minioProxyUrl(objectName)
}

export async function getMinioObject(objectName: string) {
  return getMinioClient().getObject(getRequiredEnv("MINIO_BUCKET_NAME"), objectName)
}

export async function statMinioObject(objectName: string) {
  return getMinioClient().statObject(
    getRequiredEnv("MINIO_BUCKET_NAME"),
    objectName,
  )
}

export async function deleteMinioImage(value: string): Promise<void> {
  const objectName = getMinioObjectNameFromUrl(value)
  if (!objectName) return

  try {
    await getMinioClient().removeObject(
      getRequiredEnv("MINIO_BUCKET_NAME"),
      objectName,
    )
  } catch (error) {
    console.warn(`Failed to delete MinIO object ${objectName}`, error)
  }
}
