import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  CheckCircle,
  Circle,
  Clock,
  Compass,
  ListChecks,
  Mosque,
  Sparkle,
  type Icon,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { getDeedById, getCategory, PRAYER_LABELS, type PrayerCode } from "../lib/data"
import { CategoryBadge } from "../components/CategoryBadge"
import { PointsPill } from "../components/PointsPill"
import { PointsBadge } from "../components/PointsBadge"
import { CATEGORY_ICONS } from "../components/icons"
import { accentClasses } from "../lib/colors"
import { nextOccurrence, todayCode, useGoodDeeds, type Subscription } from "../lib/store"

type TabId = "ongoing" | "upcoming" | "history"

const TABS: { id: TabId; label: string }[] = [
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "history", label: "History" },
]

export function MyDeeds() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>("ongoing")
  const { subscriptions, completions, totalPoints, completedToday } = useGoodDeeds()

  const today = todayCode()

  const ongoing = useMemo(
    () => subscriptions.filter((s) => s.days.includes(today)),
    [subscriptions, today],
  )
  const upcoming = useMemo(
    () =>
      subscriptions
        .filter((s) => !s.days.includes(today))
        .map((s) => ({ sub: s, next: nextOccurrence(s.days) }))
        .filter((x) => x.next)
        .sort((a, b) => (a.next!.inDays ?? 0) - (b.next!.inDays ?? 0)),
    [subscriptions, today],
  )
  const history = useMemo(
    () => [...completions].sort((a, b) => b.completedAt - a.completedAt),
    [completions],
  )

  const ongoingRemaining = ongoing.filter((s) => !completedToday(s.id)).length

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-5xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">My Deeds</p>
        <span className="inline-flex w-14 items-center justify-end">
          <PointsBadge />
        </span>
      </div>

      <div className="mt-6 flex gap-3 lg:mt-0">
        <StatPill
          to="/points"
          className="flex-1"
          icon={Sparkle}
          label="Total points"
          value={totalPoints}
          tone="amber"
        />
        <StatPill
          className="flex-1"
          icon={CheckCircle}
          label="Due today"
          value={ongoingRemaining}
          tone="brand"
        />
      </div>

      <div className="mt-7 flex gap-1 rounded-2xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              "flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-brand text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
            {t.id === "ongoing" && ongoing.length > 0 && (
              <span
                className={clsx(
                  "ml-1.5 tabular-nums",
                  tab === t.id ? "text-white/70" : "text-ink-faint",
                )}
              >
                {ongoing.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "ongoing" && <OngoingList subscriptions={ongoing} />}
        {tab === "upcoming" && <UpcomingList items={upcoming} />}
        {tab === "history" && <HistoryList entries={history} />}
      </div>
    </div>
  )
}

function StatPill({
  icon: Icon,
  label,
  value,
  tone,
  className,
  to,
}: {
  icon: typeof Sparkle
  label: string
  value: number
  tone: "amber" | "brand"
  className?: string
  to?: string
}) {
  const content = (
    <>
      <span
        className={clsx(
          "flex size-8 items-center justify-center rounded-full",
          tone === "amber" ? "bg-amber-soft text-amber" : "bg-brand-soft text-brand",
        )}
      >
        <Icon weight="fill" className="size-4" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold tabular-nums text-ink">{value}</p>
        <p className="text-[11px] text-ink-faint">{label}</p>
      </div>
    </>
  )

  const sharedClasses = clsx(
    "flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-2.5",
    to && "tap-scale hover:border-border-strong",
    className,
  )

  if (to) {
    return (
      <Link to={to} className={sharedClasses}>
        {content}
      </Link>
    )
  }

  return <div className={sharedClasses}>{content}</div>
}

function EmptyState({
  icon: Icon,
  text,
  cta,
}: {
  icon: Icon
  text: string
  cta?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-raised text-ink-faint">
        <Icon weight="bold" className="size-5" />
      </span>
      <p className="text-sm font-medium text-ink-muted">{text}</p>
      {cta && (
        <Link
          to="/"
          className="tap-scale mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          <Compass weight="bold" className="size-4" />
          {cta}
        </Link>
      )}
    </div>
  )
}

