import { useNavigate } from "react-router-dom"
import { ArrowLeft, Info } from "@phosphor-icons/react"
import clsx from "clsx"
import { CATEGORIES, DEEDS } from "../lib/data"
import { CATEGORY_ICONS } from "../components/icons"
import { accentClasses } from "../lib/colors"

export function PointsDeedsEarning() {
  const navigate = useNavigate()

  const categoryRanges = CATEGORIES.map((category) => {
    const points = DEEDS.filter((d) => d.category === category.id).map((d) => d.points)
    return { category, min: Math.min(...points), max: Math.max(...points) }
  })

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">Good Deeds Activity</p>
        <span className="inline-flex w-10" />
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="tap-scale mb-5 hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink lg:inline-flex"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <p className="mt-4 text-sm text-ink-faint lg:mt-0">
        Earn points by completing deeds across every category.
      </p>

      <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3.5">
        <Info weight="fill" className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="text-sm text-ink-muted">
          Deed completions have <span className="font-semibold text-ink">no weekly cap</span>.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {categoryRanges.map(({ category, min, max }) => {
          const classes = accentClasses(category.color)
          const Icon = CATEGORY_ICONS[category.id]
          return (
            <div
              key={category.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
            >
              <span className={clsx("flex size-9 shrink-0 items-center justify-center rounded-full", classes.bg, classes.text)}>
                <Icon weight="fill" className="size-4" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-medium text-ink">Complete {category.label} deeds</p>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-amber">
                +{min}–{max} pts
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
