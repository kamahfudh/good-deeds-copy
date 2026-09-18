import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  ALL_AUTHORS,
  AUTHOR_FOLLOWING,
  buildSeedPosts,
  YOU,
  type SocialAuthor,
  type SocialPost,
  type SocialReply,
  type SocialVisibility,
} from "./social"
import { ensureSeedMediaGenerated } from "./seedMedia"
import type { QuranAttachment } from "./quran"

export type ReportReason = "Spam" | "Harassment or bullying" | "False information" | "Something else"

export interface ReportDetails {
  reason: ReportReason
  // Only set when reason is "Something else" — the user's own free-text explanation.
  details?: string
}

// How long a freshly-created post stays "pending" before the simulated AI check
// resolves it. There is no real moderation backend here — this is a stand-in that
// flags a small set of demo keywords as policy violations so the Rejected state is
// reachable and testable without a real content-safety model.
const MODERATION_DELAY_MS = 3000
const MODERATION_BANNED_KEYWORDS = ["scam", "spam", "gambling", "hate speech", "nsfw", "riba"]

// How long a follow request to a private account sits "pending" before the
// simulated approval resolves it. There is no real account owner here to
// approve/deny, so — like the moderation stand-in above — this just
// auto-approves after a delay so the request → approved flow is reachable
// and testable.
const FOLLOW_REQUEST_APPROVAL_DELAY_MS = 3000

// A rejected post is auto-deleted this long after rejection, unless the user
// deletes it themselves first.
export const REJECTED_AUTO_DELETE_MS = 24 * 60 * 60 * 1000

function runModerationCheck(text: string): "posted" | "rejected" {
  const lower = text.toLowerCase()
  return MODERATION_BANNED_KEYWORDS.some((word) => lower.includes(word)) ? "rejected" : "posted"
}

// Merges a post's stored top-level replies with user-submitted extras. Extras
// with no parentReplyId are new top-level comments; extras with one are
// nested under the matching top-level reply (never deeper — replying to a
// nested reply still attaches under its top-level ancestor, same as
// Instagram's flattened-thread convention), appended after any existing
// nested replies so they show up last.
function mergeExtraReplies(baseReplies: SocialReply[], extra: SocialReply[]): SocialReply[] {
  const topLevelExtra = extra.filter((r) => !r.parentReplyId)
  const nestedExtra = extra.filter((r) => r.parentReplyId)
  return [...baseReplies, ...topLevelExtra].map((reply) => {
    const attached = nestedExtra.filter((n) => n.parentReplyId === reply.id)
    if (attached.length === 0) return reply
    return { ...reply, replies: [...(reply.replies ?? []), ...attached] }
  })
}

interface SocialStoreShape {
  userPosts: SocialPost[]
  extraReplies: Record<string, SocialReply[]>
  likedPostIds: string[]
  likedReplyIds: string[]
  followedHandles: string[]
  // Follow requests sent to a private account, awaiting (simulated) approval —
  // separate from followedHandles since a pending request is not yet a follow.
  // Keyed by handle, valued by the timestamp it resolves at, so a pending
  // request survives a reload the same way pending-post-moderation does below.
  pendingFollowHandles: Record<string, number>
  reportedPosts: Record<string, ReportDetails>
  archivedPostIds: string[]
  deletedPostIds: string[]
}

const STORAGE_KEY = "good-deeds:social:v2"

function emptyStore(): SocialStoreShape {
  return {
    userPosts: [],
    extraReplies: {},
    likedPostIds: [],
    likedReplyIds: [],
    followedHandles: [],
    pendingFollowHandles: {},
    reportedPosts: {},
    archivedPostIds: [],
    deletedPostIds: [],
  }
}

function loadStore(): SocialStoreShape {
  if (typeof window === "undefined") return emptyStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as Partial<SocialStoreShape>
    return {
      userPosts: parsed.userPosts ?? [],
      extraReplies: parsed.extraReplies ?? {},
      likedPostIds: parsed.likedPostIds ?? [],
      likedReplyIds: parsed.likedReplyIds ?? [],
      followedHandles: parsed.followedHandles ?? [],
      pendingFollowHandles: parsed.pendingFollowHandles ?? {},
      reportedPosts: parsed.reportedPosts ?? {},
      archivedPostIds: parsed.archivedPostIds ?? [],
      deletedPostIds: parsed.deletedPostIds ?? [],
    }
  } catch {
    return emptyStore()
  }
}

