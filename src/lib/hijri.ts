const STORAGE_KEY = "good-deeds:hijri-offset:v1"
const MIN_OFFSET = -3
const MAX_OFFSET = 3

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
]

export interface HijriDate {
  day: number
  month: number
  year: number
}

// Kuwaiti algorithm — a tabular (arithmetic) Islamic calendar conversion, not
// real moon-sighting. It can land a day or two off local sighting, which is
// exactly why the manual offset below exists: most prayer apps let users
// nudge the date to match their mosque's announced start of the month.
export function gregorianToHijri(date: Date): HijriDate {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  const jd =
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d -
    32075

  let l = jd - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  l = l - 10631 * n + 354
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238)
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29
  const month = Math.floor((24 * l) / 709)
  const day = l - Math.floor((709 * month) / 24)
  const year = 30 * n + j - 30

  return { day, month, year }
}

export function formatHijri({ day, month, year }: HijriDate): string {
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year} AH`
}

export function getHijriOffset(): number {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const n = raw ? parseInt(raw, 10) : 0
  return Number.isFinite(n) ? Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, n)) : 0
}

export function setHijriOffset(offset: number): void {
  window.localStorage.setItem(STORAGE_KEY, String(Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, offset))))
}

export function hijriDateForToday(offsetDays: number): HijriDate {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return gregorianToHijri(d)
}

export { MIN_OFFSET as HIJRI_MIN_OFFSET, MAX_OFFSET as HIJRI_MAX_OFFSET }
