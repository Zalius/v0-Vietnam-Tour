import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllTours, formatPrice } from "@/lib/tours"
import { TourRowActions } from "@/components/admin/tour-row-actions"

export const dynamic = "force-dynamic"

export default async function AdminToursPage() {
  const tours = await getAllTours()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Tours
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tours.length} {tours.length === 1 ? "tour" : "tours"} total
          </p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          <Plus size={16} />
          New tour
        </Link>
      </div>

      {tours.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No tours yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr className="text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3 font-medium">Tour</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  Region
                </th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Price
                </th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground">
                      {tour.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /{tour.slug} &middot; {tour.durationDays} days
                      {tour.featured ? " · Featured" : ""}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">
                    {tour.region}
                  </td>
                  <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                    {formatPrice(tour.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tour.published
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {tour.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <TourRowActions
                        id={tour.id}
                        published={tour.published}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