function saveStore(store: SocialStoreShape) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export interface DeedShareAttachment {
  subscriptionId: string
  deedTitle: string
  points: number
  streak: number
}

interface CreatePostInput {
  text: string
  deed?: DeedShareAttachment
  videoId?: string
  imageId?: string
  audioId?: string
  audioSeconds?: number
  quranAttachment?: QuranAttachment
  location?: string
  visibility?: SocialVisibility
}

interface SocialApi {
  posts: SocialPost[]
  getPost: (id: string) => SocialPost | undefined
  createPost: (input: CreatePostInput) => string
  addReply: (postId: string, text: string, parentReplyId?: string) => void
  isPostLiked: (postId: string) => boolean
  toggleLikePost: (postId: string) => void
  isReplyLiked: (replyId: string) => boolean
  toggleLikeReply: (replyId: string) => void
  isFollowing: (handle: string) => boolean
  isPendingFollow: (handle: string) => boolean
  requestFollow: (handle: string) => void
  unfollow: (handle: string) => void
  cancelFollowRequest: (handle: string) => void
  reportPost: (postId: string, reason: ReportReason, details?: string) => void
  deletePost: (postId: string) => void
  isPostArchived: (postId: string) => boolean
  toggleArchivePost: (postId: string) => void
  getFollowingList: (handle: string) => SocialAuthor[]
  getFollowersList: (handle: string) => SocialAuthor[]
}

