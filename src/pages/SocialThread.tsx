import { useRef, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { Archive, ArrowLeft, ChatCircle, Heart, LockSimple, MagnifyingGlass, PaperPlaneTilt } from "@phosphor-icons/react"
import clsx from "clsx"
import { useSocial } from "../lib/socialStore"
import {
  AudioPost,
  AuthorTierBadge,
  AvatarFollowMenu,
  DeedShareBadge,
  ImageViewer,
  LocationPill,
  MentionText,
  ModerationBadge,
  PostMenu,
  QuranVerseBadge,
  SocialAvatar,
  VideoPlayer,
  profileHref,
} from "../components/SocialPostCard"
import { countReplies, relativeTime, YOU, type SocialReply } from "../lib/social"

export function SocialThread() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPost, addReply, isPostLiked, toggleLikePost, isReplyLiked, toggleLikeReply } = useSocial()
  const [draft, setDraft] = useState("")
  const [replyingToParentId, setReplyingToParentId] = useState<string | null>(null)
  const [replyingToName, setReplyingToName] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const composerRef = useRef<HTMLInputElement>(null)

  const post = id ? getPost(id) : undefined

  if (!post) {
    return <Navigate to="/social" replace />
  }

  function handleReply() {
    const text = draft.trim()
    if (!text || !post) return
    addReply(post.id, text, replyingToParentId ?? undefined)
    setDraft("")
    setReplyingToParentId(null)
    setReplyingToName(null)
  }

  // Addressing a specific reply nests the new one under that thread's
  // top-level comment (never deeper — replying to a nested reply still
  // attaches under its top-level ancestor, matching Instagram's flattened
  // thread convention) instead of always posting flat onto the post.
  function handleReplyTo(reply: SocialReply, topLevelId: string) {
    setDraft(`${reply.author.handle} `)
    setReplyingToParentId(topLevelId)
    setReplyingToName(reply.author.name)
    setExpandedReplies((prev) => new Set(prev).add(topLevelId))
    composerRef.current?.focus()
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  function toggleExpanded(replyId: string) {
    setExpandedReplies((prev) => {
      const next = new Set(prev)
      if (next.has(replyId)) next.delete(replyId)
      else next.add(replyId)
      return next
    })
  }

  const liked = isPostLiked(post.id)
  const query = searchQuery.trim().toLowerCase()
  const visibleReplies =
    query.length === 0
      ? post.replies
      : post.replies.filter(
          (r) => r.text.toLowerCase().includes(query) || r.author.name.toLowerCase().includes(query),
        )

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        {searchOpen ? (
          <>
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border-strong bg-canvas px-3.5 py-2.5">
              <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search replies..."
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
            <p className="text-[17px] font-bold text-ink">Thread</p>
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

      <div className="mt-4 flex gap-3 lg:mt-0">
        <AvatarFollowMenu author={post.author} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link to={profileHref(post.author.handle)} className="font-semibold text-ink hover:underline">
              {post.author.name}
            </Link>
            <AuthorTierBadge author={post.author} />
            <span className="text-sm text-ink-faint">{post.author.handle}</span>
            <span className="text-sm text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="text-sm text-ink-faint">{relativeTime(post.createdAt)}</span>
            {post.visibility === "private" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                <LockSimple weight="bold" className="size-3" />
                Private
              </span>
            )}
            {post.archived && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                <Archive weight="bold" className="size-3" />
                Archived
              </span>
            )}
            <ModerationBadge status={post.moderationStatus} />
            <PostMenu post={post} className="ml-auto" />
          </div>

          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            <MentionText text={post.text} />
          </p>

          <VideoPlayer videoId={post.videoId} className="mt-3" />
          <ImageViewer imageId={post.imageId} className="mt-3" />
          <AudioPost audioId={post.audioId} audioSeconds={post.audioSeconds} className="mt-3" />

          {(post.location || post.kind === "deed-share" || post.quranAttachment) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LocationPill location={post.location} />
              {post.kind === "deed-share" && (
                <DeedShareBadge
                  deedTitle={post.deedTitle}
                  deedPoints={post.deedPoints}
                  deedStreak={post.deedStreak}
                />
              )}
              {post.quranAttachment && (
                <QuranVerseBadge
                  surahName={post.quranAttachment.surahName}
                  fromAyah={post.quranAttachment.fromAyah}
                  toAyah={post.quranAttachment.toAyah}
                />
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 pb-4">
            <button
              type="button"
              onClick={() => toggleLikePost(post.id)}
              className={clsx(
                "tap-scale flex items-center gap-1.5 text-sm font-medium",
                liked ? "text-rose" : "text-ink-faint hover:text-ink",
              )}
            >
              <Heart weight={liked ? "fill" : "regular"} className="size-[18px]" />
              {post.likes}
            </button>
            <span className="flex items-center gap-1.5 text-sm font-medium text-ink-faint">
              <ChatCircle className="size-[18px]" />
              {countReplies(post.replies)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border border-t border-border">
        {visibleReplies.map((reply) => {
          const nested = reply.replies ?? []
          const expanded = expandedReplies.has(reply.id)
          return (
            <div key={reply.id} className="py-3">
              <div className="flex items-start gap-3">
                <AvatarFollowMenu author={reply.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm leading-relaxed">
                    <Link to={profileHref(reply.author.handle)} className="font-semibold text-ink hover:underline">
                      {reply.author.name}
                    </Link>
                    <AuthorTierBadge author={reply.author} />
                    <span className="text-ink-muted">
                      <MentionText text={reply.text} />
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
                    <span>{relativeTime(reply.createdAt)}</span>
                    {reply.likes > 0 && <span>{reply.likes} {reply.likes === 1 ? "like" : "likes"}</span>}
                    <button
                      type="button"
                      onClick={() => handleReplyTo(reply, reply.id)}
                      className="tap-scale font-semibold hover:text-ink"
                    >
                      Reply
                    </button>
                  </div>

                  {nested.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(reply.id)}
                      className="tap-scale mt-2.5 flex items-center gap-2 text-xs font-semibold text-ink-faint hover:text-ink"
                    >
                      <span className="h-px w-6 bg-border-strong" />
                      {expanded ? "Hide replies" : `View ${nested.length} ${nested.length === 1 ? "reply" : "replies"}`}
                    </button>
                  )}

                  {expanded && nested.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3">
                      {nested.map((child) => (
                        <div key={child.id} className="flex items-start gap-2.5">
                          <AvatarFollowMenu author={child.author} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm leading-relaxed">
                              <Link
                                to={profileHref(child.author.handle)}
                                className="font-semibold text-ink hover:underline"
                              >
                                {child.author.name}
                              </Link>
                              <AuthorTierBadge author={child.author} />
                              <span className="text-ink-muted">
                                <MentionText text={child.text} />
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
                              <span>{relativeTime(child.createdAt)}</span>
                              {child.likes > 0 && (
                                <span>{child.likes} {child.likes === 1 ? "like" : "likes"}</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleReplyTo(child, reply.id)}
                                className="tap-scale font-semibold hover:text-ink"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleLikeReply(child.id)}
                            aria-label="Like"
                            className="tap-scale shrink-0 pt-0.5"
                          >
                            <Heart
                              weight={isReplyLiked(child.id) ? "fill" : "regular"}
                              className={clsx("size-3.5", isReplyLiked(child.id) ? "text-rose" : "text-ink-faint")}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleLikeReply(reply.id)}
                  aria-label="Like"
                  className="tap-scale shrink-0 pt-0.5"
                >
                  <Heart
                    weight={isReplyLiked(reply.id) ? "fill" : "regular"}
                    className={clsx("size-4", isReplyLiked(reply.id) ? "text-rose" : "text-ink-faint")}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {post.replies.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-faint">No replies yet — be the first.</p>
      )}
      {post.replies.length > 0 && visibleReplies.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-faint">No replies match your search.</p>
      )}

      <div className="fixed inset-x-4 bottom-4 z-30 sm:inset-x-6 lg:inset-x-10">
        <div className="mx-auto max-w-3xl lg:max-w-2xl">
          {replyingToParentId && (
            <div className="mb-2 flex items-center justify-between rounded-full bg-surface px-4 py-2 text-xs text-ink-faint shadow-pop">
              <span>Replying in thread</span>
              <button
                type="button"
                onClick={() => {
                  setReplyingToParentId(null)
                  setReplyingToName(null)
                  setDraft("")
                }}
                className="tap-scale font-semibold hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <SocialAvatar author={YOU} size="sm" />
            <div className="flex min-w-0 flex-1 items-center rounded-full border border-border-strong bg-surface-raised px-4 py-2.5 shadow-pop">
              <input
                ref={composerRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleReply()
                }}
                placeholder={`Reply to ${replyingToName ?? post.author.name}...`}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={draft.trim().length === 0}
              onClick={handleReply}
              aria-label="Send reply"
              className={clsx(
                "tap-scale flex size-10 shrink-0 items-center justify-center rounded-full shadow-pop transition-colors",
                draft.trim().length === 0
                  ? "cursor-not-allowed bg-surface-raised text-ink-faint"
                  : "bg-brand text-white hover:bg-brand-strong",
              )}
            >
              <PaperPlaneTilt weight="fill" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
