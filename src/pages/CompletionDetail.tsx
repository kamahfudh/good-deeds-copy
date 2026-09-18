import { useMemo } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CaretRight,
  CheckCircle,
  Clock,
  Flame,
  HourglassMedium,
  ListChecks,
  MapPin,
  Mosque,
  Sparkle,
} from "@phosphor-icons/react"
import { getCategory, getDeedById, PRAYER_LABELS } from "../lib/data"
import { CategoryBadge } from "../components/CategoryBadge"
import { PointsBadge } from "../components/PointsBadge"
import { useGoodDeeds } from "../lib/store"

export function CompletionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { completions, completionsFor } = useGoodDeeds()

  const completion = id ? completions.find((c) => c.id === id) : undefined
  const deed = completion ? getDeedById(completion.deedId) : undefined
  const category = useMemo(() => (deed ? getCategory(deed.category) : null), [deed])

  if (!completion || !deed || !category) {
    return <Navigate to="/my-deeds" replace />
  }

  const history = completionsFor(completion.subscriptionId).slice().reverse()
  const occurrence = history.findIndex((c) => c.id === completion.id) + 1

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8 lg:max-w-4xl lg:px-10 lg:pt-8">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">{category.shortLabel}</p>
        <span className="inline-flex w-14 items-center justify-end">
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

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-7">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge categoryId={deed.category} />
          <span className="text-xs font-medium text-ink-faint">{deed.subCategory}</span>
        </div>
        <h1 className="font-display mt-2 text-2xl font-extrabold leading-tight text-ink sm:text-[28px]">
          {deed.title}
        </h1>
        {deed.arabicName && <p className="mt-0.5 text-sm text-ink-faint">{deed.arabicName}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1.5 text-sm font-medium text-emerald">
            <CheckCircle weight="fill" className="size-4" />
            Completed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted">
            <Clock className="size-4" />
            {formatDateTime(completion.completedAt)}
          </span>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Points gained</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-soft text-amber">
            <Sparkle weight="fill" className="size-6" />
          </span>
          <div>
            <p className="text-3xl font-extrabold tabular-nums text-ink">+{completion.points}</p>
            <p className="text-sm text-ink-faint">for completing "{deed.title}"</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface-raised">
          {history.length > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-ink-muted">
                <Sparkle weight="fill" className="size-4 text-amber" />
                Total points gained
              </span>
              <span className="text-sm font-semibold tabular-nums text-ink">
                +{history.reduce((sum, c) => sum + c.points, 0)} pts
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              <Sparkle weight="fill" className="size-4 text-amber" />
              Base reward
            </span>
            <span className="text-sm font-semibold tabular-nums text-ink">+{deed.points} pts</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              <ListChecks weight="bold" className="size-4 text-brand" />
              Frequency
            </span>
            <span className="text-sm font-medium text-ink">{deed.frequencyLabel}</span>
          </div>
          {occurrence > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-ink-muted">
                <Flame weight="fill" className="size-4 text-rose" />
                Times completed
              </span>
              <span className="text-sm font-semibold tabular-nums text-ink">#{occurrence}</span>
            </div>
          )}
        </div>
      </section>

      {(completion.mosqueStayMs !== undefined || completion.prayer || completion.masjidLocation) && (
        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Mosque check-in</p>
          <div className="mt-3 flex flex-col gap-3">
            {completion.masjidLocation && (
              <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <MapPin weight="fill" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Masjid</p>
                  <p className="mt-0.5 break-words text-[15px] font-semibold leading-snug text-ink">
                    {completion.masjidLocation}
                  </p>
                </div>
              </div>
            )}
            {(completion.mosqueStayMs !== undefined || completion.prayer) && (
              <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface-raised">
                {completion.mosqueStayMs !== undefined && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-ink-muted">
                      <HourglassMedium weight="bold" className="size-4 text-brand" />
                      Time at mosque
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink">
                      {formatDuration(completion.mosqueStayMs)}
                    </span>
                  </div>
                )}
                {completion.prayer && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-ink-muted">
                      <Mosque weight="fill" className="size-4 text-brand" />
                      Prayer
                    </span>
                    <span className="text-sm font-semibold text-ink">{PRAYER_LABELS[completion.prayer]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {deed.benefit && (
        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Why this matters</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{deed.benefit}</p>
        </section>
      )}

      <Link
        to={`/deeds/${deed.id}`}
        className="tap-scale mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 text-sm font-semibold text-ink hover:border-border-strong"
      >
        View deed details
        <CaretRight className="size-4 text-ink-faint" />
      </Link>
    </div>
  )
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return `${hours}h ${minutes}m`
}
