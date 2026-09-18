import { Link } from "react-router-dom"
import { Clock } from "@phosphor-icons/react"
import clsx from "clsx"
import { getCategory, type Deed } from "../lib/data"
import { accentClasses } from "../lib/colors"
import { CATEGORY_ICONS } from "./icons"
import { DEED_ICONS } from "../lib/deedIcons"
import { PointsPill } from "./PointsPill"
import { useGoodDeeds } from "../lib/store"

export function DeedTile({ deed }: { deed: Deed }) {
  const { getSubscriptionForDeed } = useGoodDeeds()
  const subscribed = Boolean(getSubscriptionForDeed(deed.id))
  const category = getCategory(deed.category)
  const classes = accentClasses(category.color)
  const Icon = DEED_ICONS[deed.id] ?? CATEGORY_ICONS[deed.category]

  return (
    <Link
      to={`/deeds/${deed.id}`}
      className={clsx(
        "tap-scale group relative flex flex-col gap-3 rounded-2xl border p-4 transition-colors duration-150",
        subscribed
          ? clsx(classes.border, classes.bg)
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised",
      )}
    >
      {subscribed && (
        <span className="absolute right-3 top-3 rounded-full bg-emerald px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          Active
        </span>
      )}

      <span
        className={clsx(
          "flex size-12 shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform duration-150 group-hover:scale-105",
          classes.ring,
          subscribed ? classes.solidBg : clsx(classes.bg, classes.text),
        )}
      >
        <Icon weight="fill" className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink">
          {deed.title}
        </span>
        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock className="size-3" />
          {deed.frequencyLabel}
        </span>
      </span>

      <PointsPill points={deed.points} className="self-start" />
    </Link>
  )
}
