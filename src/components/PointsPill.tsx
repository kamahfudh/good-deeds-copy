import { Sparkle } from "@phosphor-icons/react"
import clsx from "clsx"

export function PointsPill({
  points,
  size = "sm",
  className,
}: {
  points: number
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border border-amber/25 bg-amber-soft font-semibold text-amber tabular-nums",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        size === "lg" && "px-4 py-2 text-base",
        className,
      )}
    >
      <Sparkle weight="fill" className={size === "lg" ? "size-4" : "size-3.5"} />
      {points} pts
    </span>
  )
}
