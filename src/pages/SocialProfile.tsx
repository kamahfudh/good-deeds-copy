import { useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, At, Clock, Heart, MagnifyingGlass } from "@phosphor-icons/react"
import { LockIcon } from "../components/icons/LockIcon"
import clsx from "clsx"
import { useSocial } from "../lib/socialStore"
import { MentionText, SocialAvatar, SocialPostCard } from "../components/SocialPostCard"
import { UnfollowSheet } from "../components/UnfollowSheet"
import {
  ALL_AUTHORS,
  flattenReplies,
  relativeTime,
  YOU,
  type SocialAuthor,
  type SocialPost,
  type SocialReply,
} from "../lib/social"
import { useGoodDeeds } from "../lib/store"
import { getTierForPoints } from "../lib/badges"
import { TierBadge } from "../components/TierBadge"
import { FollowListSheet } from "../components/FollowListSheet"

function findAuthor(handle: string, posts: SocialPost[]): SocialAuthor | undefined {
  for (const post of posts) {
    if (post.author.handle === handle) return post.author
    const reply = flattenReplies(post.replies).find((r) => r.author.handle === handle)
    if (reply) return reply.author
  }
  return undefined
}

function ReplyRow({
  reply,
  parentPost,
  liked,
  onToggleLike,
}: {
  reply: SocialReply
  parentPost: SocialPost
  liked: boolean
  onToggleLike: () => void
}) {
  return (
    <Link
      to={`/social/${parentPost.id}`}
      className="block border-b border-border py-4 first:pt-0 last:border-b-0 hover:bg-surface-raised"
    >
      <div className="flex gap-3">
        <SocialAvatar author={reply.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-semibold text-ink">{reply.author.name}</span>
            <span className="text-xs text-ink-faint">{relativeTime(reply.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-xs text-ink-faint">Replied to {parentPost.author.name}</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-ink">
            <MentionText text={reply.text} />
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggleLike()
            }}
            className={clsx(
              "tap-scale -ml-2.5 mt-2 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
              liked ? "text-rose hover:bg-rose-soft" : "text-ink-faint hover:bg-surface-raised hover:text-ink",
            )}
          >
            <Heart weight={liked ? "fill" : "regular"} className="size-4" />
            {reply.likes}
          </button>
        </div>
      </div>
    </Link>
  )
}

type Tab = "posts" | "replies" | "archived"

export function SocialProfile() {
  const { handle: rawHandle } = useParams<{ handle: string }>()
  const navigate = useNavigate()
  const {
    posts,
    isPostLiked,
    toggleLikePost,
    isReplyLiked,
    toggleLikeReply,
    isFollowing,
    isPendingFollow,
    requestFollow,
    unfollow,
    cancelFollowRequest,
    getFollowingList,
    getFollowersList,
  } = useSocial()
  const { totalPoints } = useGoodDeeds()
  const [tab, setTab] = useState<Tab>("posts")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [listSheet, setListSheet] = useState<"following" | "followers" | null>(null)
  const [confirmUnfollow, setConfirmUnfollow] = useState(false)

  const handle = `@${decodeURIComponent(rawHandle ?? "")}`
  // Falls back to the canonical directory (not just posts currently in view)
  // since a private author whose posts are hidden pre-follow wouldn't be
  // found by scanning visible posts alone.
  const derivedAuthor = useMemo(
    () => findAuthor(handle, posts) ?? ALL_AUTHORS.find((a) => a.handle === handle),
    [handle, posts],
  )
  const author = handle === YOU.handle ? YOU : derivedAuthor

  if (!author) {
    return <Navigate to="/social" replace />
  }

  const isYou = author.handle === YOU.handle
  const isLocked = Boolean(author.isPrivate) && !isYou && !isFollowing(author.handle)
  // Other authors don't have a real points balance — `points` on seed authors
  // is an illustrative total (see social.ts) that exists specifically so a
  // tier badge can be shown next to their name, same as it is for YOU.
  const tier = getTierForPoints(isYou ? totalPoints : author.points)
  const query = searchQuery.trim().toLowerCase()
  const followingList = getFollowingList(author.handle)
  const followersList = getFollowersList(author.handle)

  const allAuthorPosts = posts.filter((p) => p.author.handle === handle)
  const authorPosts = allAuthorPosts.filter(
    (p) => !p.archived && (query.length === 0 || p.text.toLowerCase().includes(query)),
  )
  const authorArchivedPosts = allAuthorPosts.filter(
    (p) => p.archived && (query.length === 0 || p.text.toLowerCase().includes(query)),
  )
  const authorReplies = posts
    .flatMap((p) =>
      flattenReplies(p.replies)
        .filter((r) => r.author.handle === handle)
        .map((reply) => ({ reply, parentPost: p })),
    )
    .filter(({ reply }) => query.length === 0 || reply.text.toLowerCase().includes(query))
    .sort((a, b) => b.reply.createdAt - a.reply.createdAt)

  function handleMention() {
    navigate("/social/new", { state: { mentionDraft: `${author!.handle} ` } })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        {searchOpen ? (
          <>
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border-strong bg-canvas px-3.5 py-2.5">
              <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search this profile..."
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery("")
              }}
              className="tap-scale shrink-0 text-sm font-medium text-brand"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
            >
              <ArrowLeft className="size-[18px]" />
            </button>
            <p className="text-[17px] font-bold text-ink">Profile</p>
            <span className="inline-flex w-10 items-center justify-end">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
              >
                <MagnifyingGlass className="size-[18px]" />
              </button>
            </span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="tap-scale mb-5 hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink lg:inline-flex"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-4 flex items-start justify-between gap-4 lg:mt-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold leading-tight text-ink">{author.name}</p>
          </div>
          <p className="mt-0.5 text-sm text-ink-faint">{author.handle}</p>
          {isYou ? (
            <Link
              to="/points"
              className="tap-scale mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber hover:bg-amber-soft/80"
            >
              <TierBadge tier={tier} state="current" size="xs" />
              {tier.label}
            </Link>
          ) : (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber">
              <TierBadge tier={tier} state="current" size="xs" />
              {tier.label}
            </span>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-faint">
            <button type="button" onClick={() => setListSheet("following")} className="tap-scale hover:text-ink">
              <span className="font-semibold text-ink">{followingList.length}</span> Following
            </button>
            <button type="button" onClick={() => setListSheet("followers")} className="tap-scale hover:text-ink">
              <span className="font-semibold text-ink">{followersList.length}</span> Followers
            </button>
          </div>
        </div>
        {isYou ? (
          <Link to="/social/settings" aria-label="Profile settings" className="tap-scale relative shrink-0">
            <SocialAvatar author={author} size="xl" />
            {tier && (
              <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-canvas">
                <TierBadge tier={tier} state="current" size="sm" />
              </span>
            )}
          </Link>
        ) : (
          <div className="relative shrink-0">
            <SocialAvatar author={author} size="xl" />
            {tier && (
              <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-canvas">
                <TierBadge tier={tier} state="current" size="sm" />
              </span>
            )}
          </div>
        )}
      </div>

      {!isYou && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (isFollowing(author.handle)) setConfirmUnfollow(true)
              else if (isPendingFollow(author.handle)) cancelFollowRequest(author.handle)
              else requestFollow(author.handle)
            }}
            className={clsx(
              "tap-scale flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
              isFollowing(author.handle) &&
                "border border-brand/25 bg-brand-soft text-brand hover:border-rose/30 hover:bg-rose-soft hover:text-rose",
              isPendingFollow(author.handle) && "border border-border-strong bg-surface-raised text-ink-muted hover:text-ink",
              !isFollowing(author.handle) && !isPendingFollow(author.handle) && "bg-brand text-white hover:bg-brand-strong",
            )}
          >
            {isFollowing(author.handle) ? "Following" : isPendingFollow(author.handle) ? "Requested" : "Follow"}
          </button>
          <button
            type="button"
            onClick={handleMention}
            className="tap-scale flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <At weight="bold" className="size-4" />
            Mention
          </button>
        </div>
      )}

      {isLocked ? (
        <div className="mt-8 flex flex-col items-center py-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full border-2 border-ink text-ink">
            <LockIcon className="size-7" />
          </span>
          <p className="mt-4 text-[15px] font-bold text-ink">This account is private</p>
          {isPendingFollow(author.handle) ? (
            <p className="mt-1.5 flex max-w-xs items-center gap-1.5 text-sm text-ink-faint">
              <Clock weight="bold" className="size-4 shrink-0" />
              Your request is pending — {author.name} needs to approve it before you can see their posts.
            </p>
          ) : (
            <p className="mt-1.5 max-w-xs text-sm text-ink-faint">
              Follow {author.name} to see their photos, deeds shared, and reflections.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mt-5 flex border-b border-border">
            <button
              type="button"
              onClick={() => setTab("posts")}
              className={clsx(
                "flex-1 border-b-[3px] pb-3.5 text-sm font-semibold transition-colors",
                tab === "posts" ? "border-brand text-brand" : "border-transparent text-ink-faint hover:text-ink",
              )}
            >
              Posts <span className="text-xs font-normal text-ink-faint">{authorPosts.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("replies")}
              className={clsx(
                "flex-1 border-b-[3px] pb-3.5 text-sm font-semibold transition-colors",
                tab === "replies" ? "border-brand text-brand" : "border-transparent text-ink-faint hover:text-ink",
              )}
            >
              Replies <span className="text-xs font-normal text-ink-faint">{authorReplies.length}</span>
            </button>
            {isYou && (
              <button
                type="button"
                onClick={() => setTab("archived")}
                className={clsx(
                  "flex-1 border-b-[3px] pb-3.5 text-sm font-semibold transition-colors",
                  tab === "archived" ? "border-brand text-brand" : "border-transparent text-ink-faint hover:text-ink",
                )}
              >
                Archive <span className="text-xs font-normal text-ink-faint">{authorArchivedPosts.length}</span>
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col">
            {tab === "posts" && (
              <>
                {authorPosts.length === 0 && (
                  <p className="py-12 text-center text-sm text-ink-faint">No posts yet.</p>
                )}
                {authorPosts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    liked={isPostLiked(post.id)}
                    onToggleLike={() => toggleLikePost(post.id)}
                  />
                ))}
              </>
            )}

            {tab === "replies" && (
              <>
                {authorReplies.length === 0 && (
                  <p className="py-12 text-center text-sm text-ink-faint">No replies yet.</p>
                )}
                {authorReplies.map(({ reply, parentPost }) => (
                  <ReplyRow
                    key={reply.id}
                    reply={reply}
                    parentPost={parentPost}
                    liked={isReplyLiked(reply.id)}
                    onToggleLike={() => toggleLikeReply(reply.id)}
                  />
                ))}
              </>
            )}

            {tab === "archived" && (
              <>
                {authorArchivedPosts.length === 0 && (
                  <p className="py-12 text-center text-sm text-ink-faint">
                    No archived posts. Archive a post from its "…" menu to hide it from the feed without deleting it.
                  </p>
                )}
                {authorArchivedPosts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    liked={isPostLiked(post.id)}
                    onToggleLike={() => toggleLikePost(post.id)}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}

      <UnfollowSheet
        open={confirmUnfollow}
        author={isYou ? null : author}
        onClose={() => setConfirmUnfollow(false)}
        onConfirm={() => {
          unfollow(author.handle)
          setConfirmUnfollow(false)
        }}
      />

      {listSheet && (
        <FollowListSheet
          open
          handle={author.handle}
          initialTab={listSheet}
          followers={followersList}
          following={followingList}
          onClose={() => setListSheet(null)}
        />
      )}
    </div>
  )
}
