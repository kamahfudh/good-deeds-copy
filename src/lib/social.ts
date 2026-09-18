import { SEED_IMAGE_IDS, SEED_VIDEO_IDS } from "./seedMedia"
import type { QuranAttachment } from "./quran"

export type SocialColor = "brand" | "emerald" | "amber" | "rose" | "violet" | "cyan"

export interface SocialAuthor {
  name: string
  handle: string
  initials: string
  color: SocialColor
  followers: number
  // Seed authors get an illustrative points total (same spirit as `followers`)
  // so a badge tier can be shown next to their name — YOU's real total comes
  // from useGoodDeeds() at render time instead, see authorPoints() below.
  points: number
  // A private author's own posts are hidden from feeds, search, and their
  // profile's Posts/Replies tabs until YOU are an approved follower — see the
  // privacy filter in socialStore.tsx. Their replies on OTHER (public)
  // authors' posts stay visible either way, matching how private accounts
  // behave on real social apps (only their own posts/grid are gated).
  isPrivate?: boolean
}

export interface SocialReply {
  id: string
  author: SocialAuthor
  text: string
  createdAt: number
  likes: number
  isUser?: boolean
  // A reply to this reply — one level of nesting, used by seed content to show
  // a mix of comments that have a follow-up and comments that don't.
  replies?: SocialReply[]
  // Set only on a freshly user-submitted reply (addReply in socialStore.tsx)
  // when it was posted via a specific comment's "Reply" action — the id of the
  // top-level reply it should be merged/nested under. Undefined means it's a
  // new top-level comment on the post itself.
  parentReplyId?: string
}

// Total comment count for a post's comment icon/badge — includes nested replies,
// not just top-level ones, so "12 comments" matches what's actually in the thread.
export function countReplies(replies: SocialReply[]): number {
  return replies.reduce((sum, r) => sum + 1 + (r.replies ? countReplies(r.replies) : 0), 0)
}

// Flattens top-level + nested replies into one list — used where callers need
// every reply regardless of nesting (e.g. a profile's own authored replies).
export function flattenReplies(replies: SocialReply[]): SocialReply[] {
  return replies.flatMap((r) => [r, ...(r.replies ? flattenReplies(r.replies) : [])])
}

export type SocialPostKind = "reflection" | "deed-share"

export type SocialVisibility = "public" | "private"

// AI moderation status for a post. Undefined/omitted (seed posts, and posts stored
// before this field existed) is treated as "posted" — see socialStore.tsx.
export type ModerationStatus = "posted" | "pending" | "rejected"

export interface SocialPost {
  id: string
  author: SocialAuthor
  kind: SocialPostKind
  text: string
  createdAt: number
  likes: number
  replies: SocialReply[]
  deedTitle?: string
  deedPoints?: number
  deedStreak?: number
  subscriptionId?: string
  videoId?: string
  imageId?: string
  audioId?: string
  audioSeconds?: number
  quranAttachment?: QuranAttachment
  location?: string
  isUser?: boolean
  visibility?: SocialVisibility
  archived?: boolean
  moderationStatus?: ModerationStatus
  moderationResolvesAt?: number
  autoDeleteAt?: number
}

export const YOU: SocialAuthor = { name: "You", handle: "@you", initials: "Y", color: "brand", followers: 0, points: 0 }

const AMINA: SocialAuthor = {
  name: "Amina R.",
  handle: "@amina_r",
  initials: "AR",
  color: "emerald",
  followers: 1240,
  points: 2400,
}
const YUSUF: SocialAuthor = {
  name: "Yusuf K.",
  handle: "@yusufk",
  initials: "YK",
  color: "cyan",
  followers: 860,
  points: 850,
}
const FATIMA: SocialAuthor = {
  name: "Fatima Z.",
  handle: "@fatimaz",
  initials: "FZ",
  color: "rose",
  followers: 2103,
  points: 5200,
}
const BILAL: SocialAuthor = {
  name: "Bilal H.",
  handle: "@bilalh",
  initials: "BH",
  color: "amber",
  followers: 431,
  points: 320,
}
const MARYAM: SocialAuthor = {
  name: "Maryam S.",
  handle: "@maryam_s",
  initials: "MS",
  color: "violet",
  followers: 694,
  points: 1600,
}
const OMAR: SocialAuthor = {
  name: "Omar T.",
  handle: "@omart",
  initials: "OT",
  color: "brand",
  followers: 1518,
  points: 3100,
}
const MOCKIE: SocialAuthor = {
  name: "Mockie",
  handle: "@mockie",
  initials: "MO",
  color: "cyan",
  followers: 212,
  points: 1150,
  isPrivate: true,
}
const AUNI: SocialAuthor = {
  name: "Auni",
  handle: "@auni",
  initials: "AU",
  color: "rose",
  followers: 89,
  points: 460,
  isPrivate: true,
}

