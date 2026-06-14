"use client"

import { useTransition } from "react"
import Link from "next/link"
import { deleteTour, togglePublished } from "@/app/actions/tours"

export function TourRowActions({
  id,
  published,
}: {
  id: number
  published: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href={`/admin/${id}`}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Edit
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            togglePublished(id, !published)
          })
        }
        className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (
            confirm("Delete this tour? This action cannot be undone.")
          ) {
            startTransition(() => {
              deleteTour(id)
            })
          }
        }}
        className="text-destructive transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
