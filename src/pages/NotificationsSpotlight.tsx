import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Bell,
  BookOpenText,
  CaretRight,
  ChatsCircle,
  Mosque,
  Sparkle,
  type Icon,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { SocialAvatar } from "../components/SocialPostCard"
import { ALL_AUTHORS, type SocialAuthor } from "../lib/social"
import type { AccentColor } from "../lib/colors"
import {
  NOTIFICATIONS,
  SOCIAL_STATUS_VISUAL,
  groupByRecency,
  relativeTime,
  socialBody,
  socialTitle,
  type AppNotification,
  type NotificationCategory,
} from "../lib/notificationsFeed"

// A synthetic aggregate that only exists in this concept — real feeds collapse
// repeat interactions ("Amina, Yusuf and 3 others liked your post") instead of
// listing every like as its own row. v1 keeps one row per event; this shows
// the alternative.
interface LikeGroupNotification {
  id: "soc-group"
  category: "social"
  kind: "like-post-group"
  actors: SocialAuthor[]
  excerpt: string
  createdAt: number
  read: boolean
}

type Notification = AppNotification | LikeGroupNotification

const [AMINA, YUSUF, , , MARYAM, OMAR] = ALL_AUTHORS

const LIKE_GROUP: LikeGroupNotification = {
  id: "soc-group",
  category: "social",
  kind: "like-post-group",
  actors: [AMINA, YUSUF, MARYAM, OMAR],
  excerpt: "Reflecting on Surah Al-Insyirah this morning.",
  createdAt: Date.now() - 8 * 60_000,
  read: false,
}

const TABS: { id: NotificationCategory; label: string; icon: Icon }[] = [
  { id: "general", label: "General", icon: Bell },
  { id: "social", label: "Social", icon: ChatsCircle },
  { id: "good-deeds", label: "Good Deeds", icon: Sparkle },
]

// Gradient stops pulled from the palette ramp already documented in index.css
// (Primary/Success/Warning/Error) so the icon badges still read as the same
// brand, just with a bit more depth.
const GRADIENT: Record<AccentColor, string> = {
  brand: "bg-gradient-to-br from-[#7B84F1] to-[#3946EA] shadow-[0_10px_28px_-10px_rgba(57,70,234,0.65)]",
  amber: "bg-gradient-to-br from-[#FFD27A] to-[#FFBE4C] shadow-[0_10px_28px_-10px_rgba(255,190,76,0.55)]",
  emerald: "bg-gradient-to-br from-[#6FE4CB] to-[#28806F] shadow-[0_10px_28px_-10px_rgba(40,128,111,0.55)]",
  rose: "bg-gradient-to-br from-[#F4718C] to-[#96132C] shadow-[0_10px_28px_-10px_rgba(150,19,44,0.55)]",
  violet: "bg-gradient-to-br from-[#D2B6FE] to-[#7C3AED] shadow-[0_10px_28px_-10px_rgba(124,58,237,0.55)]",
  cyan: "bg-gradient-to-br from-[#C6CAFB] to-[#5A65ED] shadow-[0_10px_28px_-10px_rgba(90,101,237,0.5)]",
}

