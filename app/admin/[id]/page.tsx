import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { updateTour } from "@/app/actions/tours"
import { getTourById } from "@/lib/tours"
import { TourForm } from "@/components/admin/tour-form"

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tourId = Number.parseInt(id, 10)
  if (Number.isNaN(tourId)) notFound()

  const tour = await getTourById(tourId)
  if (!tour) notFound()

  const updateAction = updateTour.bind(null, tourId)

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to tours
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-medium tracking-tight text-foreground">
        Edit tour
      </h1>
      <TourForm action={updateAction} tour={tour} />
    </div>
  )
}
