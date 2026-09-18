import type { ReactNode } from "react"

export function CircularTimer({
  progress,
  size = 240,
  strokeWidth = 14,
  tone = "brand",
  children,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  tone?: "brand" | "emerald" | "muted"
  children?: ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, progress))
  const offset = circumference * (1 - clamped / 100)
  const strokeColor =
    tone === "emerald" ? "var(--color-emerald)" : tone === "muted" ? "var(--color-border-strong)" : "var(--color-brand)"

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-raised)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