export function NotificationsSpotlight() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<NotificationCategory>("social")
  const [items, setItems] = useState<Notification[]>([...NOTIFICATIONS, LIKE_GROUP])

  const totalUnread = useMemo(() => items.filter((n) => !n.read).length, [items])

  const counts = useMemo(() => {
    const map: Record<NotificationCategory, number> = { general: 0, social: 0, "good-deeds": 0 }
    for (const n of items) if (!n.read) map[n.category] += 1
    return map
  }, [items])

  const filtered = useMemo(
    () => items.filter((n) => n.category === tab).sort((a, b) => b.createdAt - a.createdAt),
    [items, tab],
  )
  // Pulled out of the dated groups and pinned above "Today" — mirrors how
  // Instagram keeps its "Follow requests" row outside the regular timeline
  // instead of sorting it in with everything else.
  const pinnedFollowRequests = useMemo(
    () => filtered.find((n) => n.category === "social" && n.kind === "follow-requests-group"),
    [filtered],
  )
  const restFiltered = useMemo(
    () => filtered.filter((n) => n !== pinnedFollowRequests),
    [filtered, pinnedFollowRequests],
  )
  const groups = useMemo(() => groupByRecency(restFiltered as AppNotification[]), [restFiltered])

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }
  const markAllRead = () => {
    setItems((prev) => prev.map((n) => (n.category === tab ? { ...n, read: true } : n)))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">Notifications</p>
        <span className="inline-flex w-10" />
      </div>

      <div className="relative mt-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pr-8">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={clsx(
                  "tap-scale flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink",
                )}
              >
                <t.icon weight={active ? "fill" : "regular"} className="size-4" />
                {t.label}
                {counts[t.id] > 0 && (
                  <span
                    className={clsx(
                      "flex size-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                      active ? "bg-white/25 text-white" : "bg-surface-raised text-ink-faint",
                    )}
                  >
                    {counts[t.id]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-canvas to-transparent"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-faint">
          {totalUnread > 0 ? `${totalUnread} unread across your inbox` : "You're all caught up"}
        </p>
        {counts[tab] > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="tap-scale shrink-0 text-xs font-semibold text-brand hover:text-brand-strong"
          >
            Mark all as read
          </button>
        )}
      </div>

      {pinnedFollowRequests && (
        <div className="mt-6">
          <NotificationRow
            notification={pinnedFollowRequests}
            onRead={markRead}
            onOpenFollowRequests={() => navigate("/notifications/follow-requests")}
          />
        </div>
      )}

      {groups.length === 0 ? (
        pinnedFollowRequests ? null : <EmptyState />
      ) : (
        <div className={clsx("flex flex-col gap-6", pinnedFollowRequests ? "mt-4" : "mt-6")}>
          {groups.map((group) => (
            <div key={group.label}>
              <div className="mb-3 flex items-center gap-3">
                <p className="text-[13px] font-bold text-ink">{group.label}</p>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-2.5">
                {group.items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onRead={markRead}
                    onOpenFollowRequests={() => navigate("/notifications/follow-requests")}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRow({
  notification,
  onRead,
  onOpenFollowRequests,
}: {
  notification: Notification
  onRead: (id: string) => void
  onOpenFollowRequests: () => void
}) {
  const unread = !notification.read
  const isFollowRequestsGroup =
    notification.category === "social" && notification.kind === "follow-requests-group"

  return (
    <button
      type="button"
      onClick={() => {
        onRead(notification.id)
        if (isFollowRequestsGroup) onOpenFollowRequests()
      }}
      className={clsx(
        "tap-scale flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
        unread ? "border-border-strong bg-surface" : "border-border bg-surface hover:border-border-strong",
      )}
    >
      <NotificationIcon notification={notification} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={clsx(
              "min-w-0 flex-1 text-[15px] leading-snug",
              unread ? "font-bold text-ink" : "font-medium text-ink-muted",
            )}
          >
            <RowTitle notification={notification} />
          </p>
          <span className="mt-0.5 flex shrink-0 items-center gap-1.5">
            {unread && !isFollowRequestsGroup && <span className="size-1.5 rounded-full bg-brand" aria-hidden />}
            {!isFollowRequestsGroup && (
              <span className="text-xs text-ink-faint">{relativeTime(notification.createdAt)}</span>
            )}
          </span>
        </div>
        <RowBody notification={notification} />
      </div>
      {isFollowRequestsGroup && (
        <span className="flex shrink-0 items-center gap-1.5 self-center">
          {unread && <span className="size-1.5 rounded-full bg-brand" aria-hidden />}
          <CaretRight className="size-4 text-ink-faint" />
        </span>
      )}
    </button>
  )
}

function NotificationIcon({ notification }: { notification: Notification }) {
  if (notification.category === "social") {
    if (notification.kind === "like-post-group") {
      return <LikeCountBadge count={notification.actors.length - 2} />
    }
    if (notification.kind === "follow-requests-group" && notification.actors) {
      return <FollowRequestsAvatars authors={notification.actors} />
    }
    if (notification.actor) {
      return <SocialAvatar author={notification.actor} size="md" />
    }
    const visual = SOCIAL_STATUS_VISUAL[notification.kind]
    const Icon = visual?.icon ?? Bell
    return (
      <span className={clsx("flex size-11 shrink-0 items-center justify-center rounded-2xl text-white", GRADIENT[visual?.tone ?? "brand"])}>
        <Icon weight="fill" className="size-5" />
      </span>
    )
  }

  if (notification.category === "good-deeds") {
    const Icon = notification.icon
    return (
      <span className={clsx("flex size-11 shrink-0 items-center justify-center rounded-2xl text-white", GRADIENT[notification.tone])}>
        <Icon weight="fill" className="size-5" />
      </span>
    )
  }

  const Icon = notification.source === "quran" ? BookOpenText : Mosque
  return (
    <span
      className={clsx(
        "flex size-11 shrink-0 items-center justify-center rounded-2xl text-white",
        GRADIENT[notification.source === "quran" ? "emerald" : "brand"],
      )}
    >
      <Icon weight="fill" className="size-5" />
    </span>
  )
}

function LikeCountBadge({ count }: { count: number }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
      +{count}
    </span>
  )
}

// Two overlapping circles instead of a single avatar — the pattern Instagram
// uses for its pinned "Follow requests" row, so multiple pending requests
// read as one entry rather than a wall of near-identical rows.
function FollowRequestsAvatars({ authors }: { authors: SocialAuthor[] }) {
  const [first, second] = authors
  return (
    <div className="relative size-11 shrink-0">
      <span className="absolute left-0 top-0">
        <SocialAvatar author={first} size="sm" />
      </span>
      <span className="absolute bottom-0 right-0 rounded-full ring-2 ring-surface">
        <SocialAvatar author={second ?? first} size="sm" />
      </span>
    </div>
  )
}

function RowTitle({ notification }: { notification: Notification }) {
  if (notification.category === "social") {
    if (notification.kind === "like-post-group") {
      const [first, second] = notification.actors
      const extra = notification.actors.length - 2
      return (
        <>
          {first.name}, {second.name} and {extra} other{extra === 1 ? "" : "s"} liked your post
        </>
      )
    }
    return <>{socialTitle(notification)}</>
  }
  return <>{notification.title}</>
}

function RowBody({ notification }: { notification: Notification }) {
  if (notification.category === "social") {
    const body = notification.kind === "like-post-group" ? notification.excerpt : socialBody(notification)
    if (!body) return null
    return <p className="mt-0.5 truncate text-sm text-ink-faint">{body}</p>
  }

  if (notification.category === "good-deeds") {
    return <p className="mt-0.5 line-clamp-2 text-sm text-ink-faint">{notification.body}</p>
  }

  return (
    <div className="mt-1">
      <p className="text-sm text-ink-faint">{notification.lead}</p>
      <p dir="rtl" className="mt-1.5 line-clamp-2 text-right text-[15px] leading-loose text-ink-muted">
        {notification.arabic}
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-raised text-ink-faint">
        <Bell weight="bold" className="size-5" />
      </span>
      <p className="text-sm font-medium text-ink-muted">You're all caught up.</p>
    </div>
  )
}
