import {
  BookOpenText,
  CheckCircle,
  Clock,
  Flame,
  ListChecks,
  Mosque,
  Sparkle,
  Trophy,
  WarningCircle,
  type Icon,
} from "@phosphor-icons/react"
import { ALL_AUTHORS, type SocialAuthor } from "./social"
import type { AccentColor } from "./colors"

export type NotificationCategory = "general" | "social" | "good-deeds"

export type SocialNotificationKind =
  | "follow"
  | "follow-request"
  | "follow-requests-group"
  | "follow-accepted"
  | "like-post"
  | "like-reply"
  | "repost"
  | "reply-post"
  | "reply-reply"
  | "mention"
  | "post-under-review"
  | "post-removed"
  | "post-published"

interface NotificationBase {
  id: string
  createdAt: number
  read: boolean
}

export interface GeneralNotification extends NotificationBase {
  category: "general"
  source: "hadith" | "quran"
  title: string
  lead: string
  arabic: string
}

export interface SocialNotification extends NotificationBase {
  category: "social"
  kind: SocialNotificationKind
  actor?: SocialAuthor
  // Set only on "follow-requests-group" — several pending requests collapsed
  // into one pinned row, Instagram-style, instead of one row per request.
  actors?: SocialAuthor[]
  excerpt?: string
}

export interface GoodDeedNotification extends NotificationBase {
  category: "good-deeds"
  icon: Icon
  tone: AccentColor
  title: string
  body: string
}

export type AppNotification = GeneralNotification | SocialNotification | GoodDeedNotification

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const minutesAgo = (n: number) => Date.now() - n * MIN
const hoursAgo = (n: number) => Date.now() - n * HOUR
const daysAgo = (n: number) => Date.now() - n * DAY

const [AMINA, YUSUF, FATIMA, BILAL, MARYAM, OMAR, MOCKIE, AUNI] = ALL_AUTHORS

// ---------------------------------------------------------------------------
// General — reminders and short hadith/Qur'an excerpts surfaced from the
// content library, the same kind of card the app already sends today.
// ---------------------------------------------------------------------------
const GENERAL: GeneralNotification[] = [
  {
    id: "gen-1",
    category: "general",
    source: "hadith",
    title: "A Supplication for Protection from Four Things",
    lead: "The Prophet ﷺ used to say:",
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا",
    createdAt: hoursAgo(3),
    read: false,
  },
  {
    id: "gen-2",
    category: "general",
    source: "hadith",
    title: "Increase Your Selawat",
    lead: "Abdullah bin 'Amr RA reported that the Prophet ﷺ said:",
    arabic: "فَإِنَّهُ مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّه عَلَيْهِ بِهَا عَشْرًا",
    createdAt: daysAgo(6),
    read: true,
  },
  {
    id: "gen-3",
    category: "general",
    source: "quran",
    title: "Who Does Allah Love?",
    lead: "Allah SWT says:",
    arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
    createdAt: daysAgo(7),
    read: true,
  },
  {
    id: "gen-4",
    category: "general",
    source: "hadith",
    title: "Surah Al-Mu'awwidhatayn",
    lead: "The Messenger of Allah ﷺ said:",
    arabic: "أُنزِلَ، أَوْ أُنْزِلَتْ عَلَيَّ آيَاتٌ لَمْ يُرَ مِثْلُهُنَّ قَطُّ، المُعَوِّذَتَيْنِ",
    createdAt: daysAgo(7),
    read: true,
  },
  {
    id: "gen-5",
    category: "general",
    source: "quran",
    title: "With Every Hardship Comes Ease",
    lead: "Allah SWT says:",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    createdAt: daysAgo(8),
    read: true,
  },
  {
    id: "gen-6",
    category: "general",
    source: "hadith",
    title: "Two Blessings Often Taken for Granted",
    lead: "Ibn 'Abbas RA reported that the Prophet ﷺ said:",
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    createdAt: daysAgo(9),
    read: true,
  },
]