export const ALL_AUTHORS: SocialAuthor[] = [AMINA, YUSUF, FATIMA, BILAL, MARYAM, OMAR, MOCKIE, AUNI]

// YOU's points are tracked live in useGoodDeeds(), not seeded here like the
// fictional authors — callers pass that value through as `yourPoints`.
export function authorPoints(author: SocialAuthor, yourPoints: number): number {
  return author.handle === YOU.handle ? yourPoints : author.points
}

// Static seed "who follows whom" graph for the fictional authors — this app has no
// backend, so seed authors' follow relationships are fixed demo data rather than
// something users can change (only YOU's follows are real, tracked in socialStore).
// A couple of authors following "@you" back gives the current user's own Followers
// list some starting content instead of being empty by default.
export const AUTHOR_FOLLOWING: Record<string, string[]> = {
  "@amina_r": ["@yusufk", "@fatimaz", "@omart", "@you"],
  "@yusufk": ["@amina_r", "@bilalh"],
  "@fatimaz": ["@amina_r", "@maryam_s", "@omart"],
  "@bilalh": ["@yusufk", "@fatimaz", "@you"],
  "@maryam_s": ["@fatimaz", "@omart", "@amina_r"],
  "@omart": ["@amina_r", "@maryam_s", "@you"],
  "@mockie": ["@amina_r", "@bilalh"],
  "@auni": ["@maryam_s"],
}

function hoursAgo(h: number) {
  return Date.now() - h * 60 * 60 * 1000
}

// Deterministic PRNG (mulberry32) so the generated feed below looks the same
// every time the app loads fresh, instead of reshuffling on every reload.
function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

const GENERATED_AUTHORS = [AMINA, YUSUF, FATIMA, BILAL, MARYAM, OMAR]

const REFLECTION_TEMPLATES: string[] = [
  "Started praying the two rak'ahs before Fajr again this week and I forgot how much of a difference they make to how the rest of the day feels.",
  "Small reminder for the group: istighfar isn't just for after you mess up, say it randomly through the day too, it adds up fast.",
  "Reading one page of tafsir alongside the actual ayahs has completely changed how I experience Qur'an time. Recommend it to anyone who feels like recitation alone isn't landing.",
  "Someone asked me why I still track deed streaks as an adult and honestly — because the days I don't track are always the days I skip things without noticing.",
  "Du'a after the adhan and before iqamah is such an underrated window. A couple minutes, guaranteed acceptance, and most of us just scroll through it.",
  "Made wudu just to sit and make dhikr tonight, no particular reason, just wanted the reset. Highly recommend when your mind feels loud.",
  "The 10 minutes after Asr hit different when the house is quiet. Been using it for Qur'an instead of my phone this week and it's sticking so far.",
  "If your Isha keeps slipping late because of screens, try putting the phone in another room right after Maghrib. Sounds too simple but it's working for me.",
  "Grateful reminder: every single deed you log here, even the small ones, is still being written down whether you feel it or not. Consistency over intensity.",
  "Been trying to say salawat every time I hear the Prophet's ﷺ name mentioned instead of just nodding along mentally. Small habit, feels different once it's actually a habit.",
  "Sadaqah doesn't have to be money — held the door, helped someone carry groceries, and made du'a for a stranger today. All of it counts.",
  "Anyone else's Qur'an reading slow down the second Ramadan ends? Trying to keep even one page a day going instead of falling completely off.",
  "Prayed Duha for the first time in months this morning and forgot how good it feels to start the day with something extra instead of rushing straight into work.",
  "Reminder that qada' prayers exist for a reason — missing one isn't the end, but letting the missed ones pile up without ever making them up is the actual habit to watch for.",
  "Tried memorizing just three ayahs a night instead of a whole page and it's actually sticking this time. Slower but it's staying in my head longer.",
  "The best dhikr session I've had all month was in the car on the way to work with no music on. Didn't expect that but I'll take it.",
  "Every time I think I don't have 5 minutes for extra worship, I check my screen time and realize I definitely do. Just a callout to myself honestly.",
  "Fasting a random Monday this week not for any streak, just because it felt like something my heart needed. Sometimes it's not about the tracker.",
]

