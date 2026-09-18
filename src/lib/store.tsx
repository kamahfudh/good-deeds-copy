import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { ALL_DAYS, DEEDS, getDeedById, type CategoryId, type DayCode, type PrayerCode } from "./data"
import type { CategoryResult } from "./questionnaire"

export interface Subscription {
  id: string
  deedId: string
  days: DayCode[]
  time: string
  createdAt: number
  prayers?: PrayerCode[]
}

export interface Completion {
  id: string
  deedId: string
  subscriptionId: string
  completedAt: number
  points: number
  // Set only for mosque check-in deeds (Congregational Prayer, Jumu'ah) —
  // captured from the live check-in at the moment of completion.
  mosqueStayMs?: number
  prayer?: PrayerCode
  masjidLocation?: string
}

export interface MosqueCompletionInfo {
  mosqueStayMs?: number
  prayer?: PrayerCode
  masjidLocation?: string
}

export interface AssessmentResult {
  deedIds: string[]
  categoryResults: Partial<Record<CategoryId, CategoryResult>>
  completedAt: number
}

interface StoreShape {
  subscriptions: Subscription[]
  completions: Completion[]
  assessment: AssessmentResult | null
}

const STORAGE_KEY = "good-deeds:v2"

function loadStore(): StoreShape {
  if (typeof window === "undefined") return { subscriptions: [], completions: [], assessment: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedDefaults()
    const parsed = JSON.parse(raw) as StoreShape
    if (!parsed.subscriptions || !parsed.completions) return seedDefaults()
    const hasValidAssessment =
      parsed.assessment != null && typeof parsed.assessment === "object" && "categoryResults" in parsed.assessment
    // Flexible-schedule deeds are never subscribed to under the current model
    // (they're auto-active via flexSubscriptionId) — drop any subscription
    // left over from before that change so it doesn't linger in My Deeds
    // with no way left in the UI to remove it, and remap its past
    // completions onto the pseudo id so their stats aren't lost.
    const staleFlexSubIds = new Set(
      parsed.subscriptions.filter((s) => getDeedById(s.deedId)?.flexibleSchedule).map((s) => s.id),
    )
    const subscriptions = staleFlexSubIds.size
      ? parsed.subscriptions.filter((s) => !staleFlexSubIds.has(s.id))
      : parsed.subscriptions
    const completions = staleFlexSubIds.size
      ? parsed.completions.map((c) =>
          staleFlexSubIds.has(c.subscriptionId) ? { ...c, subscriptionId: flexSubscriptionId(c.deedId) } : c,
        )
      : parsed.completions
    return { ...parsed, subscriptions, completions, assessment: hasValidAssessment ? parsed.assessment : null }
  } catch {
    return seedDefaults()
  }
}

function seedDefaults(): StoreShape {
  const now = Date.now()
  const day = todayCode()
  const monThu = getDeedById("deed_salah_013")!
  const dhuha = getDeedById("deed_salah_008")!
  const sadaqah = getDeedById("deed_quran_004")!
  const subs: Subscription[] = [
    {
      id: "seed-sub-1",
      deedId: monThu.id,
      days: monThu.suggestedDays,
      time: monThu.suggestedTime,
      createdAt: now - 1000 * 60 * 60 * 24 * 20,
    },
    {
      id: "seed-sub-2",
      deedId: dhuha.id,
      days: dhuha.suggestedDays,
      time: dhuha.suggestedTime,
      createdAt: now - 1000 * 60 * 60 * 24 * 100,
    },
    {
      id: "seed-sub-3",
      deedId: sadaqah.id,
      days: sadaqah.suggestedDays,
      time: sadaqah.suggestedTime,
      createdAt: now - 1000 * 60 * 60 * 24 * 4,
    },
  ]
  const completions: Completion[] = []
  // 92 days of Duha keeps the seeded totalPoints inside the Steadfast tier
  // (2,000–4,999 pts) by default: 92*25 + 2*80 + 40 = 2,500.
  for (let i = 1; i <= 92; i++) {
    completions.push({
      id: `seed-c-dhuha-${i}`,
      deedId: dhuha.id,
      subscriptionId: "seed-sub-2",
      completedAt: now - 1000 * 60 * 60 * 24 * i,
      points: dhuha.points,
    })
  }
  completions.push({
    id: "seed-c-monthu-1",
    deedId: monThu.id,
    subscriptionId: "seed-sub-1",
    completedAt: now - 1000 * 60 * 60 * 24 * 3,
    points: monThu.points,
  })
  completions.push({
    id: "seed-c-monthu-2",
    deedId: monThu.id,
    subscriptionId: "seed-sub-1",
    completedAt: now - 1000 * 60 * 60 * 24 * 6,
    points: monThu.points,
  })
  completions.push({
    id: "seed-c-sadaqah-1",
    deedId: sadaqah.id,
    subscriptionId: "seed-sub-3",
    completedAt: now - 1000 * 60 * 60 * 24 * 1,
    points: sadaqah.points,
  })
  void day
  return { subscriptions: subs, completions, assessment: null }
}

function saveStore(store: StoreShape) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// A flexible-schedule deed (e.g. Salat al-Kusuf, Sajdah al-Shukr) is never
// added as a real Subscription — there's no schedule to subscribe to, so it
// shouldn't clutter My Deeds. It's tracked under this deterministic pseudo
// subscription id instead, letting completedToday/currentStreak/completionsFor
// work unchanged without a Subscription record ever existing for it.
export function flexSubscriptionId(deedId: string): string {
  return `flex-${deedId}`
}

