import { Readable } from "stream"
import { getMinioObject, statMinioObject } from "@/lib/minio"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const objectName = path.join("/")

  if (!objectName || objectName.includes("..")) {
    return new Response("Invalid object path", { status: 400 })
  }

  try {
    const [stat, object] = await Promise.all([
      statMinioObject(objectName),
      getMinioObject(objectName),
    ])
    const contentType =
      stat.metaData["content-type"] ||
      stat.metaData["Content-Type"] ||
      "application/octet-stream"

    return new Response(Readable.toWeb(object) as ReadableStream, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(stat.size),
        "Content-Type": String(contentType),
      },
    })
  } catch {
    return new Response("Image not found", { status: 404 })
  }
}
