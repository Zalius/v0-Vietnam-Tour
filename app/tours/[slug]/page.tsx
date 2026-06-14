import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, Check, Clock, MapPin, Users, Mountain } from "lucide-react"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/sections/footer-section"
import { FadeImage } from "@/components/fade-image"
import { getTourBySlug, getPublishedTours, formatPrice } from "@/lib/tours"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) return { title: "Tour not found" }
  return {
    title: `${tour.title} | EVASION Vietnam`,
    description: tour.summary,
  }
}

export async function generateStaticParams() {
  const tours = await getPublishedTours()
  return tours.map((tour) => ({ slug: tour.slug }))
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour || !tour.published) notFound()

  const stats = [
    { icon: Clock, label: "Duration", value: `${tour.durationDays} days` },
    { icon: Users, label: "Group size", value: `Up to ${tour.maxGroupSize}` },
    { icon: Mountain, label: "Difficulty", value: tour.difficulty },
    { icon: MapPin, label: "Region", value: tour.region },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[460px] w-full overflow-hidden">
        <FadeImage
          src={tour.mainImage || "/placeholder.svg"}
          alt={tour.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 md:px-12 lg:px-20">
          <p className="mb-3 text-xs uppercase tracking-widest text-white/80">
            {tour.region}
          </p>
          <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight text-white text-balance md:text-5xl lg:text-6xl">
            {tour.title}
          </h1>
        </div>
      </section>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <Link
          href="/#tours"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          All tours
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-px border-y border-border bg-border md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background px-6 py-6 md:px-8">
            <stat.icon size={20} className="mb-3 text-muted-foreground" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-12 px-6 py-16 md:px-12 lg:grid-cols-3 lg:gap-16 lg:px-20">
        {/* Main column */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-medium tracking-tight text-foreground">
            About this journey
          </h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
            {tour.description || tour.summary}
          </p>

          {tour.highlights.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-medium tracking-tight text-foreground">
                Highlights
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tour.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="mt-0.5 shrink-0 text-foreground"
                    />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.itinerary.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-medium tracking-tight text-foreground">
                Itinerary
              </h3>
              <ol className="mt-6 border-l border-border">
                {tour.itinerary.map((day) => (
                  <li key={day.day} className="relative pb-8 pl-8 last:pb-0">
                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                      {day.day}
                    </span>
                    <h4 className="text-base font-medium text-foreground">
                      {day.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {day.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tour.gallery.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-medium tracking-tight text-foreground">
                Gallery
              </h3>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                {tour.gallery.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-secondary"
                  >
                    <FadeImage
                      src={src || "/placeholder.svg"}
                      alt={`${tour.title} photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-border p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              From
            </p>
            <p className="mt-1 text-3xl font-medium text-foreground">
              {formatPrice(tour.price)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / person
              </span>
            </p>

            <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Starts</dt>
                <dd className="text-foreground">{tour.startLocation || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ends</dt>
                <dd className="text-foreground">{tour.endLocation || "—"}</dd>
              </div>
            </dl>

            {tour.included.length > 0 && (
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  What&apos;s included
                </p>
                <ul className="mt-3 space-y-2">
                  {tour.included.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-foreground" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <a
              href={`mailto:hello@evasion-vietnam.com?subject=${encodeURIComponent(
                `Booking enquiry: ${tour.title}`,
              )}`}
              className="mt-6 block w-full rounded-full bg-foreground px-5 py-3 text-center text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Enquire to book
            </a>
          </div>
        </aside>
      </div>

      <FooterSection />
    </main>
  )
}
