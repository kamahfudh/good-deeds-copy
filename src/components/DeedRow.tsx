import { Link } from "react-router-dom"
import { CaretRight, CheckCircle, Clock } from "@phosphor-icons/react"
import clsx from "clsx"
import { getCategory, type Deed } from "../lib/data"
import { accentClasses } from "../lib/colors"
import { CATEGORY_ICONS } from "./icons"
import { DEED_ICONS } from "../lib/deedIcons"
import { PointsPill } from "./PointsPill"
import { useGoodDeeds } from "../lib/store"

export function DeedRow({ deed }: { deed: Deed }) {
  const { getSubscriptionForDeed } = useGoodDeeds()
  const subscribed = Boolean(getSubscriptionForDeed(deed.id))
  const category = getCategory(deed.category)
  const classes = accentClasses(category.color)
  const Icon = DEED_ICONS[deed.id] ?? CATEGORY_ICONS[deed.category]

  return (
    <Link
      to={`/deeds/${deed.id}`}
      className={clsx(
        "tap-scale group flex items-center gap-3.5 rounded-2xl border px-3.5 py-3.5 transition-colors duration-150",
        subscribed
          ? clsx(classes.border, classes.bg)
          : "border-border bg-surface-raised/50 hover:border-border-strong hover:bg-surface-raised",
      )}
    >
      <span
        className={clsx(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-150 group-hover:scale-105",
          subscribed ? classes.solidBg : clsx(classes.bg, classes.text),
        )}
      >
        <Icon weight="fill" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[14.5px] font-semibold text-ink">{deed.title}</span>
          {subscribed && <CheckCircle weight="fill" className="size-3.5 shrink-0 text-emerald" />}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
          <Clock className="size-3" />
          {deed.frequencyLabel}
        </span>
      </span>
      <PointsPill points={deed.points} />
      <CaretRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
