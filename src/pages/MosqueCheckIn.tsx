import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Bug,
  CheckCircle,
  HourglassMedium,
  MapPin,
  MapPinLine,
  Mosque,
  Sparkle,
  Warning,
  X,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { getDeedById } from "../lib/data"
import { useGoodDeeds } from "../lib/store"
import { useMosque } from "../lib/mosqueStore"
import { detectCurrentPrayer } from "../lib/prayerSettings"
import { PointsBadge } from "../components/PointsBadge"
import { CircularTimer } from "../components/CircularTimer"
import {
  DEFAULT_MOSQUE_MIN_STAY_MINUTES,
  distanceMeters,
  formatDistance,
  geolocationErrorMessage,
  mosqueMinStayMs,
  MOSQUE_CHECK_IN_RADIUS_METERS,
  type GeoPoint,
} from "../lib/geo"

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}:${sec.toString().padStart(2, "0")}`
}

export function MosqueCheckIn() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deed = id ? getDeedById(id) : undefined

  const { getSubscriptionForDeed, completeSubscription, completedToday } = useGoodDeeds()
  const { homeLocation, homeLocationName, setHomeLocation, getCheckIn, startCheckIn, endCheckIn, setCheckInStartedAt } =
    useMosque()

  const subscription = deed ? getSubscriptionForDeed(deed.id) : undefined
  const doneToday = subscription ? completedToday(subscription.id) : false

  const [position, setPosition] = useState<GeoPoint | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [mosqueNameDraft, setMosqueNameDraft] = useState("")

  // Dev-only: previews the "not at the mosque" screen without needing a real
  // mosque location or GPS reading — this environment has no real device
  // location, so testing that state otherwise means mocking
  // navigator.geolocation by hand every time. Purely a render-time override:
  // it never touches the real homeLocation/position or starts a real
  // check-in, and only ever renders when running the dev build.
  const isDev = import.meta.env.DEV
  const [devPreviewNotAtMosque, setDevPreviewNotAtMosque] = useState(false)
  // True once handleSetHomeLocation has fallen back to the fake point below —
  // real geolocation keeps failing in the background (watchPosition retries
  // forever), which would otherwise leave a stale "blocked" error on screen
  // even though the fallback already let the flow proceed.
  const [usingDevFallbackLocation, setUsingDevFallbackLocation] = useState(false)
  const DEV_FAKE_HOME: GeoPoint = { lat: 21.4225, lng: 39.8262 }
  const DEV_FAKE_FAR_POSITION: GeoPoint = { lat: 21.4275, lng: 39.8262 }

  const checkIn = subscription ? getCheckIn(subscription.id) : null

  useEffect(() => {
    if (!checkIn) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [checkIn])

  useEffect(() => {
    if (!homeLocation) return
    if (!("geolocation" in navigator)) {
      setGeoError("Location services aren't available on this device.")
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoError(null)
      },
      (err) => {
        setGeoError(geolocationErrorMessage(err))
        // Dev-only self-heal: this also covers the case where homeLocation
        // was already saved (from a previous session, or the fallback in
        // handleSetHomeLocation) so the page lands straight on this "waiting
        // for position" screen with no real GPS ever available — without
        // this, that screen has no way to recover at all in this sandbox.
        if (isDev) {
          setPosition((prev) => prev ?? homeLocation)
          setUsingDevFallbackLocation(true)
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [homeLocation])

  const distance = homeLocation && position ? distanceMeters(homeLocation, position) : null
  const atMosque = distance !== null && distance <= MOSQUE_CHECK_IN_RADIUS_METERS

  // What the screen actually renders — the real values, unless the dev
  // preview is on, in which case it's the fixed "far away" fake pair above.
  // The effects below (auto-start/cancel check-in) intentionally keep using
  // the real homeLocation/position/atMosque, not these, so the preview never
  // creates a real check-in.
  const displayHomeLocation = devPreviewNotAtMosque ? DEV_FAKE_HOME : homeLocation
  const displayPosition = devPreviewNotAtMosque ? DEV_FAKE_FAR_POSITION : position
  const displayDistance = devPreviewNotAtMosque
    ? distanceMeters(DEV_FAKE_HOME, DEV_FAKE_FAR_POSITION)
    : distance
  const displayAtMosque = devPreviewNotAtMosque ? false : atMosque

  useEffect(() => {
    if (!subscription || checkIn || !atMosque) return
    startCheckIn(subscription.id)
  }, [subscription, checkIn, atMosque, startCheckIn])

  useEffect(() => {
    if (!subscription || !checkIn) return
    if (distance !== null && distance > MOSQUE_CHECK_IN_RADIUS_METERS) {
      endCheckIn(subscription.id)
    }
  }, [subscription, checkIn, distance, endCheckIn])

  if (!deed || !deed.requiresMosqueCheckIn || !subscription) {
    return <Navigate to={deed ? `/deeds/${deed.id}` : "/my-deeds"} replace />
  }
  if (doneToday) {
    return <Navigate to={`/deeds/${deed.id}`} replace />
  }

  function handleSetHomeLocation() {
    if (!("geolocation" in navigator)) {
      setGeoError("Location services aren't available on this device.")
      return
    }
    setLocating(true)
    const name = mosqueNameDraft.trim() || "My Mosque"
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setHomeLocation(point, name)
        setPosition(point)
        setLocating(false)
        setGeoError(null)
      },
      (err) => {
        setLocating(false)
        setGeoError(geolocationErrorMessage(err))
        // Dev-only fallback: this sandboxed browser has no real GPS and
        // permission is always denied, so real geolocation can never
        // succeed here — fall back to the fake dev point instead of
        // getting permanently stuck on "Location access is blocked."
        // Position is set to the exact same point (not the "far" one used
        // by the other dev preview button) so it also reads as "at the
        // mosque," letting the rest of the check-in flow be tested too.
        if (isDev) {
          setHomeLocation(DEV_FAKE_HOME, name)
          setPosition(DEV_FAKE_HOME)
          setUsingDevFallbackLocation(true)
        }
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  function handleCancelCheckIn() {
    endCheckIn(subscription!.id)
  }

  function handleComplete() {
    completeSubscription(subscription!.id, {
      mosqueStayMs: elapsedMs,
      prayer: deed!.requiresPrayerSelection ? detectCurrentPrayer() : undefined,
      masjidLocation: homeLocationName ?? "My Mosque",
    })
    endCheckIn(subscription!.id)
    navigate(`/deeds/${deed!.id}`)
  }

  const minStayMinutes = deed.mosqueMinStayMinutes ?? DEFAULT_MOSQUE_MIN_STAY_MINUTES
  const minStayMs = mosqueMinStayMs(minStayMinutes)
  const elapsedMs = checkIn ? now - checkIn.startedAt : 0
  const remainingMs = Math.max(0, minStayMs - elapsedMs)
  const progress = checkIn ? Math.min(100, (elapsedMs / minStayMs) * 100) : 0
  const readyToComplete = checkIn !== null && remainingMs === 0

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
        <p className="text-[17px] font-bold text-ink">Check In</p>
        <span className="inline-flex w-10 items-center justify-end">
          <PointsBadge />
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="tap-scale mb-5 hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink lg:inline-flex"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-2 text-center lg:mt-0">
        <h1 className="text-xl font-bold text-ink">{deed.title}</h1>
        <p className="mt-1 text-sm text-ink-faint">Requires {minStayMinutes} minutes at the mosque to complete</p>
      </div>

      {!displayHomeLocation ? (
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-surface p-6 text-center sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-brand/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 size-44 rounded-full bg-brand/10 blur-2xl" />
          <Mosque
            weight="fill"
            className="pointer-events-none absolute -bottom-5 -right-5 size-32 rotate-[-8deg] text-brand/[0.06]"
          />

          <span className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand ring-8 ring-brand/5">
            <MapPin weight="fill" className="size-7" />
          </span>
          <p className="relative mt-4 text-base font-semibold text-ink">Set your mosque location</p>
          <p className="relative mt-1.5 text-sm text-ink-muted">
            Save your current location as your masjid so Good Deeds can tell when you're there. Do this once, from
            inside the mosque.
          </p>
          <input
            type="text"
            value={mosqueNameDraft}
            onChange={(e) => setMosqueNameDraft(e.target.value)}
            placeholder="Name this masjid (optional)"
            className="relative mt-4 w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSetHomeLocation}
            disabled={locating}
            className="tap-scale relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(57,70,234,0.75)] transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            <MapPinLine weight="bold" className="size-[18px]" />
            {locating ? "Locating…" : "Set this location as my mosque"}
          </button>
          {geoError && !usingDevFallbackLocation && (
            <p className="relative mt-3 text-sm font-medium text-rose">{geoError}</p>
          )}

          <div className="relative mt-6 flex flex-col gap-3 border-t border-border pt-5 text-left">
            {[
              { icon: MapPinLine, label: "Set your mosque once, from inside" },
              { icon: HourglassMedium, label: `Stay at least ${minStayMinutes} minutes to check in` },
              { icon: CheckCircle, label: "Mark the prayer complete" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <step.icon weight="bold" className="size-4 shrink-0 text-ink-faint" />
                <p className="text-sm text-ink-muted">{step.label}</p>
              </div>
            ))}
          </div>

          {isDev && (
            <button
              type="button"
              onClick={() => setDevPreviewNotAtMosque(true)}
              className="tap-scale relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-faint/40 px-4 py-2.5 text-xs font-semibold text-ink-faint hover:border-ink-faint/70 hover:text-ink-muted"
            >
              <Bug weight="bold" className="size-4" />
              Dev mode: preview "not at mosque" screen
            </button>
          )}
        </section>
      ) : (
        <section className="relative mt-6 flex flex-col items-center overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <div
            className={clsx(
              "pointer-events-none absolute -right-10 -top-14 size-48 rounded-full blur-2xl transition-colors duration-500",
              readyToComplete ? "bg-emerald/15" : displayAtMosque || checkIn ? "bg-brand/12" : displayPosition ? "bg-amber/10" : "bg-brand/5",
            )}
          />
          <Mosque
            weight="fill"
            className="pointer-events-none absolute -bottom-6 -left-6 size-28 rotate-[10deg] text-ink-faint/[0.05]"
          />

          {homeLocationName && (
            <p className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ink-muted">
              <MapPin weight="fill" className="size-4 text-brand" />
              {homeLocationName}
            </p>
          )}

          <div className="relative mt-4 flex items-center justify-center">
            {checkIn && !readyToComplete && (
              <span className="absolute size-[240px] animate-ping rounded-full bg-brand/10 [animation-duration:2.5s]" />
            )}
            {readyToComplete && (
              <span className="absolute size-[240px] animate-pulse rounded-full bg-emerald/20 blur-xl" />
            )}
            {!checkIn && displayAtMosque && (
              <span className="absolute size-[240px] animate-ping rounded-full bg-brand/10" />
            )}
            {!checkIn && !displayAtMosque && displayPosition && (
              <span className="absolute size-[240px] animate-ping rounded-full bg-amber/10 [animation-duration:3s]" />
            )}

            {readyToComplete ? (
              <CircularTimer progress={100} tone="emerald">
                <CheckCircle weight="fill" className="size-7 text-emerald" />
                <p className="mt-1 text-3xl font-extrabold tabular-nums text-emerald">{formatClock(elapsedMs)}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">and counting</p>
              </CircularTimer>
            ) : checkIn ? (
              <CircularTimer progress={progress} tone="brand">
                <p className="text-4xl font-extrabold tabular-nums text-ink">{formatClock(remainingMs)}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">remaining</p>
              </CircularTimer>
            ) : (
              <CircularTimer progress={0} tone={displayAtMosque ? "brand" : "muted"}>
                {displayAtMosque ? (
                  <MapPin weight="fill" className="size-10 text-brand" />
                ) : displayPosition ? (
                  <Warning weight="fill" className="size-10 text-amber" />
                ) : (
                  <MapPinLine weight="bold" className="size-10 animate-pulse text-ink-faint" />
                )}
              </CircularTimer>
            )}

            {readyToComplete && (
              <>
                <Sparkle weight="fill" className="absolute -top-2 left-8 size-5 text-amber" />
                <Sparkle weight="fill" className="absolute -right-1 top-12 size-4 text-emerald" />
                <Sparkle weight="fill" className="absolute bottom-6 -left-3 size-4 text-amber" />
              </>
            )}
          </div>

          <div className="relative mt-5 text-center">
            {readyToComplete ? (
              <>
                <p className="text-base font-semibold text-emerald">You've stayed {minStayMinutes} minutes at the mosque</p>
                <p className="mt-1 text-sm text-ink-muted">Mark this prayer as complete.</p>
              </>
            ) : checkIn ? (
              <>
                <p className="text-base font-semibold text-brand">Checked in at the mosque</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Stay here — leaving the mosque will cancel your check-in.
                </p>
              </>
            ) : displayAtMosque ? (
              <>
                <p className="text-base font-semibold text-ink">You're at the mosque</p>
                <p className="mt-1 text-sm text-ink-muted">Starting your check-in…</p>
              </>
            ) : displayPosition ? (
              <>
                <p className="text-base font-semibold text-ink">Not at the mosque yet</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {displayDistance !== null ? `You're ${formatDistance(displayDistance)} away.` : "Move closer to check in."}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-ink">Checking your location…</p>
                <p className="mt-1 text-sm text-ink-muted">Make sure location access is allowed.</p>
              </>
            )}
            {geoError && !readyToComplete && !usingDevFallbackLocation && (
              <p className="mt-2.5 text-sm font-medium text-rose">{geoError}</p>
            )}

            {isDev && !checkIn && !displayPosition && (
              <button
                type="button"
                onClick={() => {
                  setPosition(homeLocation)
                  setUsingDevFallbackLocation(true)
                }}
                className="tap-scale relative mx-auto mt-4 flex items-center gap-1.5 rounded-full border border-dashed border-ink-faint/40 px-3 py-1.5 text-xs font-semibold text-ink-faint hover:border-ink-faint/70 hover:text-ink-muted"
              >
                <Bug weight="bold" className="size-3.5" />
                Dev mode: use my saved mosque location
              </button>
            )}
          </div>

          {readyToComplete && (
            <button
              type="button"
              onClick={handleComplete}
              className="tap-scale relative mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(64,196,170,0.6)] hover:opacity-90"
            >
              <CheckCircle weight="fill" className="size-[18px]" />
              Mark Complete
            </button>
          )}

          {checkIn && !readyToComplete && (
            <button
              type="button"
              onClick={handleCancelCheckIn}
              className="tap-scale mt-6 flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-rose"
            >
              <X weight="bold" className="size-4" />
              Cancel check-in
            </button>
          )}

          {isDev && checkIn && !readyToComplete && (
            <button
              type="button"
              onClick={() => setCheckInStartedAt(subscription!.id, Date.now() - minStayMs)}
              className="tap-scale relative mt-3 flex items-center gap-1.5 rounded-full border border-dashed border-ink-faint/40 px-3 py-1.5 text-xs font-semibold text-ink-faint hover:border-ink-faint/70 hover:text-ink-muted"
            >
              <Bug weight="bold" className="size-3.5" />
              Dev mode: complete the {minStayMinutes}-min wait
            </button>
          )}

          {isDev && devPreviewNotAtMosque && (
            <button
              type="button"
              onClick={() => setDevPreviewNotAtMosque(false)}
              className="tap-scale relative mt-6 flex items-center gap-1.5 rounded-full border border-dashed border-ink-faint/40 px-3 py-1.5 text-xs font-semibold text-ink-faint hover:border-ink-faint/70 hover:text-ink-muted"
            >
              <Bug weight="bold" className="size-3.5" />
              Exit dev preview
            </button>
          )}
        </section>
      )}
    </div>
  )
}
