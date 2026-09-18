import { CloudMoon, CloudSun, MoonStars, Sun, SunHorizon, type Icon } from "@phosphor-icons/react"
import clsx from "clsx"
import { ALL_PRAYERS, PRAYER_LABELS, type PrayerCode } from "../lib/data"
import { accentClasses, type AccentColor } from "../lib/colors"

const PRAYER_ICONS: Record<PrayerCode, Icon> = {
  fajr: CloudMoon,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: SunHorizon,
  isha: MoonStars,
}

const PRAYER_COLORS: Record<PrayerCode, AccentColor> = {
  fajr: "cyan",
  dhuhr: "amber",
  asr: "amber",
  maghrib: "rose",
  isha: "violet",
}

export function PrayerPicker({
  selected,
  onChange,
}: {
  selected: PrayerCode[]
  onChange: (prayers: PrayerCode[]) => void
}) {
  function toggle(prayer: PrayerCode) {
    if (selected.includes(prayer)) {
      onChange(selected.filter((p) => p !== prayer))
    } else {
      onChange([...ALL_PRAYERS].filter((p) => selected.includes(p) || p === prayer))
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
      {ALL_PRAYERS.map((prayer, i) => {
        const active = selected.includes(prayer)
        const Icon = PRAYER_ICONS[prayer]
        const classes = accentClasses(PRAYER_COLORS[prayer])

        return (
          <button
            key={prayer}
            type="button"
            onClick={() => toggle(prayer)}
            aria-pressed={active}
            className={clsx(
              "tap-scale flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface",
              i > 0 && "border-t border-border",
            )}
          >
            <span
              className={clsx(
                "flex size-10 shrink-0 items-center justify-center rounded-full transition-opacity",
                classes.bg,
                classes.text,
                !active && "opacity-40",
              )}
            >
              <Icon weight={active ? "fill" : "regular"} className="size-5" />
            </span>
            <span className={clsx("flex-1 text-sm font-semibold", active ? "text-ink" : "text-ink-faint")}>
              {PRAYER_LABELS[prayer]}
            </span>
            <span
              className={clsx(
                "relative h-6 w-10 shrink-0 rounded-full transition-colors",
                active ? "bg-brand" : "bg-surface",
              )}
            >
              <span
                className={clsx(
                  "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                  active ? "left-[18px]" : "left-0.5",
                )}
              />
            </span>
          </button>
        )
      })}
    </div>
  )
}
