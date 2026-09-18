import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, CalendarStar, Minus, Plus } from "@phosphor-icons/react"
import clsx from "clsx"
import {
  formatHijri,
  getHijriOffset,
  hijriDateForToday,
  setHijriOffset,
  HIJRI_MIN_OFFSET,
  HIJRI_MAX_OFFSET,
} from "../lib/hijri"
import { useToast } from "../lib/toastStore"

export function HijriDateSettings() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [offset, setOffset] = useState(() => getHijriOffset())

  const today = new Date()
  const gregorianLabel = today.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const hijriLabel = formatHijri(hijriDateForToday(offset))

  function adjust(delta: number) {
    const next = Math.max(HIJRI_MIN_OFFSET, Math.min(HIJRI_MAX_OFFSET, offset + delta))
    if (next === offset) return
    setOffset(next)
    setHijriOffset(next)
    showToast(next === 0 ? "Hijri date adjustment cleared." : `Hijri date adjusted by ${next > 0 ? "+" : ""}${next} day${Math.abs(next) === 1 ? "" : "s"}.`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">Hijri Date</p>
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

      <div className="mt-6 flex flex-col items-center text-center lg:mt-0">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-cyan-soft text-cyan">
          <CalendarStar weight="fill" className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-ink">Hijri date adjustment</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-faint">
          The Islamic calendar is calculated, not observed, so it can land a day off your local mosque's moon
          sighting. Nudge it here to match.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-surface p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{gregorianLabel}</p>
        <p className="mt-2 text-2xl font-extrabold text-cyan">{hijriLabel}</p>

        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={offset <= HIJRI_MIN_OFFSET}
            aria-label="Subtract one day"
            className={clsx(
              "tap-scale flex size-11 items-center justify-center rounded-full border transition-colors",
              offset <= HIJRI_MIN_OFFSET
                ? "cursor-not-allowed border-border text-ink-faint/40"
                : "border-border-strong text-ink hover:bg-surface-raised",
            )}
          >
            <Minus weight="bold" className="size-4" />
          </button>

          <div className="w-16">
            <p className="text-2xl font-extrabold tabular-nums text-ink">{offset > 0 ? `+${offset}` : offset}</p>
            <p className="text-[11px] text-ink-faint">day{Math.abs(offset) === 1 ? "" : "s"}</p>
          </div>

          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={offset >= HIJRI_MAX_OFFSET}
            aria-label="Add one day"
            className={clsx(
              "tap-scale flex size-11 items-center justify-center rounded-full border transition-colors",
              offset >= HIJRI_MAX_OFFSET
                ? "cursor-not-allowed border-border text-ink-faint/40"
                : "border-border-strong text-ink hover:bg-surface-raised",
            )}
          >
            <Plus weight="bold" className="size-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 px-1 text-center text-xs text-ink-faint">
        Adjustable from {HIJRI_MIN_OFFSET} to +{HIJRI_MAX_OFFSET} days. This only changes how the date displays here —
        it doesn't affect your deed schedule.
      </p>
    </div>
  )
}
