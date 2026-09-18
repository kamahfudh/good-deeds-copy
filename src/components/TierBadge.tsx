import clsx from "clsx"
import type { BadgeTier } from "../lib/badges"

const SEAL_CLIP_PATH = (() => {
  const cusps = 14
  const outerR = 50
  const innerR = 41
  const points: string[] = []
  for (let i = 0; i < cusps * 2; i++) {
    const angle = (Math.PI * i) / cusps
    const r = i % 2 === 0 ? outerR : innerR
    const x = 50 + r * Math.sin(angle)
    const y = 50 - r * Math.cos(angle)
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`)
  }
  return `polygon(${points.join(", ")})`
})()

export function TierBadge({
  tier,
  state = "reached",
  size = "md",
  className,
}: {
  tier: BadgeTier
  state?: "current" | "reached" | "locked"
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}) {
  const Icon = tier.icon

  return (
    <span
      className={clsx(
        "relative flex shrink-0 items-center justify-center",
        size === "xs" && "size-5",
        size === "sm" && "size-7",
        size === "md" && "size-10",
        size === "lg" && "size-14",
        className,
      )}
    >
      <span
        aria-hidden
        style={{ clipPath: SEAL_CLIP_PATH }}
        className={clsx(
          "absolute inset-0",
          state === "current" &&
            "bg-gradient-to-br from-[#FFBE4C] to-[#FFBE4C]/60 shadow-[0_0_0_1px_rgba(255,190,76,0.35)]",
          state === "reached" && "bg-gradient-to-br from-[#28806F] to-[#28806F]/60",
          state === "locked" && "bg-surface-raised",
        )}
      />
      <Icon
        weight="fill"
        className={clsx(
          "relative",
          state === "current" && "text-[#0D0D12]",
          state === "reached" && "text-white",
          state === "locked" && "text-ink-faint",
          size === "xs" && "size-2.5",
          size === "sm" && "size-3.5",
          size === "md" && "size-5",
          size === "lg" && "size-7",
        )}
      />
    </span>
  )
}