function OngoingList({ subscriptions }: { subscriptions: Subscription[] }) {
  const { completeSubscription, completedToday } = useGoodDeeds()

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        text="Nothing scheduled for today yet."
        cta="Browse good deeds"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((sub) => {
        const deed = getDeedById(sub.deedId)
        if (!deed) return null
        const category = getCategory(deed.category)
        const classes = accentClasses(category.color)
        const Icon = CATEGORY_ICONS[deed.category]
        const done = completedToday(sub.id)

        return (
          <div
            key={sub.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5"
          >
            <span
              className={clsx(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                classes.bg,
                classes.text,
              )}
            >
              <Icon weight="fill" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Link to={`/deeds/${deed.id}`} className="block truncate text-[15px] font-semibold text-ink hover:text-brand">
                {deed.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-ink-faint">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {sub.time}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <PointsPill points={deed.points} />
              <button
                type="button"
                disabled={done}
                onClick={() => completeSubscription(sub.id)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  done
                    ? "cursor-default bg-emerald-soft text-emerald"
                    : "tap-scale bg-brand text-white hover:bg-brand-strong",
                )}
              >
                {done ? (
                  <CheckCircle weight="fill" className="size-3.5" />
                ) : (
                  <Circle weight="bold" className="size-3.5" />
                )}
                {done ? "Completed" : "Mark complete"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UpcomingList({
  items,
}: {
  items: { sub: Subscription; next: { code: string; inDays: number } | null }[]
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarBlank}
        text="No upcoming deeds. Everything scheduled falls on today."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ sub, next }) => {
        const deed = getDeedById(sub.deedId)
        if (!deed || !next) return null
        const category = getCategory(deed.category)
        const classes = accentClasses(category.color)
        const Icon = CATEGORY_ICONS[deed.category]

        return (
          <div
            key={sub.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5"
          >
            <span
              className={clsx(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                classes.bg,
                classes.text,
              )}
            >
              <Icon weight="fill" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Link to={`/deeds/${deed.id}`} className="block truncate text-[15px] font-semibold text-ink hover:text-brand">
                {deed.title}
              </Link>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                <CalendarBlank className="size-3.5" />
                Next on {next.code}, {sub.time}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <PointsPill points={deed.points} />
              <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-ink-faint">
                in {next.inDays} day{next.inDays > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface HistoryEntry {
  id: string
  deedId: string
  completedAt: number
  points: number
  prayer?: PrayerCode
  masjidLocation?: string
}

function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  const groups = useMemo(() => groupByDay(entries), [entries])

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        text="No completed deeds yet. Once you mark one done, it appears here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {group.label}
          </p>
          <div className="flex flex-col gap-2.5">
            {group.items.map((entry) => {
              const deed = getDeedById(entry.deedId)
              if (!deed) return null
              return (
                <Link
                  key={entry.id}
                  to={`/my-deeds/history/${entry.id}`}
                  className="tap-scale flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-border-strong"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                    <ListChecks weight="bold" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{deed.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <CategoryBadge categoryId={deed.category} />
                      <span className="text-xs text-ink-faint">{formatTime(entry.completedAt)}</span>
                      {entry.masjidLocation && (
                        <span className="flex items-center gap-1 text-xs text-ink-faint">
                          <Mosque weight="fill" className="size-3" />
                          <span className="max-w-24 truncate">
                            {entry.prayer ? PRAYER_LABELS[entry.prayer] : entry.masjidLocation}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber/25 bg-amber-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-amber">
                    +{entry.points}
                  </span>
                  <CaretRight className="size-4 shrink-0 text-ink-faint" />
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function groupByDay(entries: HistoryEntry[]) {
  const map = new Map<string, HistoryEntry[]>()
  for (const entry of entries) {
    const key = new Date(entry.completedAt).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  return Array.from(map.entries()).map(([key, items]) => {
    let label = new Date(key).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    if (key === today) label = "Today"
    else if (key === yesterday) label = "Yesterday"
    return { label, items }
  })
}
