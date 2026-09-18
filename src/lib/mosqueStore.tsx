import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { GeoPoint } from "./geo"

const STORAGE_KEY = "good-deeds:mosque:v1"

interface CheckInRecord {
  startedAt: number
  dateKey: string
}

interface MosqueStoreShape {
  homeLocation: GeoPoint | null
  homeLocationName: string | null
  checkIns: Record<string, CheckInRecord>
}

function todayKey() {
  return new Date().toDateString()
}

function emptyStore(): MosqueStoreShape {
  return { homeLocation: null, homeLocationName: null, checkIns: {} }
}

function loadStore(): MosqueStoreShape {
  if (typeof window === "undefined") return emptyStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as Partial<MosqueStoreShape>
    return {
      homeLocation: parsed.homeLocation ?? null,
      homeLocationName: parsed.homeLocationName ?? null,
      checkIns: parsed.checkIns ?? {},
    }
  } catch {
    return emptyStore()
  }
}

function saveStore(store: MosqueStoreShape) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

interface MosqueApi {
  homeLocation: GeoPoint | null
  homeLocationName: string | null
  setHomeLocation: (point: GeoPoint, name?: string) => void
  clearHomeLocation: () => void
  getCheckIn: (subscriptionId: string) => CheckInRecord | null
  startCheckIn: (subscriptionId: string) => void
  endCheckIn: (subscriptionId: string) => void
  setCheckInStartedAt: (subscriptionId: string, startedAt: number) => void
}

const MosqueContext = createContext<MosqueApi | null>(null)

export function MosqueProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<MosqueStoreShape>(() => loadStore())

  useEffect(() => {
    saveStore(store)
  }, [store])

  const setHomeLocation = useCallback((point: GeoPoint, name?: string) => {
    setStore((prev) => ({
      ...prev,
      homeLocation: point,
      homeLocationName: name !== undefined ? name : prev.homeLocationName,
    }))
  }, [])

  const clearHomeLocation = useCallback(() => {
    setStore((prev) => ({ ...prev, homeLocation: null, homeLocationName: null }))
  }, [])

  const startCheckIn = useCallback((subscriptionId: string) => {
    setStore((prev) => ({
      ...prev,
      checkIns: { ...prev.checkIns, [subscriptionId]: { startedAt: Date.now(), dateKey: todayKey() } },
    }))
  }, [])

  const endCheckIn = useCallback((subscriptionId: string) => {
    setStore((prev) => {
      const next = { ...prev.checkIns }
      delete next[subscriptionId]
      return { ...prev, checkIns: next }
    })
  }, [])

  // Dev-only testing hook (see MosqueCheckIn.tsx's dev-mode button) — rewrites
  // an in-progress check-in's start time so the required-stay wait can be
  // fast-forwarded instead of waiting the real 10-15 minutes.
  const setCheckInStartedAt = useCallback((subscriptionId: string, startedAt: number) => {
    setStore((prev) => {
      const existing = prev.checkIns[subscriptionId]
      if (!existing) return prev
      return { ...prev, checkIns: { ...prev.checkIns, [subscriptionId]: { ...existing, startedAt } } }
    })
  }, [])

  const value = useMemo<MosqueApi>(() => {
    const getCheckIn = (subscriptionId: string): CheckInRecord | null => {
      const record = store.checkIns[subscriptionId]
      if (!record || record.dateKey !== todayKey()) return null
      return record
    }
    return {
      homeLocation: store.homeLocation,
      homeLocationName: store.homeLocationName,
      setHomeLocation,
      clearHomeLocation,
      getCheckIn,
      startCheckIn,
      endCheckIn,
      setCheckInStartedAt,
    }
  }, [store, setHomeLocation, clearHomeLocation, startCheckIn, endCheckIn, setCheckInStartedAt])

  return <MosqueContext.Provider value={value}>{children}</MosqueContext.Provider>
}

export function useMosque() {
  const ctx = useContext(MosqueContext)
  if (!ctx) throw new Error("useMosque must be used within MosqueProvider")
  return ctx
}
