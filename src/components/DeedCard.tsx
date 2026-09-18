import { Link } from "react-router-dom"
import { CaretRight, CheckCircle, Clock } from "@phosphor-icons/react"
import type { Deed } from "../lib/data"
import { CategoryBadge } from "./CategoryBadge"
import { PointsPill } from "./PointsPill"
import { useGoodDeeds } from "../lib/store"

export function DeedCard({ deed }: { deed: Deed }) {
  const { getSubscriptionForDeed } = useGoodDeeds()
  const subscribed = Boolean(getSubscriptionForDeed(deed.id))

  return (
    <Link
      to={`/deeds/${deed.id}`}
      className="tap-scale group relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong hover:bg-surface-raised sm:p-5"
    >
      <PointsPill points={deed.points} className="absolute right-4 top-4 sm:right-5 sm:top-5" />
      <div className="min-w-0 flex-1 pr-16">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <CategoryBadge categoryId={deed.category} />
          {subscribed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2.5 py-1 text-xs font-medium text-emerald">
              <CheckCircle weight="fill" className="size-3.5" />
              Added
            </span>
          )}
        </div>
        <h3 className="truncate text-[15px] font-semibold text-ink sm:text-base">{deed.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{deed.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {deed.frequencyLabel}
          </span>
        </div>
      </div>
      <CaretRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
