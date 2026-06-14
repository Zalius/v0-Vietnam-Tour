import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createTour } from "@/app/actions/tours"
import { TourForm } from "@/components/admin/tour-form"

export default function NewTourPage() {
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
        New tour
      </h1>
      <TourForm action={createTour} />
    </div>
  )
}
