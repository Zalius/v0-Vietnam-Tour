"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tours, type ItineraryDay } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { deleteMinioImage, uploadImageToMinio } from "@/lib/minio"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value) return []
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseUploadedFiles(value: FormDataEntryValue[]): File[] {
  return value.filter(
    (entry): entry is File => entry instanceof File && entry.size > 0,
  )
}

function parseItinerary(value: FormDataEntryValue | null): ItineraryDay[] {
  if (!value) return []
  // Each line: "Title :: Description"
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, ...rest] = line.split("::")
      return {
        day: index + 1,
        title: (title ?? "").trim(),
        description: rest.join("::").trim(),
      }
    })
}

async function uploadImageToMinioIfPresent(
  value: FormDataEntryValue | null,
): Promise<string | null> {
  if (!(value instanceof File) || value.size === 0) return null
  return uploadImageToMinio(value)
}

async function buildTourData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim()
  const customSlug = String(formData.get("slug") ?? "").trim()
  const slug = slugify(customSlug || title)
  const mainImageUpload = await uploadImageToMinioIfPresent(
    formData.get("mainImageFile"),
  )
  const galleryUploads = (
    await Promise.all(
      parseUploadedFiles(formData.getAll("galleryFiles")).map(uploadImageToMinio),
    )
  ).filter((url): url is string => Boolean(url))

  return {
    title,
    slug,
    region: String(formData.get("region") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: Number.parseInt(String(formData.get("price") ?? "0"), 10) || 0,
    durationDays:
      Number.parseInt(String(formData.get("durationDays") ?? "1"), 10) || 1,
    startLocation: String(formData.get("startLocation") ?? "").trim(),
    endLocation: String(formData.get("endLocation") ?? "").trim(),
    maxGroupSize:
      Number.parseInt(String(formData.get("maxGroupSize") ?? "12"), 10) || 12,
    difficulty: String(formData.get("difficulty") ?? "Moderate").trim(),
    mainImage: mainImageUpload || String(formData.get("mainImage") ?? "").trim(),
    gallery: [...parseList(formData.get("gallery")), ...galleryUploads],
    highlights: parseList(formData.get("highlights")),
    included: parseList(formData.get("included")),
    itinerary: parseItinerary(formData.get("itinerary")),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    updatedAt: new Date(),
  }
}

function uniqueValues(values: string[]): Set<string> {
  return new Set(values.filter(Boolean))
}

async function deleteRemovedMinioImages(
  previousImages: string[],
  nextImages: string[],
) {
  const next = uniqueValues(nextImages)
  const removed = previousImages.filter((image) => image && !next.has(image))
  await Promise.all(removed.map(deleteMinioImage))
}

export async function createTour(formData: FormData) {
  await requireAuth()
  const data = await buildTourData(formData)
  if (!data.title || !data.slug) throw new Error("Title is required")
  await db.insert(tours).values(data)
  revalidatePath("/admin")
  revalidatePath("/")
  redirect("/admin")
}

export async function updateTour(id: number, formData: FormData) {
  await requireAuth()
  const previousTour = await db.query.tours.findFirst({
    where: eq(tours.id, id),
  })
  const data = await buildTourData(formData)
  if (!data.title || !data.slug) throw new Error("Title is required")
  await db.update(tours).set(data).where(eq(tours.id, id))
  if (previousTour) {
    await deleteRemovedMinioImages(
      [previousTour.mainImage, ...previousTour.gallery],
      [data.mainImage, ...data.gallery],
    )
  }
  revalidatePath("/admin")
  revalidatePath("/")
  if (previousTour?.slug && previousTour.slug !== data.slug) {
    revalidatePath(`/tours/${previousTour.slug}`)
  }
  revalidatePath(`/tours/${data.slug}`)
  redirect("/admin")
}

export async function deleteTour(id: number) {
  await requireAuth()
  const previousTour = await db.query.tours.findFirst({
    where: eq(tours.id, id),
  })
  await db.delete(tours).where(eq(tours.id, id))
  if (previousTour) {
    await Promise.all(
      [previousTour.mainImage, ...previousTour.gallery].map(deleteMinioImage),
    )
  }
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function togglePublished(id: number, published: boolean) {
  await requireAuth()
  await db
    .update(tours)
    .set({ published, updatedAt: new Date() })
    .where(eq(tours.id, id))
  revalidatePath("/admin")
  revalidatePath("/")
}
