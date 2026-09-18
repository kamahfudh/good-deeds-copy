# Good Deeds (copy) — Application Documentation

> Fork of `good-deeds-app` with a Social feed feature and a worship Assessment added.
> Stack: **Vite + React 18 + TypeScript + Tailwind v4 + react-router-dom**, no backend.
> Not a git repo. Dev server config name: `good-deeds-copy` (port 5191).
> Live: `https://friendly-flan-a8b73b.netlify.app`

---

## 1. Architecture at a glance

This is a **100% client-side single-page app**. There is no server, no database, and no
REST/GraphQL API. All state lives in the browser via `localStorage` (JSON blobs) and one
`IndexedDB` database (binary media blobs). This matters for the "endpoint" section requested
below — see [§8](#8-endpoint-equivalent-operations-no-backend-exists) for why there are no
real HTTP endpoints, and what the closest equivalents are.

| Layer | Mechanism | Key | Provider / file |
|---|---|---|---|
| Deeds catalog + subscriptions + completions + assessment result | `localStorage` | `good-deeds:v2` | [`src/lib/store.tsx`](src/lib/store.tsx) → `GoodDeedsProvider` |
| Social feed (user posts, likes, follows, reports) | `localStorage` | `good-deeds:social:v2` | [`src/lib/socialStore.tsx`](src/lib/socialStore.tsx) → `SocialProvider` |
| Mosque check-in (home location + active check-ins) | `localStorage` | `good-deeds:mosque:v1` | [`src/lib/mosqueStore.tsx`](src/lib/mosqueStore.tsx) → `MosqueProvider` |
| Post images/video blobs | `IndexedDB` | DB `good-deeds-social-media`, store `media` | [`src/lib/mediaStore.ts`](src/lib/mediaStore.ts) |
| Theme (light/dark) | `localStorage` | (see `src/lib/theme.tsx`) | `ThemeProvider` |

All three React Contexts (`GoodDeedsProvider`, `SocialProvider`, `MosqueProvider`) are mounted
once in `src/main.tsx` and wrap the whole `<App />`. Every store follows the **same defensive
load pattern**:

```
try { JSON.parse(localStorage.getItem(KEY)) } catch { return emptyOrSeedDefaults() }
```

So a corrupted/hand-edited localStorage value never crashes the app — it silently resets that
one store to empty/seed state. There is no migration system; shape changes are handled ad-hoc
with `??` fallbacks on read (e.g. `parsed.userPosts ?? []`).

---

## 2. Route map

Defined in [`src/App.tsx`](src/App.tsx), all routes are nested under one `<AppShell />` layout route.

| Path | Page | Notes |
|---|---|---|
| `/` | `DeedsCatalog` | Browse all deeds by category |
| `/deeds/:id` | `DeedDetail` | Subscribe / complete / edit schedule for one deed |
| `/deeds/:id/check-in` | `MosqueCheckIn` | Only reachable for deeds with `requiresMosqueCheckIn` |
| `/deeds/:id/:section` | `DeedSection` | `how-to` \| `benefit` \| `references` sub-pages |
| `/my-deeds` | `MyDeeds` | User's active subscriptions + history |
| `/my-deeds/history/:id` | `CompletionDetail` | Detail of a single completion record |
| `/assessment` | `Assessment` | Worship-profile questionnaire |
| `/social` | `Social` | Feed + composer |
| `/social/:id` | `SocialThread` | Post + replies |
| `/social/profile/:handle` | `SocialProfile` | Author profile |
| `/points` | `Points` | Points hero, badge/tier progress, ways to earn |
| `/points/rewards` | `PointsRewards` | Redemption catalog (non-functional preview) |
| `/points/social` | `PointsSocialEarning` | Drill-down: social point sources |
| `/points/deeds` | `PointsDeedsEarning` | Drill-down: deed-completion point sources |

`AppShell.tsx` decides per-route whether to show the generic top header or let the page render
its own back-button/title mobile nav bar (`hasOwnMobileNav` path-prefix list).

---

## 3. Core data models

### `Deed` (static catalog — [`src/lib/data.ts`](src/lib/data.ts), not user data)
```ts
interface Deed {
  id: string
  title: string
  arabicName?: string
  category: "salah" | "quran" | "fasting"
  subCategory: string
  points: number              // awarded per completion
  penaltyPoints: number       // displayed only — not currently deducted anywhere
  frequencyLabel: string
  suggestedDays: DayCode[]
  suggestedTime: string
  summary: string
  howTo: string[]
  benefit: string
  references: DeedReference[]
  requiresMosqueCheckIn?: boolean     // gates the /check-in flow
  mosqueMinStayMinutes?: number       // default 10 if omitted
  requiresPrayerSelection?: boolean   // gates the 5-prayer picker
}
```
`penaltyPoints` is **display-only** — shown as "N pts if missed" on `DeedDetail`, but nothing
in the codebase ever subtracts it. There is no "missed deed" detection at all (no cron/scheduler
in a client-only app).

### `Subscription` / `Completion` / `AssessmentResult` ([`src/lib/store.tsx`](src/lib/store.tsx))
```ts
interface Subscription { id, deedId, days: DayCode[], time: string, createdAt, prayers?: PrayerCode[] }
interface Completion   { id, deedId, subscriptionId, completedAt, points }
interface AssessmentResult { deedIds: string[], categoryResults, completedAt }
```
`totalPoints` is **derived**, not stored: `completions.reduce((sum, c) => sum + c.points, 0)`.
There is no separate spendable point ledger — `/points/rewards` is explicitly a non-functional
preview for this reason (see §7.6).

### `SocialPost` / `SocialReply` ([`src/lib/social.ts`](src/lib/social.ts), [`socialStore.tsx`](src/lib/socialStore.tsx))
```ts
interface SocialPost {
  id, author, kind: "reflection" | "deed-share", text, createdAt, likes, replies,
  isUser?: boolean, visibility?: "public" | "private",
  videoId?: string, imageId?: string, location?: string,
  deedTitle?: string, deedPoints?: number, deedStreak?: number, subscriptionId?: string
}
```
The **rendered** post list is always computed fresh (`useMemo`) from `[...seedPosts, ...userPosts]`
merged with `likedPostIds`/`reportedPosts`/`extraReplies` — likes/reports/replies are never
mutated onto the original post object, they're overlay state joined at render time.

### `CheckInRecord` ([`src/lib/mosqueStore.tsx`](src/lib/mosqueStore.tsx))
```ts
interface CheckInRecord { startedAt: number; dateKey: string }
```
Self-invalidating: `getCheckIn()` returns `null` if `record.dateKey !== todayKey()`, so a
check-in silently expires at midnight without any explicit cleanup code.

### `BadgeTier` ([`src/lib/badges.ts`](src/lib/badges.ts))
Seeker (0–499) → Devoted (500–1,999) → Steadfast (2,000–4,999) → Luminary (5,000+), each with
an icon and perks list, derived purely from `totalPoints`.

---

## 4. Feature flows

### 4.1 Deed discovery → subscribe → complete (core loop)
```
DeedsCatalog (/) 
  → tap a deed → DeedDetail (/deeds/:id)
      no subscription yet:
        → pick days (DayPicker, ≥1 required)
        → if requiresPrayerSelection: pick prayers (PrayerPicker, ≥1 required)
        → "Add to my deeds" → addSubscription() → subscription now exists, editing view shown
      has subscription:
        → "Mark complete today" (disabled if completedToday) → completeSubscription()
          → OR if requiresMosqueCheckIn: button becomes "Check In at Mosque" link → §4.2
        → after completion: "Share" (native share / clipboard) and "Share on Social" appear
        → "Edit" → re-opens the day/prayer picker pre-filled with current values
        → "Remove from my deeds" → removeSubscription() (also deletes all its Completions)
```
`completeSubscription` looks up the `Subscription` and its `Deed` by id; if either lookup fails
(stale/deleted id) it **silently no-ops** — no error surfaced to the user (see §5).

### 4.2 Mosque check-in state machine (`MosqueCheckIn.tsx`, deeds with `requiresMosqueCheckIn`)
Guard clause first: if the deed doesn't require check-in, has no subscription, or is already
`completedToday`, the page immediately `<Navigate>`s away (to the deed page or `/my-deeds`).

States, in order:
1. **No home location set** — "Set this location as my mosque" button → one-shot
   `getCurrentPosition()` → saved to `mosqueStore`.
2. **Locating / checking position** — `watchPosition()` runs continuously once a home location
   exists; distance to home computed via haversine (`geo.ts`).
3. **Not at mosque** — `distance > 150m` → amber warning ring, shows live distance.
4. **At mosque, not yet checked in** — `distance ≤ 150m` → a `useEffect` **auto-starts** the
   check-in with no extra tap (arriving at the screen already implies intent).
5. **Checked in, counting down** — ring fills over `mosqueMinStayMinutes` (default 10, per-deed
   override) using `Date.now() - startedAt`, so progress survives reloads/navigation. A second
   `useEffect` **auto-cancels** the check-in the instant a live reading shows `distance > 150m`
   (leaving the mosque resets progress to zero — no partial credit).
6. **Ready** — timer hits the minimum stay → emerald ring + "Mark Complete" → calls
   `completeSubscription()` **and** `endCheckIn()`, then navigates back to the deed page.

User can also manually **"Cancel check-in"** at any time while counting down.

### 4.3 Streak calculation (`currentStreak` in `store.tsx`)
Walks backward day-by-day from today (or yesterday, if today has no completion yet) counting
consecutive calendar days with ≥1 completion for that subscription, stopping at the first gap.
Note: this is a **UI-derived** streak recomputed on every render, not a stored value — the
`deedStreak` attached to a social deed-share post is a snapshot taken at share time, so it can
drift from the live streak afterward (expected, not a bug).

### 4.4 Assessment questionnaire (`Assessment.tsx` + `src/lib/questionnaire.ts`)
Branching decision tree (`QUESTIONS` keyed by node id, e.g. `Q1` → `Q1.1` → `Q2` …) walked by
an `answers: {nodeId, optionIndex}[]` array — `deriveAssessmentState(answers)` replays that
array from `START_NODE` each time to get the current node + accumulated per-category results
(this makes "Back" trivial: just `answers.slice(0, -1)` and state re-derives itself).
```
intro screen ("Start assessment" / "Not now")
  → question screens (one per category: salah → quran → fasting), each option either
    branches to another question OR attaches a {profile, deedIds} result for that category
  → results screen (profile badge + recommended deeds per category)
      "Save & view recommended deeds" → saveAssessment() → navigate home
      "Retake assessment" → resets answers, restarts flow
```
If a saved assessment already exists, `/assessment` can also open directly in **viewSaved**
mode (`location.state.viewSaved`) showing the last result with "Retake" / "Close" instead of
save.

### 4.5 Points & Badges (`Points.tsx`, `PointsRewards.tsx`, `PointsSocialEarning.tsx`, `PointsDeedsEarning.tsx`)
```
Points (/points): hero card (totalPoints, current tier, progress to next tier)
  → "Redeem Rewards" → PointsRewards (/points/rewards) — explicitly labeled
      "Redemption is coming soon"; shows a locked/unlocked preview catalog only.
  → "Good Deeds Activity" row → PointsDeedsEarning (/points/deeds) — 3 real point ranges
      computed live from DEEDS min/max per category; "no weekly cap" banner.
  → "Social Activity" row → PointsSocialEarning (/points/social) — 4 illustrative point
      values (Post/Comment/Like/Share) with a "capped at 200 pts/week" banner.
```
**Important:** the Social point values and the weekly cap are **copy only** — nothing in
`socialStore.tsx` grants points for social actions, and `totalPoints` only ever comes from
`Completion` records. Don't assume a like/post changes the points hero.

### 4.6 Social feed & composer (`Social.tsx`)
```
composer: type text and/or attach one video (≤25MB) or one image (≤8MB, mutually exclusive
  with video — selecting one clears the other), optionally attach a deed-share (pre-filled
  from DeedDetail's "Share on Social"), optionally add a free-text location, toggle
  Public/Private visibility (defaults Public)
  → "Post" (disabled until there's text OR a media file, and not already posting)
      → media (if any) saved to IndexedDB first, THEN createPost() called with the
        resulting videoId/imageId — post text falls back to a single space " " if the
        user attached media with no caption (so `text` is never truly empty in storage)
      → navigate to the new post's thread page
Feed: "For You" (all public posts) vs "Following" (own posts + followed authors' public
  posts) tabs. Private posts are excluded from BOTH tabs and from search results, but still
  show on the author's own profile page (single-user app: profile is always self-view) with
  a small "PRIVATE" pill.
Search: empty query shows follow suggestions; non-empty query matches author name/handle
  (People section) and post text/author (Posts section); "No results for …" if both empty.
```

### 4.7 Post thread, replies, likes, follow (`SocialThread.tsx`, `SocialProfile.tsx`)
- Like toggling on posts/replies is optimistic and instant (local state XOR, no confirmation).
- Replies append to `extraReplies[postId]`, sorted oldest-first alongside any seeded replies.
- Follow/unfollow toggles `followedHandles`; affects only the "Following" tab filter.
- `SocialProfile` mention-to-compose: tapping "Mention" navigates to `/social` with
  `location.state.mentionDraft` pre-filling the composer text.

### 4.8 Post menu — own post vs others' post (`PostMenu` in `SocialPostCard.tsx`)
Branches on `post.author.handle === YOU.handle`:
- **Own post** → `DeleteSheet` (bottom sheet, "This can't be undone… Cancel / Delete") →
  `deletePost()` removes it from `userPosts` and navigates to `/social` if currently on that
  post's thread.
- **Others' post** → `ReportSheet` (bottom sheet, pick one of 4 reasons) → `reportPost()`
  records the reason; the post is then filtered out of the merged `posts` list everywhere
  (`!(post.id in reportedPosts)`) — client-side "hide for me," not a real moderation action.

This split exists specifically because reporting your own post used to be the only menu action
and would silently and permanently hide it with no way to undo — see git-less project history
in memory notes; the fix is the branch above, not a shared "report or delete" combined sheet.

### 4.9 Completion detail (`CompletionDetail.tsx`)
Reached from a `MyDeeds` history row. Shows a hero card, a points breakdown (base reward,
frequency label, and a **1-indexed occurrence count** within that subscription's completions —
explicitly *not* a historical streak-at-that-time, since `Completion` doesn't store one), a
"Why this matters" card from `deed.benefit`, and a link back to the deed.

---

## 5. Error handling — by category

Because there's no server, "error handling" here means **defensive client code**, not HTTP
status handling. Everything below is exhaustive for this codebase.

| Situation | Where | Behavior |
|---|---|---|
| Corrupted / unparsable `localStorage` JSON | every `loadStore()` (`store.tsx`, `socialStore.tsx`, `mosqueStore.tsx`) | `try/catch` → falls back to seed defaults or empty store. No user-facing error message; failure is invisible by design. |
| `localStorage` missing expected keys (old shape) | same `loadStore()` functions | Field-level `??` fallbacks (`parsed.userPosts ?? []`, etc.) — never throws, degrades to empty for that field only. |
| `completeSubscription(id)` / lookups on a deleted or unknown subscription/deed id | `store.tsx` | Silent no-op (`if (!sub) return`) — no toast/error shown. Can't normally happen from the UI since ids are only ever passed from data already loaded, but is defensive against stale closures. |
| `useGoodDeeds()` / `useSocial()` / `useMosque()` called outside their Provider | all three store files | Throws `Error("useX must be used within XProvider")` — a **programmer error**, not a runtime/user-facing one; would surface as a React error boundary crash if it ever happened (it can't, given the fixed provider tree in `main.tsx`). |
| Route with an unknown/invalid `:id` (deed, post, completion) | `DeedDetail`, `MosqueCheckIn`, `CompletionDetail`, etc. | Each page defensively re-looks-up the entity and `<Navigate replace>`s to a sensible fallback (`/`, `/my-deeds`, or the deed page) if it's missing — no blank/broken screens. |
| Save without required selection (no day picked; `requiresPrayerSelection` but no prayer picked) | `DeedDetail.tsx` `handleSave` | Save button is `disabled`; inline red helper text ("Pick at least one day/prayer to continue.") — guarded both in the button `disabled` condition and again at the top of `handleSave` (defense in depth). |
| Video file over 25MB / image over 8MB | `Social.tsx` `handleVideoSelected`/`handleImageSelected` | Rejected before file is read further; inline red error text ("Video is too large — max 25MB." / "Image is too large — max 8MB."); previous selection of the other media type is cleared when a new valid one is picked (video/image are mutually exclusive). |
| Empty post (no text, no media) | `Social.tsx` | `canPost` stays false → Post button disabled; `handlePost` also re-checks and early-returns as a second guard. |
| Empty location text submitted via the location chip | `Social.tsx` `handleSaveLocation` | No-ops if the trimmed value is empty. |
| `navigator.share()` unavailable or user cancels the native share sheet | `DeedDetail.tsx` `handleExternalShare` | Falls back to `navigator.clipboard.writeText`; a cancelled share sheet throws and is caught with an explicit empty `catch {}` (documented as expected, not swallowed silently by accident). |
| `navigator.clipboard` unavailable | `DeedDetail.tsx` `handleExternalShare` | Caught and ignored (`catch {}`) — the "Shared!" pulse still shows regardless, since it's optimistic UI, not a confirmation of success. |
| Geolocation permission denied | `geo.ts` `geolocationErrorMessage` + `MosqueCheckIn.tsx` | Maps `err.code === PERMISSION_DENIED` to "Location access is blocked — enable it in your browser settings to check in."; all other error codes (position unavailable, timeout) map to a generic "Couldn't get your location. Move to an open area and try again." Shown inline in rose/red text, not a blocking modal — user can retry the same button. |
| `navigator.geolocation` not present at all (very old/unusual browser) | `MosqueCheckIn.tsx` | Explicit `"geolocation" in navigator` check → "Location services aren't available on this device." before ever calling the API. |
| Leaving the mosque radius mid-check-in | `MosqueCheckIn.tsx` | Auto-`endCheckIn()` — no error, this is expected flow control, but it does mean **no partial credit / no confirmation dialog** before the countdown resets to zero. |
| Stale check-in from a previous day | `mosqueStore.tsx` `getCheckIn` | Silently treated as absent if `record.dateKey !== todayKey()` — no explicit cleanup, no user message; a fresh check-in simply starts if conditions are met again. |
| IndexedDB open/transaction failure (`saveMedia`/`loadMediaBlob`) | `mediaStore.ts` | Promise `reject`s on `req.onerror`/`tx.onerror` — **not currently caught** by callers (`Social.tsx`'s `handlePost` awaits `saveMedia` inside a `try { … } finally { setPosting(false) }` with no `catch`, so a failure here would throw uncaught and leave the UI in `posting: false` but no user-facing error message or toast). This is the one real gap in the app's error handling — see note below. |
| Deleting/reporting a post that's already gone (race, e.g. double-tap) | `socialStore.tsx` | `filter`/spread operations are naturally idempotent — a second delete/report of an already-removed id is a harmless no-op. |
| `window === undefined` (SSR / non-browser context) | every `loadStore()` | Explicit `typeof window === "undefined"` guard returns an empty/default store instead of touching `localStorage`. Not actually exercised (this is a client-only Vite SPA with no SSR), but present defensively. |

**Known gap worth flagging:** `saveMedia()` in `mediaStore.ts` can reject (quota exceeded,
IndexedDB disabled/blocked, private-browsing restrictions in some browsers) and `Social.tsx`'s
`handlePost` does not catch that rejection — the user would see the "Posting…" button state
end (via `finally`) with no post created and no error message, which reads as a silent failure.
If this is worth fixing: wrap the `await saveMedia(...)` calls in `handlePost` with a `try/catch`
and set the existing `mediaError` state on failure, reusing the same inline-error UI already
used for oversized files.

---

## 6. Validation rules summary

| Field / action | Rule | Enforced at |
|---|---|---|
| Subscription days | ≥1 day selected | `DeedDetail.handleSave` (disabled button + inline message) |
| Prayer selection (5x-daily deeds) | ≥1 prayer selected, only when `deed.requiresPrayerSelection` | same |
| Video attachment | ≤ `MAX_VIDEO_BYTES` = 25MB | `Social.handleVideoSelected` |
| Image attachment | ≤ `MAX_IMAGE_BYTES` = 8MB | `Social.handleImageSelected` |
| Video/image | mutually exclusive per post | `Social.tsx` (`clearImage()`/`clearVideo()` called on the other's selection) |
| Post content | text and/or media required, not both empty | `canPost` computed flag + guard in `handlePost` |
| Location text | non-empty after trim | `handleSaveLocation` |
| Reply text | (implementation not read in this pass — reuses same non-empty pattern as posts in `SocialThread.tsx`) | `SocialThread.tsx` |
| Mosque check-in | must be within 150m (`MOSQUE_CHECK_IN_RADIUS_METERS`) continuously for the deed's required minutes | `MosqueCheckIn.tsx` effects |
| Mark complete (non-mosque deed) | blocked once `completedToday` is true (one completion per subscription per calendar day) | `store.tsx` `completedToday` + disabled button |

---

## 7. Feature-specific gotchas worth knowing before changing code

1. **`penaltyPoints` is decorative.** Nothing deducts it — don't assume a "missed deed" penalty
   system exists; it would need to be built from scratch (a scheduler concept doesn't exist in
   a client-only app without a backend job).
2. **Social points are illustrative copy**, not wired to `totalPoints`. Making them real
   requires calls into `store.tsx`'s `completions` array from inside `socialStore.tsx`'s
   `createPost`/`addReply`/`toggleLikePost` — a genuine cross-store integration, not present.
3. **`deedStreak` on a shared post is a snapshot**, taken once at share time via
   `handleShareToSocial` in `DeedDetail.tsx` — it will not update if the live streak changes
   afterward. This is intentional (a shared "brag" reflects the moment of sharing).
4. **Private posts are a display filter, not real access control.** No auth/backend exists;
   "private" just means excluded from the feed/search computed lists in `Social.tsx`.
5. **One mosque per user, not per deed.** `mosqueStore.tsx`'s `homeLocation` is a single global
   value; only the per-subscription `checkIns` record is deed/subscription-specific.
6. **`/points/rewards` cannot actually deduct points** — `totalPoints` is a derived read-only
   value, there's no spendable ledger to subtract from. Making redemption real needs a new
   stored field (e.g. `spentPoints`) and a redeem action in `store.tsx`.
7. **Reporting your own post** is now impossible by construction (own posts only ever get the
   Delete sheet) — don't reintroduce a shared/unconditional menu action without keeping that
   `post.author.handle === YOU.handle` branch in `PostMenu`.

---

## 8. "Endpoint"-equivalent operations (no backend exists)

The task template below asks for goal / DB-models / business logic / external APIs / repo
context per endpoint, in the shape of a typical server-side (e.g. Express/NestJS/Laravel) code
review. **This app has no server, no REST/GraphQL endpoints, and no database** — everything is
a synchronous or async-local-storage React state mutation running entirely in the browser. There
is nothing to point a request at; `curl`, Postman, etc. have no surface here.

The closest equivalents are the **store mutator functions** exposed by the three Context
providers. Documented in the same requested shape, substituting "client storage" for "database"
and "in-process function call" for "HTTP endpoint":

### 8.1 `completeSubscription(subscriptionId)`
- **Goal (equiv. `POST /completions`)**: Record that the user did a subscribed deed today.
- **Storage/Models**: `Subscription[]` (read), `Completion[]` (append) — both in `localStorage` key `good-deeds:v2`.
- **Business logic**: look up subscription → look up its `Deed` for the current point value → append a new `Completion{id, deedId, subscriptionId, completedAt: now, points}`. No dedupe check inside the function itself — the UI enforces "once per day" via the disabled button (`completedToday`), so a direct call could double-complete if triggered twice (e.g. two rapid clicks bypassing the disabled state) — no server-side idempotency exists to catch that.
- **External tools/APIs**: none.
- **Repo context**: `src/lib/store.tsx`, called from `DeedDetail.tsx` and `MosqueCheckIn.tsx`.

### 8.2 `createPost(input)`
- **Goal (equiv. `POST /posts`)**: Publish a new social post, optionally with media/deed-share/location/visibility.
- **Storage/Models**: `SocialPost[]` appended to `localStorage` key `good-deeds:social:v2`; binary media (if any) written first to `IndexedDB` (`good-deeds-social-media` / `media` store) via `saveMedia`, keyed by a generated `videoId`/`imageId` referenced from the post.
- **Business logic**: trims text, defaults empty text to a single space when media-only, defaults `visibility` to `"public"`, stamps `author: YOU`, `createdAt: Date.now()`, `kind` derived from whether a deed is attached.
- **External tools/APIs**: `IndexedDB` (browser API, not a network service).
- **Repo context**: `src/lib/socialStore.tsx` (`createPost`), `src/lib/mediaStore.ts` (`saveMedia`), invoked from `src/pages/Social.tsx`'s `handlePost`.

### 8.3 `startCheckIn` / `endCheckIn` (mosque)
- **Goal (equiv. `POST /checkins` / `DELETE /checkins/:id`)**: Start/stop a geofenced attendance timer.
- **Storage/Models**: `Record<subscriptionId, CheckInRecord>` in `localStorage` key `good-deeds:mosque:v1`.
- **Business logic**: driven entirely by client-side `watchPosition` + haversine distance vs. `homeLocation`; auto-start on entering the 150m radius, auto-end on leaving it. `dateKey` stamped so a record self-expires at day rollover with no explicit cleanup job (none is possible without a backend).
- **External tools/APIs**: browser Geolocation API (`navigator.geolocation`).
- **Repo context**: `src/lib/mosqueStore.tsx`, `src/lib/geo.ts`, `src/pages/MosqueCheckIn.tsx`.

### 8.4 `saveAssessment(result)`
- **Goal (equiv. `POST /assessment/results`)**: Persist the user's questionnaire outcome and recommended deeds.
- **Storage/Models**: `AssessmentResult | null` field in `localStorage` key `good-deeds:v2`.
- **Business logic**: collects the accumulated per-category `{profile, deedIds}` results from `deriveAssessmentState` and overwrites the single stored assessment (only one assessment is kept at a time — retaking replaces it, no history).
- **External tools/APIs**: none.
- **Repo context**: `src/lib/store.tsx`, `src/lib/questionnaire.ts`, `src/pages/Assessment.tsx`.

If a real backend is ever introduced for this app (e.g. to make Social multi-user, points
persistent server-side, or rewards actually redeemable), these four functions are exactly the
seams to convert into real HTTP endpoints — each already has a clear input shape, a single
storage concern, and no cross-cutting side effects beyond its own store.

---

## 9. Deployment

Netlify, team `mahfudhdesign`, site id `d954ff2e-efbe-4fb6-b99b-5b4d4eca03ad`.
Build: `npm run build` → `npx netlify-cli deploy --dir=dist --prod --site <id>`.
Two settings required for this SPA specifically:
- `public/_redirects` containing `/*  /index.html  200` (client-side routing needs this or
  direct loads of `/social`, `/points`, etc. 404 on Netlify's static host).
- Site-wide SSO/visitor-access must be **off** (`sso_login: false` via the Netlify API) or the
  public URL shows a private "sign in" wall instead of the app.