export function todayCode(): DayCode {
  const idx = new Date().getDay()
  return ALL_DAYS[(idx + 6) % 7]
}

export function nextOccurrence(days: DayCode[]): { code: DayCode; inDays: number } | null {
  if (days.length === 0) return null
  const todayIdx = ALL_DAYS.indexOf(todayCode())
  let best: { code: DayCode; inDays: number } | null = null
  for (const d of days) {
    const idx = ALL_DAYS.indexOf(d)
    let diff = idx - todayIdx
    if (diff <= 0) diff += 7
    if (!best || diff < best.inDays) best = { code: d, inDays: diff }
  }
  return best
}

function isSameCalendarDay(a: number, b: number) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

interface StoreApi extends StoreShape {
  totalPoints: number
  addSubscription: (deedId: string, days: DayCode[], time: string, prayers?: PrayerCode[]) => void
  removeSubscription: (id: string) => void
  updateSubscription: (id: string, days: DayCode[], time: string, prayers?: PrayerCode[]) => void
  getSubscriptionForDeed: (deedId: string) => Subscription | undefined
  completeSubscription: (subscriptionId: string, mosqueInfo?: MosqueCompletionInfo) => void
  completeDeed: (deedId: string, mosqueInfo?: MosqueCompletionInfo) => void
  completionsFor: (subscriptionId: string) => Completion[]
  completedToday: (subscriptionId: string) => boolean
  currentStreak: (subscriptionId: string) => number
  saveAssessment: (result: AssessmentResult) => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function GoodDeedsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreShape>(() => loadStore())

  useEffect(() => {
    saveStore(store)
  }, [store])

  const addSubscription = useCallback((deedId: string, days: DayCode[], time: string, prayers?: PrayerCode[]) => {
    setStore((prev) => ({
      ...prev,
      subscriptions: [
        ...prev.subscriptions,
        {
          id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          deedId,
          days,
          time,
          createdAt: Date.now(),
          ...(prayers ? { prayers } : {}),
        },
      ],
    }))
  }, [])

  const removeSubscription = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.id !== id),
      completions: prev.completions.filter((c) => c.subscriptionId !== id),
    }))
  }, [])

  const updateSubscription = useCallback((id: string, days: DayCode[], time: string, prayers?: PrayerCode[]) => {
    setStore((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? { ...s, days, time, ...(prayers ? { prayers } : {}) } : s,
      ),
    }))
  }, [])

  const completeSubscription = useCallback(
    (subscriptionId: string, mosqueInfo?: MosqueCompletionInfo) => {
      const sub = store.subscriptions.find((s) => s.id === subscriptionId)
      if (!sub) return
      const deed = getDeedById(sub.deedId)
      if (!deed) return
      setStore((prev) => ({
        ...prev,
        completions: [
          ...prev.completions,
          {
            id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            deedId: sub.deedId,
            subscriptionId,
            completedAt: Date.now(),
            points: deed.points,
            ...mosqueInfo,
          },
        ],
      }))
    },
    [store.subscriptions],
  )

  // For flexible-schedule deeds, which are always available to log without
  // ever being subscribed to — see flexSubscriptionId.
  const completeDeed = useCallback((deedId: string, mosqueInfo?: MosqueCompletionInfo) => {
    const deed = getDeedById(deedId)
    if (!deed) return
    setStore((prev) => ({
      ...prev,
      completions: [
        ...prev.completions,
        {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          deedId,
          subscriptionId: flexSubscriptionId(deedId),
          completedAt: Date.now(),
          points: deed.points,
          ...mosqueInfo,
        },
      ],
    }))
  }, [])

  const saveAssessment = useCallback((result: AssessmentResult) => {
    setStore((prev) => ({ ...prev, assessment: result }))
  }, [])

  const value = useMemo<StoreApi>(() => {
    const totalPoints = store.completions.reduce((sum, c) => sum + c.points, 0)

    const completionsFor = (subscriptionId: string) =>
      store.completions
        .filter((c) => c.subscriptionId === subscriptionId)
        .sort((a, b) => b.completedAt - a.completedAt)

    const completedToday = (subscriptionId: string) =>
      store.completions.some(
        (c) => c.subscriptionId === subscriptionId && isSameCalendarDay(c.completedAt, Date.now()),
      )

    const currentStreak = (subscriptionId: string) => {
      const items = completionsFor(subscriptionId)
      if (items.length === 0) return 0
      let streak = 0
      const seenDays = new Set<string>()
      for (const c of items) {
        const key = new Date(c.completedAt).toDateString()
        seenDays.add(key)
      }
      const cursor = new Date()
      // if not completed today, streak still counts back from yesterday
      if (!seenDays.has(cursor.toDateString())) {
        cursor.setDate(cursor.getDate() - 1)
      }
      while (seenDays.has(cursor.toDateString())) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }
      return streak
    }

    return {
      subscriptions: store.subscriptions,
      completions: store.completions,
      assessment: store.assessment,
      totalPoints,
      addSubscription,
      removeSubscription,
      updateSubscription,
      getSubscriptionForDeed: (deedId: string) =>
        store.subscriptions.find((s) => s.deedId === deedId),
      completeSubscription,
      completeDeed,
      completionsFor,
      completedToday,
      currentStreak,
      saveAssessment,
    }
  }, [
    store,
    addSubscription,
    removeSubscription,
    updateSubscription,
    completeSubscription,
    completeDeed,
    saveAssessment,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useGoodDeeds() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useGoodDeeds must be used within GoodDeedsProvider")
  return ctx
}

export function totalPossibleDeeds() {
  return DEEDS.length
}