interface DeedShareTemplate {
  text: string
  deedTitle: string
  deedPoints: number
  deedStreak: number
}

const DEED_SHARE_TEMPLATES: DeedShareTemplate[] = [
  {
    text: "Two weeks straight of Tahajjud now, alhamdulillah. Waking up is still the hardest part every single time but it's never once been the wrong choice.",
    deedTitle: "Tahajjud (Night Vigil Prayer)",
    deedPoints: 50,
    deedStreak: 14,
  },
  {
    text: "Hit a 10-day Duha streak this morning — smallest deed on my list but somehow the one I look forward to most.",
    deedTitle: "Duha Prayer (Forenoon Prayer)",
    deedPoints: 25,
    deedStreak: 10,
  },
  {
    text: "21 Mondays and Thursdays of fasting this year so far. Didn't think I'd keep this up past the first month honestly.",
    deedTitle: "Fasting Mondays & Thursdays",
    deedPoints: 45,
    deedStreak: 21,
  },
  {
    text: "5 obligatory prayers on time, every single one, for 7 days straight. Feels small written out but this is genuinely the longest streak I've ever had.",
    deedTitle: "5 Obligatory Prayers (Fard)",
    deedPoints: 50,
    deedStreak: 7,
  },
  {
    text: "Finished reciting Surah Al-Mulk before sleep for 30 nights in a row now. Falling asleep mid-recitation more often than not but I'll count it.",
    deedTitle: "Recite Surah Al-Mulk Before Sleep",
    deedPoints: 40,
    deedStreak: 30,
  },
  {
    text: "12 days of Witr without missing a single night — smallest addition to the day but it's become non-negotiable at this point.",
    deedTitle: "Witr Prayer",
    deedPoints: 30,
    deedStreak: 12,
  },
  {
    text: "Made it to the mosque for congregational prayer 9 times this week between work and errands. Didn't think my schedule allowed for that many honestly.",
    deedTitle: "Congregational Prayer in Mosque",
    deedPoints: 60,
    deedStreak: 9,
  },
  {
    text: "18 days straight of morning and evening adhkar. The evening set especially has become the thing that actually closes my day out properly.",
    deedTitle: "Morning & Evening Adhkar",
    deedPoints: 35,
    deedStreak: 18,
  },
  {
    text: "Kept up Jumu'ah early arrival — front rows, no rushing in late — for 6 weeks running now. Small change but Fridays feel completely different.",
    deedTitle: "Jumu'ah (Friday) Prayer",
    deedPoints: 80,
    deedStreak: 6,
  },
]

const COMMENT_TEMPLATES: string[] = [
  "JazakAllah khair for this, needed the reminder today.",
  "MashaAllah, this is really motivating.",
  "Ameen, may Allah make it easy for all of us.",
  "This is exactly what I needed to read right now.",
  "Saving this one, thank you for sharing.",
  "SubhanAllah, so true.",
  "Honestly relate to this so much.",
  "This is the push I needed, jazakAllah khair.",
  "May Allah accept it from you and increase you in good.",
  "Been thinking about this same thing all week, thank you.",
  "Ameen, keep it up, this is inspiring.",
  "Definitely trying this starting today.",
  "This deserves way more likes honestly.",
  "Needed to hear this, thank you for posting.",
  "MashaAllah tabarakAllah, keep going.",
  "Bookmarking this for the next time I need it.",
  "This community is honestly so motivating.",
  "Ameen to that, may Allah make it consistent for you.",
  "Real talk, this hit different today.",
  "Thank you for the reminder, exactly on time.",
  "This is such a simple but powerful reminder.",
  "Allahumma barik, keep this up.",
]

