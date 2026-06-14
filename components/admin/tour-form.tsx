"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import type { Tour } from "@/lib/db/schema"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  )
}

const labelClass = "text-sm font-medium text-foreground"
const inputClass =
  "rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"

export function TourForm({
  action,
  tour,
}: {
  action: (formData: FormData) => Promise<void>
  tour?: Tour
}) {
  const [title, setTitle] = useState(tour?.title ?? "")

  const itineraryText = (tour?.itinerary ?? [])
    .map((d) => `${d.title} :: ${d.description}`)
    .join("\n")

  return (
    <form action={action} className="flex flex-col gap-8">
      {/* Basics */}
      <fieldset className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Tour title
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Ha Long Bay Overnight Cruise"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="slug" className={labelClass}>
            URL slug{" "}
            <span className="font-normal text-muted-foreground">
              (optional — auto-generated from title)
            </span>
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={tour?.slug ?? ""}
            className={inputClass}
            placeholder="ha-long-bay-cruise"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="region" className={labelClass}>
            Region
          </label>
          <input
            id="region"
            name="region"
            required
            defaultValue={tour?.region ?? ""}
            className={inputClass}
            placeholder="Northern Vietnam"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="difficulty" className={labelClass}>
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={tour?.difficulty ?? "Moderate"}
            className={inputClass}
          >
            <option>Easy</option>
            <option>Moderate</option>
            <option>Challenging</option>
            <option>Strenuous</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="price" className={labelClass}>
            Price (USD per person)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={tour?.price ?? 0}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="durationDays" className={labelClass}>
            Duration (days)
          </label>
          <input
            id="durationDays"
            name="durationDays"
            type="number"
            min={1}
            defaultValue={tour?.durationDays ?? 1}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="startLocation" className={labelClass}>
            Start location
          </label>
          <input
            id="startLocation"
            name="startLocation"
            defaultValue={tour?.startLocation ?? ""}
            className={inputClass}
            placeholder="Hanoi"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endLocation" className={labelClass}>
            End location
          </label>
          <input
            id="endLocation"
            name="endLocation"
            defaultValue={tour?.endLocation ?? ""}
            className={inputClass}
            placeholder="Hanoi"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="maxGroupSize" className={labelClass}>
            Max group size
          </label>
          <input
            id="maxGroupSize"
            name="maxGroupSize"
            type="number"
            min={1}
            defaultValue={tour?.maxGroupSize ?? 12}
            className={inputClass}
          />
        </div>
      </fieldset>

      {/* Text content */}
      <div className="flex flex-col gap-2">
        <label htmlFor="summary" className={labelClass}>
          Short summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={tour?.summary ?? ""}
          className={inputClass}
          placeholder="One-line teaser shown on cards."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>
          Full description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={tour?.description ?? ""}
          className={inputClass}
        />
      </div>

      {/* Images */}
      <div className="flex flex-col gap-2">
        <label htmlFor="mainImage" className={labelClass}>
          Main image path or URL
        </label>
        <input
          id="mainImage"
          name="mainImage"
          defaultValue={tour?.mainImage ?? ""}
          className={inputClass}
          placeholder="/images/bottle-lake.png or https://…"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="gallery" className={labelClass}>
          Gallery images{" "}
          <span className="font-normal text-muted-foreground">
            (one path/URL per line)
          </span>
        </label>
        <textarea
          id="gallery"
          name="gallery"
          rows={3}
          defaultValue={(tour?.gallery ?? []).join("\n")}
          className={inputClass}
        />
      </div>

      {/* Lists */}
      <div className="flex flex-col gap-2">
        <label htmlFor="highlights" className={labelClass}>
          Highlights{" "}
          <span className="font-normal text-muted-foreground">
            (one per line)
          </span>
        </label>
        <textarea
          id="highlights"
          name="highlights"
          rows={4}
          defaultValue={(tour?.highlights ?? []).join("\n")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="included" className={labelClass}>
          What&apos;s included{" "}
          <span className="font-normal text-muted-foreground">
            (one per line)
          </span>
        </label>
        <textarea
          id="included"
          name="included"
          rows={4}
          defaultValue={(tour?.included ?? []).join("\n")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="itinerary" className={labelClass}>
          Itinerary{" "}
          <span className="font-normal text-muted-foreground">
            (one day per line, format: Title :: Description)
          </span>
        </label>
        <textarea
          id="itinerary"
          name="itinerary"
          rows={5}
          defaultValue={itineraryText}
          className={inputClass}
          placeholder={"Arrival & cruise :: Transfer to the harbor and board the junk.\nSunrise & return :: Tai chi on deck, then transfer back."}
        />
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={tour?.featured ?? false}
            className="h-4 w-4 accent-foreground"
          />
          Featured tour
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="published"
            defaultChecked={tour?.published ?? true}
            className="h-4 w-4 accent-foreground"
          />
          Published (visible on site)
        </label>
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-6">
        <SubmitButton label={tour ? "Save changes" : "Create tour"} />
        <Link
          href="/admin"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
