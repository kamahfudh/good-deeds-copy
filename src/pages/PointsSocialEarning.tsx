import { useNavigate } from "react-router-dom"
import { ArrowLeft, Info } from "@phosphor-icons/react"
import clsx from "clsx"
import { accentClasses } from "../lib/colors"
import { SOCIAL_WAYS_TO_EARN, SOCIAL_WEEKLY_CAP } from "../lib/socialEarning"

export function PointsSocialEarning() {
  const navigate = useNavigate()

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
        <p className="text-[17px] font-bold text-ink">Social Activity</p>
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
        Earn points by engaging with the community on Social.
      </p>

      <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3.5">
        <Info weight="fill" className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="text-sm text-ink-muted">
          Social activity is capped at <span className="font-semibold text-ink">{SOCIAL_WEEKLY_CAP} pts per week</span> — deed
          completions have no cap.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {SOCIAL_WAYS_TO_EARN.map((way) => {
          const classes = accentClasses(way.color)
          const Icon = way.icon
          return (
            <div
              key={way.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
            >
              <span className={clsx("flex size-9 shrink-0 items-center justify-center rounded-full", classes.bg, classes.text)}>
                <Icon weight="fill" className="size-4" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-medium text-ink">{way.label}</p>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-amber">+{way.points} pts</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