const NESTED_REPLY_TEMPLATES: string[] = [
  "Exactly this, couldn't agree more.",
  "Same here honestly, it's been a game changer.",
  "Ameen, trying this from today too.",
  "This right here, 100%.",
  "Following your lead on this one 🤲",
  "Been doing this since last week and it's sticking.",
  "MashaAllah, needed to see someone else say this.",
  "This thread alone made my day better.",
  "Couldn't have said it better myself.",
  "Trying to build the same habit, this helps.",
  "Ameen, may Allah keep it easy for both of us.",
  "Real, this is the way.",
  "Screenshotting this as a reminder for myself.",
  "This is such an underrated point honestly.",
]

const LOCATION_TEMPLATES: string[] = [
  "Masjid Al-Noor",
  "Islamic Center",
  "Central Mosque",
  "Al-Ihsan Mosque",
  "Community Musalla",
  "Masjid Ar-Rahman",
  "Grand Mosque",
  "Masjid At-Taqwa",
]

function buildGeneratedPosts(): SocialPost[] {
  const rand = mulberry32(20260827)
  const posts: SocialPost[] = []
  let hoursCursor = 34
  let lastAuthorHandle: string | null = null

  for (let i = 7; i <= 50; i++) {
    let author = pick(GENERATED_AUTHORS, rand)
    while (author.handle === lastAuthorHandle) author = pick(GENERATED_AUTHORS, rand)
    lastAuthorHandle = author.handle

    hoursCursor += 3 + Math.floor(rand() * 10)
    const createdAt = hoursAgo(hoursCursor)
    const likes = 10 + Math.floor(rand() * 130)

    const isDeedShare = rand() < 0.35
    const deedShare = isDeedShare ? pick(DEED_SHARE_TEMPLATES, rand) : null

    const commentCount = 1 + Math.floor(rand() * 4)
    const replies: SocialReply[] = []
    for (let c = 0; c < commentCount; c++) {
      const commentAuthor = pick(
        GENERATED_AUTHORS.filter((a) => a.handle !== author.handle),
        rand,
      )
      const commentCreatedAt = createdAt + (c + 1) * (1000 * 60 * (15 + Math.floor(rand() * 30)))

      let nestedReply: SocialReply[] | undefined
      if (rand() < 0.4) {
        const nestedAuthor = pick(
          GENERATED_AUTHORS.filter((a) => a.handle !== commentAuthor.handle),
          rand,
        )
        nestedReply = [
          {
            id: `seed-${i}-r${c + 1}-n1`,
            author: nestedAuthor,
            text: pick(NESTED_REPLY_TEMPLATES, rand),
            createdAt: commentCreatedAt + 1000 * 60 * (10 + Math.floor(rand() * 20)),
            likes: Math.floor(rand() * 8),
          },
        ]
      }

      replies.push({
        id: `seed-${i}-r${c + 1}`,
        author: commentAuthor,
        text: pick(COMMENT_TEMPLATES, rand),
        createdAt: commentCreatedAt,
        likes: Math.floor(rand() * 15),
        ...(nestedReply ? { replies: nestedReply } : {}),
      })
    }

    // Media roll: ~8% get location+picture+video together, ~12% picture only,
    // ~10% video only, ~15% location only, the rest (~55%) get none — so
    // "several" have a location, "some" have video, "some" have a picture,
    // and a handful have all three at once.
    const mediaRoll = rand()
    let location: string | undefined
    let imageId: string | undefined
    let videoId: string | undefined
    if (mediaRoll < 0.08) {
      location = pick(LOCATION_TEMPLATES, rand)
      imageId = pick(SEED_IMAGE_IDS, rand)
      videoId = pick(SEED_VIDEO_IDS, rand)
    } else if (mediaRoll < 0.2) {
      imageId = pick(SEED_IMAGE_IDS, rand)
    } else if (mediaRoll < 0.3) {
      videoId = pick(SEED_VIDEO_IDS, rand)
    } else if (mediaRoll < 0.45) {
      location = pick(LOCATION_TEMPLATES, rand)
    }

    posts.push({
      id: `seed-${i}`,
      author,
      kind: deedShare ? "deed-share" : "reflection",
      text: deedShare ? deedShare.text : pick(REFLECTION_TEMPLATES, rand),
      createdAt,
      likes,
      replies,
      ...(deedShare
        ? { deedTitle: deedShare.deedTitle, deedPoints: deedShare.deedPoints, deedStreak: deedShare.deedStreak }
        : {}),
      ...(location ? { location } : {}),
      ...(imageId ? { imageId } : {}),
      ...(videoId ? { videoId } : {}),
    })
  }

  return posts
}