const SocialContext = createContext<SocialApi | null>(null)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<SocialStoreShape>(() => loadStore())
  const [seedPosts] = useState<SocialPost[]>(() => buildSeedPosts())

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => {
    ensureSeedMediaGenerated()
  }, [])

  const scheduleAutoDelete = useCallback((postId: string, delayMs: number) => {
    window.setTimeout(() => {
      setStore((prev) =>
        prev.deletedPostIds.includes(postId) ? prev : { ...prev, deletedPostIds: [...prev.deletedPostIds, postId] },
      )
    }, delayMs)
  }, [])

  const resolvePostModeration = useCallback(
    (postId: string) => {
      setStore((prev) => {
        const target = prev.userPosts.find((p) => p.id === postId)
        if (!target || target.moderationStatus !== "pending") return prev
        const result = runModerationCheck(target.text)
        const updated: SocialPost =
          result === "rejected"
            ? { ...target, moderationStatus: result, autoDeleteAt: Date.now() + REJECTED_AUTO_DELETE_MS }
            : { ...target, moderationStatus: result }
        if (result === "rejected") scheduleAutoDelete(postId, REJECTED_AUTO_DELETE_MS)
        return { ...prev, userPosts: prev.userPosts.map((p) => (p.id === postId ? updated : p)) }
      })
    },
    [scheduleAutoDelete],
  )

  // Recover posts left "pending"/"rejected" from a page reload/close before their
  // in-memory setTimeout could fire — neither the moderation-resolve nor the
  // rejected-post auto-delete timer survives a reload on their own.
  useEffect(() => {
    const stillPending = store.userPosts.filter((p) => p.moderationStatus === "pending")
    const pendingTimers = stillPending.map((p) =>
      window.setTimeout(() => resolvePostModeration(p.id), Math.max(0, (p.moderationResolvesAt ?? 0) - Date.now())),
    )

    const awaitingAutoDelete = store.userPosts.filter((p) => p.moderationStatus === "rejected" && p.autoDeleteAt)
    const deleteTimers = awaitingAutoDelete.map((p) =>
      window.setTimeout(
        () =>
          setStore((prev) =>
            prev.deletedPostIds.includes(p.id) ? prev : { ...prev, deletedPostIds: [...prev.deletedPostIds, p.id] },
          ),
        Math.max(0, (p.autoDeleteAt ?? 0) - Date.now()),
      ),
    )

    return () => {
      pendingTimers.forEach((t) => window.clearTimeout(t))
      deleteTimers.forEach((t) => window.clearTimeout(t))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createPost = useCallback(
    (input: CreatePostInput) => {
      const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const post: SocialPost = {
        id,
        author: YOU,
        kind: input.deed ? "deed-share" : "reflection",
        text: input.text,
        createdAt: Date.now(),
        likes: 0,
        replies: [],
        isUser: true,
        visibility: input.visibility ?? "public",
        moderationStatus: "pending",
        moderationResolvesAt: Date.now() + MODERATION_DELAY_MS,
        ...(input.videoId ? { videoId: input.videoId } : {}),
        ...(input.imageId ? { imageId: input.imageId } : {}),
        ...(input.audioId ? { audioId: input.audioId, audioSeconds: input.audioSeconds } : {}),
        ...(input.quranAttachment ? { quranAttachment: input.quranAttachment } : {}),
        ...(input.location ? { location: input.location } : {}),
        ...(input.deed
          ? {
              deedTitle: input.deed.deedTitle,
              deedPoints: input.deed.points,
              deedStreak: input.deed.streak,
              subscriptionId: input.deed.subscriptionId,
            }
          : {}),
      }
      setStore((prev) => ({ ...prev, userPosts: [post, ...prev.userPosts] }))
      window.setTimeout(() => resolvePostModeration(id), MODERATION_DELAY_MS)
      return id
    },
    [resolvePostModeration],
  )

  const addReply = useCallback((postId: string, text: string, parentReplyId?: string) => {
    const reply: SocialReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: YOU,
      text,
      createdAt: Date.now(),
      likes: 0,
      isUser: true,
      parentReplyId,
    }
    setStore((prev) => ({
      ...prev,
      extraReplies: {
        ...prev.extraReplies,
        [postId]: [...(prev.extraReplies[postId] ?? []), reply],
      },
    }))
  }, [])

  const toggleLikePost = useCallback((postId: string) => {
    setStore((prev) => ({
      ...prev,
      likedPostIds: prev.likedPostIds.includes(postId)
        ? prev.likedPostIds.filter((id) => id !== postId)
        : [...prev.likedPostIds, postId],
    }))
  }, [])

  const toggleLikeReply = useCallback((replyId: string) => {
    setStore((prev) => ({
      ...prev,
      likedReplyIds: prev.likedReplyIds.includes(replyId)
        ? prev.likedReplyIds.filter((id) => id !== replyId)
        : [...prev.likedReplyIds, replyId],
    }))
  }, [])

  // Approves a pending request — only takes effect if the request is still
  // pending (e.g. wasn't cancelled in the meantime), same guard pattern as
  // resolvePostModeration above.
  const approveFollowRequest = useCallback((handle: string) => {
    setStore((prev) => {
      if (!(handle in prev.pendingFollowHandles)) return prev
      const { [handle]: _resolved, ...restPending } = prev.pendingFollowHandles
      return {
        ...prev,
        pendingFollowHandles: restPending,
        followedHandles: prev.followedHandles.includes(handle)
          ? prev.followedHandles
          : [...prev.followedHandles, handle],
      }
    })
  }, [])

  // Public accounts follow immediately; private accounts go to "pending" and
  // simulate an owner approving the request after a short delay (see
  // approveFollowRequest — there's no real account owner here to ask).
  const requestFollow = useCallback(
    (handle: string) => {
      const author = ALL_AUTHORS.find((a) => a.handle === handle)
      setStore((prev) => {
        if (prev.followedHandles.includes(handle) || handle in prev.pendingFollowHandles) return prev
        if (author?.isPrivate) {
          return {
            ...prev,
            pendingFollowHandles: { ...prev.pendingFollowHandles, [handle]: Date.now() + FOLLOW_REQUEST_APPROVAL_DELAY_MS },
          }
        }
        return { ...prev, followedHandles: [...prev.followedHandles, handle] }
      })
      if (author?.isPrivate) {
        window.setTimeout(() => approveFollowRequest(handle), FOLLOW_REQUEST_APPROVAL_DELAY_MS)
      }
    },
    [approveFollowRequest],
  )

  const unfollow = useCallback((handle: string) => {
    setStore((prev) => ({
      ...prev,
      followedHandles: prev.followedHandles.filter((h) => h !== handle),
    }))
  }, [])

  const cancelFollowRequest = useCallback((handle: string) => {
    setStore((prev) => {
      const { [handle]: _cancelled, ...restPending } = prev.pendingFollowHandles
      return { ...prev, pendingFollowHandles: restPending }
    })
  }, [])

  // Same reload-recovery as the moderation timers above — a pending follow
  // request's setTimeout doesn't survive a reload on its own.
  useEffect(() => {
    const entries = Object.entries(store.pendingFollowHandles)
    const timers = entries.map(([handle, resolvesAt]) =>
      window.setTimeout(() => approveFollowRequest(handle), Math.max(0, resolvesAt - Date.now())),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reportPost = useCallback((postId: string, reason: ReportReason, details?: string) => {
    setStore((prev) => ({
      ...prev,
      reportedPosts: { ...prev.reportedPosts, [postId]: { reason, details } },
    }))
  }, [])

  const deletePost = useCallback((postId: string) => {
    setStore((prev) => ({
      ...prev,
      // An overlay (not a userPosts splice) so this also works for posts that ship
      // as fixed seed/demo content rather than ones created through the composer —
      // otherwise "Delete" on those would silently no-op, the same class of bug
      // fixed earlier for reporting your own post.
      deletedPostIds: prev.deletedPostIds.includes(postId) ? prev.deletedPostIds : [...prev.deletedPostIds, postId],
    }))
  }, [])

  const toggleArchivePost = useCallback((postId: string) => {
    setStore((prev) => ({
      ...prev,
      archivedPostIds: prev.archivedPostIds.includes(postId)
        ? prev.archivedPostIds.filter((id) => id !== postId)
        : [...prev.archivedPostIds, postId],
    }))
  }, [])

  const value = useMemo<SocialApi>(() => {
    // Applies the live like-overlay and chronological sort at every nesting
    // level, not just top-level replies, so a nested reply's like state and
    // ordering stay correct too.
    const applyReplyOverlay = (reply: SocialReply): SocialReply => ({
      ...reply,
      likes: reply.likes + (store.likedReplyIds.includes(reply.id) ? 1 : 0),
      replies: reply.replies ? [...reply.replies].sort((a, b) => a.createdAt - b.createdAt).map(applyReplyOverlay) : reply.replies,
    })

    const posts = [...seedPosts, ...store.userPosts]
      .filter((post) => !(post.id in store.reportedPosts) && !store.deletedPostIds.includes(post.id))
      // A private author's own posts only reach approved followers — everyone
      // else (including a pending/requested follower) can't see them in feeds,
      // search, or the author's profile until the request is approved. Their
      // replies on OTHER posts aren't touched here, same as real private
      // accounts only gating their own posts/grid, not their comments elsewhere.
      .filter(
        (post) =>
          !post.author.isPrivate ||
          post.author.handle === YOU.handle ||
          store.followedHandles.includes(post.author.handle),
      )
      .map((post) => ({
        ...post,
        likes: post.likes + (store.likedPostIds.includes(post.id) ? 1 : 0),
        archived: store.archivedPostIds.includes(post.id),
        replies: mergeExtraReplies(post.replies, store.extraReplies[post.id] ?? [])
          .sort((a, b) => a.createdAt - b.createdAt)
          .map(applyReplyOverlay),
      }))
      .sort((a, b) => b.createdAt - a.createdAt)

    const authorByHandle = (handle: string): SocialAuthor | undefined =>
      handle === YOU.handle ? YOU : ALL_AUTHORS.find((a) => a.handle === handle)

    const getFollowingList = (handle: string): SocialAuthor[] => {
      const handles = handle === YOU.handle ? store.followedHandles : AUTHOR_FOLLOWING[handle] ?? []
      return handles.map(authorByHandle).filter((a): a is SocialAuthor => a !== undefined)
    }

    const getFollowersList = (handle: string): SocialAuthor[] => {
      const seedFollowers = ALL_AUTHORS.filter((a) => (AUTHOR_FOLLOWING[a.handle] ?? []).includes(handle))
      const youFollowsThem = handle !== YOU.handle && store.followedHandles.includes(handle)
      return youFollowsThem ? [YOU, ...seedFollowers] : seedFollowers
    }

    return {
      posts,
      getPost: (id: string) => posts.find((p) => p.id === id),
      createPost,
      addReply,
      isPostLiked: (postId: string) => store.likedPostIds.includes(postId),
      toggleLikePost,
      isReplyLiked: (replyId: string) => store.likedReplyIds.includes(replyId),
      toggleLikeReply,
      isFollowing: (handle: string) => store.followedHandles.includes(handle),
      isPendingFollow: (handle: string) => handle in store.pendingFollowHandles,
      requestFollow,
      unfollow,
      cancelFollowRequest,
      reportPost,
      deletePost,
      isPostArchived: (postId: string) => store.archivedPostIds.includes(postId),
      toggleArchivePost,
      getFollowingList,
      getFollowersList,
    }
  }, [
    seedPosts,
    store,
    createPost,
    addReply,
    toggleLikePost,
    toggleLikeReply,
    requestFollow,
    unfollow,
    cancelFollowRequest,
    reportPost,
    deletePost,
    toggleArchivePost,
  ])

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error("useSocial must be used within SocialProvider")
  return ctx
}
