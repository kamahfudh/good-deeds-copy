import type { PrayerCode } from "./data"

const STORAGE_KEY = "good-deeds:prayer-settings:v1"

export type CalculationMethod = "mwl" | "isna" | "egyptian" | "makkah" | "karachi"
export type Madhab = "standard" | "hanafi"

export const CALCULATION_METHODS: { value: CalculationMethod; label: string; region: string }[] = [
  { value: "mwl", label: "Muslim World League", region: "Europe, Far East, parts of the US" },
  { value: "isna", label: "Islamic Society of North America", region: "North America" },
  { value: "egyptian", label: "Egyptian General Authority", region: "Africa, Syria, Iraq, Lebanon" },
  { value: "makkah", label: "Umm al-Qura, Makkah", region: "Arabian Peninsula" },
  { value: "karachi", label: "University of Islamic Sciences, Karachi", region: "Pakistan, Bangladesh, India, Afghanistan" },
]

export interface PrayerAdjustments {
  fajr: number
  dhuhr: number
  asr: number
  maghrib: number
  isha: number
}

export interface PrayerSettingsRecord {
  calculationMethod: CalculationMethod
  madhab: Madhab
  adjustments: PrayerAdjustments
}

export const DEFAULT_PRAYER_SETTINGS: PrayerSettingsRecord = {
  calculationMethod: "mwl",
  madhab: "standard",
  adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
}

export function getPrayerSettings(): PrayerSettingsRecord {
  if (typeof window === "undefined") return DEFAULT_PRAYER_SETTINGS
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_PRAYER_SETTINGS
  try {
    const parsed = JSON.parse(raw) as Partial<PrayerSettingsRecord>
    return {
      ...DEFAULT_PRAYER_SETTINGS,
      ...parsed,
      adjustments: { ...DEFAULT_PRAYER_SETTINGS.adjustments, ...parsed.adjustments },
    }
  } catch {
    return DEFAULT_PRAYER_SETTINGS
  }
}

export function savePrayerSettings(settings: PrayerSettingsRecord): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// Approximate local-clock windows each prayer's time typically falls in —
// used to auto-detect which of the five daily prayers a mosque check-in is
// for, without needing a full astronomical prayer-time calculation.
const PRAYER_START_HOUR: Record<PrayerCode, number> = {
  fajr: 5,
  dhuhr: 12.25,
  asr: 15.5,
  maghrib: 18.25,
  isha: 19.75,
}

export function detectCurrentPrayer(now: Date = new Date()): PrayerCode {
  const hour = now.getHours() + now.getMinutes() / 60
  const order: PrayerCode[] = ["isha", "maghrib", "asr", "dhuhr", "fajr"]
  for (const prayer of order) {
    if (hour >= PRAYER_START_HOUR[prayer]) return prayer
  }
  // Before fajr, it's still within the previous night's Isha window.
  return "isha"
}