// ---------------------------------------------------------------------------
// Social — one card per event this app already tracks (see the Social Notif
// spec), each attributed to a seed author so it reads like a live feed.
// ---------------------------------------------------------------------------
const SOCIAL: SocialNotification[] = [
  {
    id: "soc-1",
    category: "social",
    kind: "follow",
    actor: AMINA,
    createdAt: minutesAgo(5),
    read: false,
  },
  {
    id: "soc-2",
    category: "social",
    kind: "like-post",
    actor: YUSUF,
    excerpt: "Reflecting on Surah Al-Insyirah this morning.",
    createdAt: minutesAgo(20),
    read: false,
  },
  {
    id: "soc-repost",
    category: "social",
    kind: "repost",
    actor: MARYAM,
    excerpt: "Reflecting on Surah Al-Insyirah this morning.",
    createdAt: minutesAgo(12),
    read: false,
  },
  {
    id: "soc-3",
    category: "social",
    kind: "mention",
    actor: MARYAM,
    excerpt: "@you your dua reminder was exactly what I needed today 🤲",
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: "soc-4",
    category: "social",
    kind: "reply-post",
    actor: FATIMA,
    excerpt: "So beautiful, jazakAllah khair!",
    createdAt: hoursAgo(3),
    read: true,
  },
  {
    id: "soc-5",
    category: "social",
    kind: "post-under-review",
    createdAt: hoursAgo(5),
    read: true,
  },
  {
    id: "soc-6",
    category: "social",
    kind: "follow-requests-group",
    actors: [BILAL, MOCKIE, AUNI],
    createdAt: minutesAgo(1),
    read: false,
  },
  {
    id: "soc-7",
    category: "social",
    kind: "like-reply",
    actor: OMAR,
    excerpt: "Ameen, may Allah make it easy for you.",
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: "soc-8",
    category: "social",
    kind: "post-published",
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: "soc-9",
    category: "social",
    kind: "follow-accepted",
    actor: AUNI,
    createdAt: daysAgo(2),
    read: true,
  },
  {
    id: "soc-10",
    category: "social",
    kind: "reply-reply",
    actor: MOCKIE,
    excerpt: "Ameen, may Allah accept it from all of us.",
    createdAt: daysAgo(3),
    read: true,
  },
  {
    id: "soc-11",
    category: "social",
    kind: "post-removed",
    createdAt: daysAgo(4),
    read: true,
  },
]

// ---------------------------------------------------------------------------
// Good Deeds — completion streaks, reminders, points and rewards, mirroring
// the categories and tones already used on My Deeds / Points.
// ---------------------------------------------------------------------------
const GOOD_DEEDS: GoodDeedNotification[] = [
  {
    id: "gd-1",
    category: "good-deeds",
    icon: Flame,
    tone: "amber",
    title: "You're on a 7-day streak",
    body: "Keep going — complete a deed today to make it 8.",
    createdAt: minutesAgo(30),
    read: false,
  },
  {
    id: "gd-2",
    category: "good-deeds",
    icon: CheckCircle,
    tone: "emerald",
    title: "Great job! You completed Morning Adhkar",
    body: "+10 points added to your total.",
    createdAt: hoursAgo(2),
    read: false,
  },
  {
    id: "gd-3",
    category: "good-deeds",
    icon: Mosque,
    tone: "brand",
    title: "Evening Adhkar is due today",
    body: "You haven't completed it yet — it only takes 5 minutes.",
    createdAt: hoursAgo(6),
    read: false,
  },
  {
    id: "gd-4",
    category: "good-deeds",
    icon: Sparkle,
    tone: "amber",
    title: "You earned 45 points this week",
    body: "That's your best week yet — see the full breakdown.",
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: "gd-5",
    category: "good-deeds",
    icon: Mosque,
    tone: "brand",
    title: "Maghrib check-in recorded",
    body: "Al-Falah Mosque · 22 minutes.",
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: "gd-6",
    category: "good-deeds",
    icon: Trophy,
    tone: "amber",
    title: "New reward unlocked",
    body: "You have enough points to redeem a Qur'an bookmark set.",
    createdAt: daysAgo(2),
    read: true,
  },
  {
    id: "gd-7",
    category: "good-deeds",
    icon: ListChecks,
    tone: "cyan",
    title: "Your weekly summary is ready",
    body: "12 deeds completed, 3-day streak maintained.",
    createdAt: daysAgo(3),
    read: true,
  },
  {
    id: "gd-8",
    category: "good-deeds",
    icon: BookOpenText,
    tone: "emerald",
    title: "New deed suggested for you",
    body: "Based on your goals, try adding “Read 1 page of Qur'an daily.”",
    createdAt: daysAgo(4),
    read: true,
  },
]