export function buildSeedPosts(): SocialPost[] {
  const fixedPosts: SocialPost[] = [
    // Fixed demo entries showing the AI-moderation pending/rejected states on your
    // own Posts tab. Unlike a post you actually create, these never resolve — they
    // aren't in the live userPosts array the moderation timer scans, so they stay
    // in this state as a standing example. Still fully deletable/archivable like
    // any of your posts (see deletePost's deletedPostIds overlay).
    {
      id: "seed-you-pending-1",
      author: YOU,
      kind: "reflection",
      text: "Just shared today's fasting reflection — should show up here once it clears review.",
      createdAt: hoursAgo(0.05),
      likes: 0,
      replies: [],
      isUser: true,
      visibility: "public",
      moderationStatus: "pending",
    },
    {
      id: "seed-you-rejected-1",
      author: YOU,
      kind: "reflection",
      text: "Anyone know a good gambling app for prediction markets? Half-joking but actually curious.",
      createdAt: hoursAgo(2),
      likes: 0,
      replies: [],
      isUser: true,
      visibility: "public",
      moderationStatus: "rejected",
    },
    {
      id: "seed-1",
      author: AMINA,
      kind: "reflection",
      text: "Reminder for anyone scrolling tonight: a prayer made up late is still so much better than one left behind. Don't let one missed one turn into a habit of skipping — qada' exists for a reason 🤍",
      createdAt: hoursAgo(3),
      likes: 41,
      replies: [
        {
          id: "seed-1-r1",
          author: BILAL,
          text: "Needed this today, jazakAllah khair.",
          createdAt: hoursAgo(2),
          likes: 5,
          replies: [
            {
              id: "seed-1-r1-n1",
              author: YUSUF,
              text: "Same, this was exactly the reminder I needed too.",
              createdAt: hoursAgo(1.5),
              likes: 2,
            },
          ],
        },
        { id: "seed-1-r2", author: FATIMA, text: "Ameen, honestly printing this out.", createdAt: hoursAgo(1), likes: 2 },
        {
          id: "seed-1-r3",
          author: MOCKIE,
          text: "Needed to see this today, thank you.",
          createdAt: hoursAgo(0.5),
          likes: 1,
        },
      ],
    },
    {
      id: "seed-2",
      author: YUSUF,
      kind: "reflection",
      text: "The small consistent deeds really do add up more than the big occasional ones. A short dhikr after every prayer, every day, beats one huge burst of ibadah you can't keep up.",
      createdAt: hoursAgo(7),
      likes: 63,
      replies: [
        {
          id: "seed-2-r1",
          author: MARYAM,
          text: "This is exactly why I like tracking it here instead of just \"trying to remember\"",
          createdAt: hoursAgo(5),
          likes: 8,
          replies: [
            {
              id: "seed-2-r1-n1",
              author: BILAL,
              text: "Real, the tracker keeps me honest about it too.",
              createdAt: hoursAgo(4),
              likes: 3,
            },
          ],
        },
      ],
    },
    {
      id: "seed-3",
      author: OMAR,
      kind: "deed-share",
      text: "Alhamdulillah — kept Witr every single night this month. Didn't think I'd make it past week one 😅",
      deedTitle: "Witr Prayer",
      deedPoints: 30,
      deedStreak: 30,
      createdAt: hoursAgo(11),
      likes: 88,
      replies: [
        {
          id: "seed-3-r1",
          author: AMINA,
          text: "MashaAllah 30 days is huge, may Allah keep it going for you",
          createdAt: hoursAgo(9),
          likes: 6,
          replies: [
            {
              id: "seed-3-r1-n1",
              author: FATIMA,
              text: "Ameen, following this thread for motivation ngl.",
              createdAt: hoursAgo(8.5),
              likes: 2,
            },
          ],
        },
        { id: "seed-3-r2", author: YUSUF, text: "This is motivating me to restart mine honestly", createdAt: hoursAgo(8), likes: 3 },
      ],
    },
    {
      id: "seed-4",
      author: FATIMA,
      kind: "reflection",
      text: "Question for the group — what's one Sunnah you're trying to revive this month? Mine is sleeping right after Isha instead of doom-scrolling till 1am 😭",
      createdAt: hoursAgo(15),
      likes: 34,
      replies: [
        {
          id: "seed-4-r1",
          author: BILAL,
          text: "Eating with my right hand and actually sitting down for it, not standing by the fridge lol",
          createdAt: hoursAgo(14),
          likes: 11,
          replies: [
            {
              id: "seed-4-r1-n1",
              author: OMAR,
              text: "The \"standing by the fridge\" callout hit different lol, guilty.",
              createdAt: hoursAgo(13.5),
              likes: 4,
            },
          ],
        },
        { id: "seed-4-r2", author: MARYAM, text: "Saying the du'a before leaving the house every time, not just when I remember", createdAt: hoursAgo(13), likes: 4 },
      ],
    },
    {
      id: "seed-5",
      author: MARYAM,
      kind: "reflection",
      text: "Fasting Mondays and Thursdays hits different when you prep the night before. Suhoor doesn't have to be a full meal — dates, water, and a couple bites is enough to make the day easier.",
      createdAt: hoursAgo(20),
      likes: 27,
      replies: [
        { id: "seed-5-r1", author: OMAR, text: "Dates and water alone has genuinely saved me more than once", createdAt: hoursAgo(18), likes: 3 },
      ],
    },
    {
      id: "seed-6",
      author: BILAL,
      kind: "reflection",
      text: "Last third of the night is quiet in a way daytime never is. If you've never tried waking up just for a few minutes of du'a before Fajr, it's worth trying even once.",
      createdAt: hoursAgo(30),
      likes: 55,
      replies: [
        {
          id: "seed-6-r1",
          author: OMAR,
          text: "The hardest part is the alarm, once I'm up it's genuinely the best part of the day",
          createdAt: hoursAgo(28),
          likes: 7,
          replies: [
            {
              id: "seed-6-r1-n1",
              author: MARYAM,
              text: "The alarm really is 90% of the battle honestly.",
              createdAt: hoursAgo(27.5),
              likes: 3,
            },
          ],
        },
      ],
    },
    // Private accounts — their own posts only reach followers (see the
    // privacy filter in socialStore.tsx). Kept as a couple of fixed posts
    // each rather than folded into the random generator, so their locked
    // profile always has something real to unlock once approved.
    {
      id: "seed-mockie-1",
      author: MOCKIE,
      kind: "reflection",
      text: "Kept a gratitude list on my phone all week instead of just thinking it and letting it go. Rereading it tonight hit way harder than I expected.",
      createdAt: hoursAgo(6),
      likes: 14,
      replies: [
        {
          id: "seed-mockie-1-r1",
          author: AMINA,
          text: "This is such a good habit, stealing it.",
          createdAt: hoursAgo(5),
          likes: 2,
        },
      ],
    },
    {
      id: "seed-mockie-2",
      author: MOCKIE,
      kind: "reflection",
      text: "Two weeks of praying on time instead of \"whenever I get to it\" and I genuinely have more hours in my day now. Funny how that works.",
      createdAt: hoursAgo(26),
      likes: 9,
      replies: [],
    },
    {
      id: "seed-auni-1",
      author: AUNI,
      kind: "reflection",
      text: "Been journaling one page after Fajr before touching my phone. Some days it's just a sentence, but the streak itself is the point.",
      createdAt: hoursAgo(9),
      likes: 6,
      replies: [
        {
          id: "seed-auni-1-r1",
          author: MARYAM,
          text: "Love this, adding it to my morning too.",
          createdAt: hoursAgo(8),
          likes: 1,
        },
      ],
    },
  ]

  return [...fixedPosts, ...buildGeneratedPosts()]
}

export function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "now"
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d`
  const week = Math.floor(day / 7)
  return `${week}w`
}
