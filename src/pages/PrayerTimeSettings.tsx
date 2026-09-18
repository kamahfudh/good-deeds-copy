import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, Check, Clock, Minus, Plus } from "@phosphor-icons/react"
import clsx from "clsx"
import {
  CALCULATION_METHODS,
  getPrayerSettings,
  savePrayerSettings,
  type CalculationMethod,
  type Madhab,
  type PrayerAdjustments,
} from "../lib/prayerSettings"
import { useToast } from "../lib/toastStore"

const ADJUSTMENT_ROWS: { key: keyof PrayerAdjustments; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
]

const ADJUSTMENT_MIN = -30
const ADJUSTMENT_MAX = 30

function formatMinutes(value: number): string {
  if (value === 0) return "No change"
  return `${value > 0 ? "+" : ""}${value} min`
}

export function PrayerTimeSettings() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [settings, setSettings] = useState(() => getPrayerSettings())

  function chooseMethod(value: CalculationMethod) {
    const next = { ...settings, calculationMethod: value }
    setSettings(next)
    savePrayerSettings(next)
  }

  function chooseMadhab(value: Madhab) {
    const next = { ...settings, madhab: value }
    setSettings(next)
    savePrayerSettings(next)
  }

  function adjust(key: keyof PrayerAdjustments, delta: number) {
    const current = settings.adjustments[key]
    const nextValue = Math.max(ADJUSTMENT_MIN, Math.min(ADJUSTMENT_MAX, current + delta))
    if (nextValue === current) return
    const next = { ...settings, adjustments: { ...settings.adjustments, [key]: nextValue } }
    setSettings(next)
    savePrayerSettings(next)
  }

  function resetAdjustments() {
    const next = { ...settings, adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 } }
    setSettings(next)
    savePrayerSettings(next)
    showToast("Prayer time adjustments reset.")
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
        <p className="text-[17px] font-bold text-ink">Prayer Time Settings</p>
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

      <div className="mt-6 flex flex-col items-center text-center lg:mt-0 lg:items-start lg:text-left">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Clock weight="fill" className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-ink">Prayer time settings</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-faint">
          Match your prayer times to your local mosque or preferred authority.
        </p>
      </div>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Calculation method</h2>
        <div className="mt-2 flex flex-col gap-2">
          {CALCULATION_METHODS.map((method) => {
            const active = settings.calculationMethod === method.value
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => chooseMethod(method.value)}
                className={clsx(
                  "tap-scale flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors",
                  active ? "border-brand/40 bg-brand-soft" : "border-border-strong bg-surface hover:border-border",
                )}
              >
                <span className="min-w-0 flex-1">
                  <p className={clsx("text-sm font-semibold", active ? "text-brand" : "text-ink")}>{method.label}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{method.region}</p>
                </span>
                {active && <Check weight="bold" className="mt-0.5 size-4 shrink-0 text-brand" />}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Asr madhab</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => chooseMadhab("standard")}
            className={clsx(
              "tap-scale rounded-2xl border p-3.5 text-left transition-colors",
              settings.madhab === "standard" ? "border-brand/40 bg-brand-soft" : "border-border-strong bg-surface hover:border-border",
            )}
          >
            <p className={clsx("text-sm font-semibold", settings.madhab === "standard" ? "text-brand" : "text-ink")}>Standard</p>
            <p className="mt-0.5 text-xs text-ink-faint">Shafi'i, Maliki, Hanbali</p>
          </button>
          <button
            type="button"
            onClick={() => chooseMadhab("hanafi")}
            className={clsx(
              "tap-scale rounded-2xl border p-3.5 text-left transition-colors",
              settings.madhab === "hanafi" ? "border-brand/40 bg-brand-soft" : "border-border-strong bg-surface hover:border-border",
            )}
          >
            <p className={clsx("text-sm font-semibold", settings.madhab === "hanafi" ? "text-brand" : "text-ink")}>Hanafi</p>
            <p className="mt-0.5 text-xs text-ink-faint">Later Asr start</p>
          </button>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Manual adjustments</h2>
          <button type="button" onClick={resetAdjustments} className="tap-scale text-xs font-semibold text-brand hover:underline">
            Reset
          </button>
        </div>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {ADJUSTMENT_ROWS.map((row) => {
            const value = settings.adjustments[row.key]
            return (
              <div key={row.key} className="flex items-center gap-3 px-4 py-3.5">
                <span className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  <p className="text-xs text-ink-faint">{formatMinutes(value)}</p>
                </span>
                <button
                  type="button"
                  onClick={() => adjust(row.key, -1)}
                  disabled={value <= ADJUSTMENT_MIN}
                  aria-label={`Decrease ${row.label} by one minute`}
                  className={clsx(
                    "tap-scale flex size-8 items-center justify-center rounded-full border",
                    value <= ADJUSTMENT_MIN
                      ? "cursor-not-allowed border-border text-ink-faint/40"
                      : "border-border-strong text-ink hover:bg-surface-raised",
                  )}
                >
                  <Minus weight="bold" className="size-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums text-ink">{value}</span>
                <button
                  type="button"
                  onClick={() => adjust(row.key, 1)}
                  disabled={value >= ADJUSTMENT_MAX}
                  aria-label={`Increase ${row.label} by one minute`}
                  className={clsx(
                    "tap-scale flex size-8 items-center justify-center rounded-full border",
                    value >= ADJUSTMENT_MAX
                      ? "cursor-not-allowed border-border text-ink-faint/40"
                      : "border-border-strong text-ink hover:bg-surface-raised",
                  )}
                >
                  <Plus weight="bold" className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
