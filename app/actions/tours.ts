"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tours, type ItineraryDay } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

function buildTourData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim()
  const customSlug = String(formData.get("slug") ?? "").trim()
  const slug = slugify(customSlug || title)

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
    mainImage: String(formData.get("mainImage") ?? "").trim(),
    gallery: parseList(formData.get("gallery")),
    highlights: parseList(formData.get("highlights")),
    included: parseList(formData.get("included")),
    itinerary: parseItinerary(formData.get("itinerary")),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    updatedAt: new Date(),
  }
}

export async function createTour(formData: FormData) {
  await requireAuth()
  const data = buildTourData(formData)
  if (!data.title || !data.slug) throw new Error("Title is required")
  await db.insert(tours).values(data)
  revalidatePath("/admin")
  revalidatePath("/")
  redirect("/admin")
}

export async function updateTour(id: number, formData: FormData) {
  await requireAuth()
  const data = buildTourData(formData)
  if (!data.title || !data.slug) throw new Error("Title is required")
  await db.update(tours).set(data).where(eq(tours.id, id))
  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath(`/tours/${data.slug}`)
  redirect("/admin")
}

export async function deleteTour(id: number) {
  await requireAuth()
  await db.delete(tours).where(eq(tours.id, id))
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
