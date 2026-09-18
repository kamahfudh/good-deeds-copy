import { useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import clsx from "clsx"
import {
  ArrowLeft,
  BookBookmark,
  CaretRight,
  Check,
  CheckCircle,
  ChatsCircle,
  Circle,
  Clock,
  ListChecks,
  MapPinLine,
  Minus,
  PencilSimple,
  ShareNetwork,
  Sparkle,
  Trash,
} from "@phosphor-icons/react"
import { ALL_DAYS, ALL_PRAYERS, getCategory, getDeedById, PRAYER_LABELS, type DayCode, type PrayerCode } from "../lib/data"
import { CategoryBadge } from "../components/CategoryBadge"
import { PointsPill } from "../components/PointsPill"
import { PointsBadge } from "../components/PointsBadge"
import { DayPicker, FULL_DAY_LABELS } from "../components/DayPicker"
import { PrayerPicker } from "../components/PrayerPicker"
import { flexSubscriptionId, useGoodDeeds } from "../lib/store"

export function DeedDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deed = id ? getDeedById(id) : undefined

  const {
    getSubscriptionForDeed,
    addSubscription,
    updateSubscription,
    removeSubscription,
    completeSubscription,
    completeDeed,
    completedToday,
    currentStreak,
    completionsFor,
  } = useGoodDeeds()

  const subscription = deed ? getSubscriptionForDeed(deed.id) : undefined
  // Flexible-schedule deeds (no fixed day pattern) are never subscribed to —
  // they're automatically "active" and tracked under this pseudo id instead,
  // so they never show up in My Deeds / Active Deeds.
  const flexId = deed?.flexibleSchedule ? flexSubscriptionId(deed.id) : undefined
  const [editing, setEditing] = useState(false)
  const [draftDays, setDraftDays] = useState<DayCode[]>(subscription?.days ?? deed?.suggestedDays ?? [])
  const [draftPrayers, setDraftPrayers] = useState<PrayerCode[]>(subscription?.prayers ?? ALL_PRAYERS)
  const [shared, setShared] = useState(false)

  const streak = flexId ? currentStreak(flexId) : subscription ? currentStreak(subscription.id) : 0
  const doneToday = flexId ? completedToday(flexId) : subscription ? completedToday(subscription.id) : false
  const totalCompletions = flexId
    ? completionsFor(flexId).length
    : subscription
      ? completionsFor(subscription.id).length
      : 0

  const category = useMemo(() => (deed ? getCategory(deed.category) : null), [deed])

  if (!deed || !category) {
    return <Navigate to="/" replace />
  }

  const isNew = !subscription || editing
  // Jumu'ah only happens on Friday, so its schedule isn't a user choice —
  // skip the day-picker and use this fixed array instead of draftDays.
  const lockedDays = deed.fixedDays

  function handleSave() {
    const days = lockedDays ?? draftDays
    if (days.length === 0) return
    if (deed!.requiresPrayerSelection && draftPrayers.length === 0) return
    const prayers = deed!.requiresPrayerSelection ? draftPrayers : undefined
    if (subscription) {
      updateSubscription(subscription.id, days, deed!.suggestedTime, prayers)
      setEditing(false)
    } else {
      addSubscription(deed!.id, days, deed!.suggestedTime, prayers)
    }
  }

  async function handleExternalShare() {
    const shareText = `I just completed "${deed!.title}" (+${deed!.points} pts) on Good Deeds${
      streak > 1 ? ` — ${streak} day streak!` : "!"
    }`

    setShared(true)
    window.setTimeout(() => setShared(false), 2000)

    if (navigator.share) {
      try {
        await navigator.share({ title: "Good Deeds", text: shareText })
      } catch {
        // user cancelled the native share sheet
      }
      return
    }

    try {
      await navigator.clipboard.writeText(shareText)
    } catch {
      // clipboard unavailable
    }
  }

  function handleShareToSocial() {
    const subscriptionId = subscription?.id ?? flexId
    if (!subscriptionId) return
    navigate("/social/new", {
      state: {
        deedDraft: {
          subscriptionId,
          deedTitle: deed!.title,
          points: deed!.points,
          streak,
        },
      },
    })
  }

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

        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{deed.summary}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <PointsPill points={deed.points} size="md" />
          {!deed.flexibleSchedule && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3 py-1.5 text-sm font-medium text-rose">
              <Minus weight="bold" className="size-3.5" />
              {deed.penaltyPoints} pts if missed
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted">
            <Clock className="size-4" />
            {deed.frequencyLabel}
          </span>
          {subscription && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1.5 text-sm font-medium text-emerald">
              <CheckCircle weight="fill" className="size-4" />
              In your plan
            </span>
          )}
        </div>
      </div>

      {(subscription || flexId) && !editing && (
        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-surface-raised p-4 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums text-ink">{totalCompletions}</p>
              <p className="text-[11px] text-ink-faint">completed</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-amber">
                {totalCompletions * deed.points}
              </p>
              <p className="text-[11px] text-ink-faint">points earned</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-amber">{streak}</p>
              <p className="text-[11px] text-ink-faint">day streak</p>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            {deed.requiresMosqueCheckIn && !doneToday ? (
              <Link
                to={`/deeds/${deed.id}/check-in`}
                className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(57,70,234,0.75)] hover:bg-brand-strong"
              >
                <MapPinLine weight="bold" className="size-[18px]" />
                Check In at Mosque
              </Link>
            ) : (
              <button
                type="button"
                disabled={doneToday}
                onClick={() => {
                  if (flexId) completeDeed(deed.id)
                  else if (subscription) completeSubscription(subscription.id)
                }}
                className={clsx(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  doneToday
                    ? "cursor-default bg-emerald-soft text-emerald"
                    : "tap-scale bg-brand text-white hover:bg-brand-strong shadow-[0_10px_24px_-10px_rgba(57,70,234,0.75)]",
                )}
              >
                {doneToday ? (
                  <CheckCircle weight="fill" className="size-[18px]" />
                ) : (
                  <Circle weight="bold" className="size-[18px]" />
                )}
                {doneToday ? "Completed today" : "Mark complete today"}
              </button>
            )}
            {doneToday && (
              <button
                type="button"
                onClick={handleExternalShare}
                aria-label="Share"
                className={clsx(
                  "tap-scale flex size-[46px] shrink-0 items-center justify-center rounded-xl border transition-colors",
                  shared
                    ? "border-emerald/25 bg-emerald-soft text-emerald"
                    : "border-border bg-surface-raised text-ink hover:border-border-strong",
                )}
              >
                {shared ? (
                  <Check weight="bold" className="size-[18px]" />
                ) : (
                  <ShareNetwork weight="bold" className="size-[18px]" />
                )}
              </button>
            )}
          </div>

          {deed.requiresMosqueCheckIn && !doneToday && (
            <p className="mt-2.5 text-center text-xs text-ink-faint">
              You'll need to be physically at the mosque for {deed.mosqueMinStayMinutes ?? 10} minutes to complete
              this deed.
            </p>
          )}

          {doneToday && (
            <button
              type="button"
              onClick={handleShareToSocial}
              className="tap-scale mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/25 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-soft/80"
            >
              <ChatsCircle weight="fill" className="size-[18px]" />
              Share on Social
            </button>
          )}
        </section>
      )}

      {deed.fixedDays ? (
        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <p className="mb-2.5 text-xs font-medium text-ink-faint">Preferred time</p>
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-ink-muted">
            <Clock className="size-4 shrink-0 text-ink-faint" />
            {deed.suggestedTime}
          </div>
          {subscription ? (
            <button
              type="button"
              onClick={() => removeSubscription(subscription.id)}
              className="tap-scale flex w-full items-center justify-center gap-2 rounded-xl border border-rose/25 bg-rose-soft px-4 py-3 text-sm font-semibold text-rose transition-colors hover:bg-rose-soft/70"
            >
              <Trash className="size-4" />
              Remove from my deeds
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="tap-scale flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(57,70,234,0.75)] hover:bg-brand-strong"
            >
              <ListChecks weight="bold" className="size-[18px]" />
              Add to my deeds
            </button>
          )}
        </section>
      ) : deed.flexibleSchedule ? null : (
        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">
              {subscription && !editing ? "Your schedule" : "Choose your schedule"}
            </h2>
            {subscription && !editing && (
              <button
                type="button"
                onClick={() => {
                  setDraftDays(subscription.days)
                  setDraftPrayers(subscription.prayers ?? ALL_PRAYERS)
                  setEditing(true)
                }}
                className="tap-scale inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong"
              >
                <PencilSimple className="size-4" />
                Edit
              </button>
            )}
          </div>

          {subscription && !editing ? (
            <div className="mt-4">
              <div
                className={clsx(
                  (deed.restrictedDays ?? ALL_DAYS).length === ALL_DAYS.length
                    ? "grid grid-cols-7 gap-1.5 sm:gap-2"
                    : "flex gap-1.5 sm:gap-2",
                )}
              >
                {(deed.restrictedDays ?? ALL_DAYS).map((d) => {
                  const restricted = (deed.restrictedDays ?? ALL_DAYS).length !== ALL_DAYS.length
                  return (
                    <div
                      key={d}
                      className={clsx(clsxDay(subscription.days.includes(d)), restricted && "flex-1")}
                    >
                      {restricted ? FULL_DAY_LABELS[d] : d.slice(0, 2)}
                    </div>
                  )
                })}
              </div>
              <p className="mt-3.5 text-sm text-ink-muted">{subscription.time}</p>

              {deed.requiresPrayerSelection && (
                <>
                  <p className="mb-2 mt-4 text-xs font-medium text-ink-faint">Which prayers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(subscription.prayers ?? ALL_PRAYERS).map((prayer) => (
                      <span
                        key={prayer}
                        className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand"
                      >
                        {PRAYER_LABELS[prayer]}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => removeSubscription(subscription.id)}
                className="tap-scale mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose/25 bg-rose-soft px-4 py-3 text-sm font-semibold text-rose transition-colors hover:bg-rose-soft/70"
              >
                <Trash className="size-4" />
                Remove from my deeds
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-2.5 text-xs font-medium text-ink-faint">Repeat on</p>
              <DayPicker selected={draftDays} onChange={setDraftDays} days={deed.restrictedDays} />

              {deed.requiresPrayerSelection && (
                <>
                  <p className="mb-2.5 mt-5 text-xs font-medium text-ink-faint">Which prayers</p>
                  <PrayerPicker selected={draftPrayers} onChange={setDraftPrayers} />
                </>
              )}

              <p className="mb-2.5 mt-5 text-xs font-medium text-ink-faint">Preferred time</p>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-ink-muted">
                <Clock className="size-4 shrink-0 text-ink-faint" />
                {deed.suggestedTime}
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  disabled={draftDays.length === 0 || (deed.requiresPrayerSelection && draftPrayers.length === 0)}
                  onClick={handleSave}
                  className={clsxPrimary(
                    draftDays.length === 0 || (deed.requiresPrayerSelection && draftPrayers.length === 0),
                  )}
                >
                  <ListChecks weight="bold" className="size-[18px]" />
                  {isNew && subscription ? "Save changes" : "Add to my deeds"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="tap-scale rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {draftDays.length === 0 && (
                <p className="mt-2.5 text-xs text-rose">Pick at least one day to continue.</p>
              )}
              {deed.requiresPrayerSelection && draftPrayers.length === 0 && (
                <p className="mt-2.5 text-xs text-rose">Pick at least one prayer to continue.</p>
              )}
            </div>
          )}
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        {(
          [
            { key: "how-to", label: "How to do it", icon: ListChecks },
            { key: "benefit", label: "Benefit & virtue", icon: Sparkle },
            { key: "references", label: "References", icon: BookBookmark },
          ] as const
        ).map((item, index) => (
          <Link
            key={item.key}
            to={`/deeds/${deed.id}/${item.key}`}
            className={clsx(
              "tap-scale flex items-center gap-3 px-5 py-4 hover:bg-surface-raised",
              index > 0 && "border-t border-border",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <item.icon weight="fill" className="size-4" />
            </span>
            <span className="flex-1 text-[15px] font-semibold text-ink">{item.label}</span>
            <CaretRight className="size-4 shrink-0 text-ink-faint" />
          </Link>
        ))}
      </section>

      <Link
        to="/"
        className="tap-scale mt-8 flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(57,70,234,0.75)] hover:bg-brand-strong"
      >
        <Sparkle weight="fill" className="size-4" />
        Browse more deeds
      </Link>
    </div>
  )
}

function clsxDay(active: boolean) {
  return `flex h-10 items-center justify-center rounded-xl text-xs font-semibold sm:h-11 sm:text-sm ${
    active ? "bg-brand text-white" : "bg-surface-raised text-ink-faint"
  }`
}

function clsxPrimary(disabled = false) {
  const base =
    "tap-scale inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
  if (disabled) return `${base} bg-surface-raised text-ink-faint cursor-not-allowed`
  return `${base} bg-brand text-white hover:bg-brand-strong shadow-[0_10px_24px_-10px_rgba(57,70,234,0.75)]`
}
