import { useNavigate } from "react-router-dom"
import { ArrowLeft, Certificate, Info, PaintBrush, Palette, Sparkle } from "@phosphor-icons/react"
import clsx from "clsx"
import { useGoodDeeds } from "../lib/store"

interface RewardItem {
  id: string
  title: string
  description: string
  cost: number
  icon: typeof Sparkle
}

const REWARDS: RewardItem[] = [
  {
    id: "certificate",
    title: "Monthly reflection certificate",
    description: "A printable summary of your deeds and streaks for the month",
    cost: 500,
    icon: Certificate,
  },
  {
    id: "theme",
    title: "Custom accent theme",
    description: "Unlock an alternate accent color for your app",
    cost: 1000,
    icon: Palette,
  },
  {
    id: "journal",
    title: "Guided reflection journal",
    description: "A printable set of weekly reflection prompts",
    cost: 1500,
    icon: PaintBrush,
  },
  {
    id: "flair",
    title: "Luminary profile flair",
    description: "A gold badge next to your name on Social",
    cost: 5000,
    icon: Sparkle,
  },
]

export function PointsRewards() {
  const navigate = useNavigate()
  const { totalPoints } = useGoodDeeds()

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
        <p className="text-[17px] font-bold text-ink">Redeem Rewards</p>
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

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3.5 lg:mt-0">
        <Info weight="fill" className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="text-sm text-ink-muted">
          Redemption is coming soon. Here's a preview of what you'll be able to unlock with your points.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {REWARDS.map((reward) => {
          const unlocked = totalPoints >= reward.cost
          const Icon = reward.icon
          return (
            <div
              key={reward.id}
              className={clsx(
                "flex items-center gap-3.5 rounded-2xl border p-4",
                unlocked ? "border-emerald/25 bg-emerald-soft/40" : "border-border bg-surface",
              )}
            >
              <span
                className={clsx(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                  unlocked ? "bg-emerald-soft text-emerald" : "bg-surface-raised text-ink-faint",
                )}
              >
                <Icon weight="fill" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{reward.title}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{reward.description}</p>
              </div>
              <span
                className={clsx(
                  "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
                  unlocked ? "border-emerald/25 bg-emerald-soft text-emerald" : "border-amber/25 bg-amber-soft text-amber",
                )}
              >
                {reward.cost.toLocaleString()} pts
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
