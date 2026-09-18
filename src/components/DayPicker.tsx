import clsx from "clsx"
import { ALL_DAYS, type DayCode } from "../lib/data"

export const FULL_DAY_LABELS: Record<DayCode, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
}

export function DayPicker({
  selected,
  onChange,
  days = ALL_DAYS,
}: {
  selected: DayCode[]
  onChange: (days: DayCode[]) => void
  // Restricts which days are offered as choices — e.g. a Monday/Thursday
  // fast only ever makes sense on those two days, so there's no reason to
  // show the other five as pickable options.
  days?: DayCode[]
}) {
  function toggle(day: DayCode) {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day))
    } else {
      onChange([...days].filter((d) => selected.includes(d) || d === day))
    }
  }

  const fullWeek = days.length === ALL_DAYS.length

  return (
    <div className={clsx(fullWeek ? "grid grid-cols-7 gap-1.5 sm:gap-2" : "flex gap-1.5 sm:gap-2")}>
      {days.map((day) => {
        const active = selected.includes(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            aria-pressed={active}
            className={clsx(
              "tap-scale flex h-11 flex-col items-center justify-center rounded-xl border text-xs font-semibold transition-colors sm:h-12 sm:text-sm",
              !fullWeek && "flex-1",
              active
                ? "border-brand bg-brand text-white shadow-[0_8px_20px_-8px_rgba(57,70,234,0.7)]"
                : "border-border bg-surface-raised text-ink-muted hover:border-border-strong hover:text-ink",
            )}
          >
            {fullWeek ? day.slice(0, 2) : FULL_DAY_LABELS[day]}
          </button>
        )
      })}
    </div>
  )
}
