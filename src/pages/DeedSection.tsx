import { Navigate, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookBookmark, ListChecks, Sparkle } from "@phosphor-icons/react"
import { getCategory, getDeedById } from "../lib/data"
import { useGoodDeeds } from "../lib/store"

const SECTION_META = {
  "how-to": { title: "How to do it", icon: ListChecks },
  benefit: { title: "Benefit & virtue", icon: Sparkle },
  references: { title: "References", icon: BookBookmark },
} as const

type SectionKey = keyof typeof SECTION_META

export function DeedSection() {
  const { id, section } = useParams<{ id: string; section: string }>()
  const navigate = useNavigate()
  const { totalPoints } = useGoodDeeds()
  const deed = id ? getDeedById(id) : undefined
  const meta = section && section in SECTION_META ? SECTION_META[section as SectionKey] : undefined

  if (!deed || !meta) {
    return <Navigate to={id ? `/deeds/${id}` : "/"} replace />
  }

  const category = getCategory(deed.category)
  const Icon = meta.icon

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8 lg:max-w-4xl lg:px-10 lg:pt-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">{meta.title}</p>
        <span className="inline-flex w-14 items-center justify-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-semibold tabular-nums text-amber">
            <Sparkle weight="fill" className="size-3.5" />
            {totalPoints}
          </span>
        </span>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Icon weight="fill" className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{deed.title}</p>
            <p className="text-xs text-ink-faint">
              {category.shortLabel} &middot; {deed.subCategory}
            </p>
          </div>
        </div>

        <div className="mt-5">
          {section === "how-to" && (
            <ol className="flex flex-col gap-3">
              {deed.howTo.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-ink">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {section === "benefit" && (
            <p className="text-[15px] leading-relaxed text-ink-muted">{deed.benefit}</p>
          )}

          {section === "references" && (
            <div className="flex flex-col gap-3">
              {deed.references.map((ref, i) => (
                <figure
                  key={i}
                  className="relative rounded-2xl border border-border bg-surface-raised p-4 pl-11 sm:p-5 sm:pl-12"
                >
                  <BookBookmark
                    weight="fill"
                    className="absolute left-4 top-4 size-4 text-ink-faint sm:left-5 sm:top-5"
                  />
                  <blockquote className="text-[15px] italic leading-relaxed text-ink">{ref.quote}</blockquote>
                  <figcaption className="mt-2 text-xs font-medium text-ink-faint">{ref.source}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