export const NOTIFICATIONS: AppNotification[] = [...GENERAL, ...SOCIAL, ...GOOD_DEEDS].sort(
  (a, b) => b.createdAt - a.createdAt,
)

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  general: "General",
  social: "Social",
  "good-deeds": "Good Deeds",
}

export function unreadCount(items: AppNotification[]): number {
  return items.filter((n) => !n.read).length
}

// Icon + tone for the system-authored social events (no actor) — mirrors the
// pending/rejected treatment already used in ModerationInfoSheet.
export const SOCIAL_STATUS_VISUAL: Partial<Record<SocialNotificationKind, { icon: Icon; tone: AccentColor }>> = {
  "post-under-review": { icon: Clock, tone: "amber" },
  "post-removed": { icon: WarningCircle, tone: "rose" },
  "post-published": { icon: CheckCircle, tone: "emerald" },
}

export function socialTitle(n: SocialNotification): string {
  const name = n.actor?.name ?? ""
  switch (n.kind) {
    case "follow":
      return `${name} started following you`
    case "follow-request":
      return `${name} requested to follow you`
    case "follow-requests-group":
      return "Follow requests"
    case "follow-accepted":
      return `${name} accepted your follow request`
    case "like-post":
      return `${name} liked your post`
    case "like-reply":
      return `${name} liked your reply`
    case "repost":
      return `${name} reposted your post`
    case "reply-post":
      return `${name} replied to your post`
    case "reply-reply":
      return `${name} replied to your reply`
    case "mention":
      return `${name} mentioned you`
    case "post-under-review":
      return "Your post is under review"
    case "post-removed":
      return "Your post was removed"
    case "post-published":
      return "Your post was published"
  }
}

export function socialBody(n: SocialNotification): string {
  switch (n.kind) {
    case "follow":
      return n.actor?.handle ?? ""
    case "follow-request":
      return `${n.actor?.handle ?? ""} · wants to follow you`
    case "follow-requests-group": {
      const [first, ...rest] = n.actors ?? []
      return `${first?.handle ?? ""} + ${rest.length} other${rest.length === 1 ? "" : "s"}`
    }
    case "follow-accepted":
      return `${n.actor?.handle ?? ""} · you're now following each other`
    case "like-post":
    case "like-reply":
    case "repost":
    case "reply-post":
    case "reply-reply":
    case "mention":
      return n.excerpt ?? ""
    case "post-under-review":
      return "We're reviewing it against our community guidelines."
    case "post-removed":
      return "It didn't meet our terms and regulations."
    case "post-published":
      return "It's now live on your profile."
  }
}

export function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts
  const min = Math.floor(diffMs / MIN)
  if (min < 1) return "now"
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d`
  const week = Math.floor(day / 7)
  return `${week}w`
}

export interface NotificationGroup {
  label: string
  items: AppNotification[]
}

export function groupByRecency(items: AppNotification[]): NotificationGroup[] {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayTs = startOfToday.getTime()
  const weekAgoTs = Date.now() - 7 * DAY

  const today: AppNotification[] = []
  const thisWeek: AppNotification[] = []
  const earlier: AppNotification[] = []

  for (const n of items) {
    if (n.createdAt >= todayTs) today.push(n)
    else if (n.createdAt >= weekAgoTs) thisWeek.push(n)
    else earlier.push(n)
  }

  return [
    { label: "Today", items: today },
    { label: "This week", items: thisWeek },
    { label: "Earlier", items: earlier },
  ].filter((g) => g.items.length > 0)
}
