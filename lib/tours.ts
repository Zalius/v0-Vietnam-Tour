import { db } from "@/lib/db"
import { tours, type Tour } from "@/lib/db/schema"
import { getMinioImageUrl } from "@/lib/minio"
import { desc, eq } from "drizzle-orm"

function withDisplayImageUrls(tour: Tour): Tour {
  return {
    ...tour,
    mainImage: getMinioImageUrl(tour.mainImage),
    gallery: tour.gallery.map(getMinioImageUrl),
  }
}

// Public reads (only published tours)
export async function getPublishedTours(): Promise<Tour[]> {
  const rows = await db
    .select()
    .from(tours)
    .where(eq(tours.published, true))
    .orderBy(desc(tours.featured), desc(tours.createdAt))

  return rows.map(withDisplayImageUrls)
}

export async function getFeaturedTours(): Promise<Tour[]> {
  const all = await getPublishedTours()
  const featured = all.filter((t) => t.featured)
  return featured.length > 0 ? featured : all.slice(0, 3)
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const rows = await db.select().from(tours).where(eq(tours.slug, slug)).limit(1)
  return rows[0] ? withDisplayImageUrls(rows[0]) : null
}

// Admin reads (all tours, including unpublished)
export async function getAllTours(): Promise<Tour[]> {
  const rows = await db.select().from(tours).orderBy(desc(tours.createdAt))
  return rows.map(withDisplayImageUrls)
}

export async function getTourById(id: number): Promise<Tour | null> {
  const rows = await db.select().from(tours).where(eq(tours.id, id)).limit(1)
  return rows[0] ? withDisplayImageUrls(rows[0]) : null
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}
