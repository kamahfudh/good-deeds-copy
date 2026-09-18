import { Link } from "react-router-dom"
import { Sparkle } from "@phosphor-icons/react"
import clsx from "clsx"
import { useGoodDeeds } from "../lib/store"

export function PointsBadge({ className }: { className?: string }) {
  const { totalPoints } = useGoodDeeds()
  return (
    <Link
      to="/points"
      aria-label={`${totalPoints} points earned — view badge & rewards`}
      className={clsx(
        "tap-scale inline-flex items-center gap-1 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-semibold tabular-nums text-amber transition-colors hover:bg-amber-soft/80",
        className,
      )}
    >
      <Sparkle weight="fill" className="size-3.5" />
      {totalPoints}
    </Link>
  )
}
