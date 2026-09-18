import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Archive,
  BookOpen,
  ChatCircle,
  Check,
  Clock,
  DotsThree,
  Heart,
  LockSimple,
  MapPin,
  MinusCircle,
  Play,
  Plus,
  Sparkle,
  Flame,
  User,
  WarningCircle,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { accentClasses } from "../lib/colors"
import { ALL_AUTHORS, authorPoints, countReplies, relativeTime, YOU, type SocialAuthor, type SocialPost } from "../lib/social"
import { useSocial, type ReportReason } from "../lib/socialStore"
import { useMediaUrl } from "../lib/mediaStore"
import { useGoodDeeds } from "../lib/store"
import { useToast } from "../lib/toastStore"
import { getTierForPoints } from "../lib/badges"
import { TierBadge } from "./TierBadge"
import { ReportSheet } from "./ReportSheet"
import { DeleteSheet } from "./DeleteSheet"
import { UnfollowSheet } from "./UnfollowSheet"
import { PostActionsSheet } from "./PostActionsSheet"
import { ModerationInfoSheet } from "./ModerationInfoSheet"
import { AudioAttachmentPlayer } from "./AudioAttachmentPlayer"

// Small inline tier badge shown next to an author's name in post headers and
// comment rows. Seed authors carry an illustrative `points` value (see
// social.ts); YOU's real total comes from useGoodDeeds() via authorPoints().
export function AuthorTierBadge({ author, className }: { author: SocialAuthor; className?: string }) {
  const { totalPoints } = useGoodDeeds()
  const tier = getTierForPoints(authorPoints(author, totalPoints))
  return <TierBadge tier={tier} state="current" size="xs" className={className} />
}

export function profileHref(handle: string) {
  return `/social/profile/${encodeURIComponent(handle.replace(/^@/, ""))}`
}

const MENTION_SPLIT_REGEX = /(@[a-zA-Z0-9_]+)/g
const MENTION_TEST_REGEX = /^@[a-zA-Z0-9_]+$/

// Renders post/reply text with @handle mentions highlighted in the app's
// primary color, so a tagged user stands out from the surrounding sentence.
export function MentionText({ text }: { text: string }) {
  const parts = text.split(MENTION_SPLIT_REGEX)
  return (
    <>
      {parts.map((part, i) =>
        MENTION_TEST_REGEX.test(part) ? (
          <span key={i} className="font-semibold text-brand">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

// The AI-moderation status pill shown on a post — undefined/"posted" renders nothing,
// since that's the normal state every other author's post is always in. Tapping it
// explains what the status means (and, for rejected, the 24h auto-delete).
export function ModerationBadge({ status }: { status?: SocialPost["moderationStatus"] }) {
  const [open, setOpen] = useState(false)
  if (status !== "pending" && status !== "rejected") return null
  const isPending = status === "pending"

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className={clsx(
          "tap-scale inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          isPending ? "border-amber/25 bg-amber-soft text-amber" : "border-rose/25 bg-rose-soft text-rose",
        )}
      >
        {isPending ? <Clock weight="bold" className="size-3" /> : <WarningCircle weight="bold" className="size-3" />}
        {isPending ? "Pending review" : "Rejected"}
      </button>
      <ModerationInfoSheet status={open ? status : null} onClose={() => setOpen(false)} />
    </>
  )
}

export function SocialAvatar({
  author,
  size = "md",
}: {
  author: SocialAuthor
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const classes = accentClasses(author.color)
  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-inset ring-black/10",
        size === "xl" && "size-20 text-2xl",
        size === "lg" && "size-12 text-sm",
        size === "md" && "size-10 text-xs",
        size === "sm" && "size-8 text-[10px]",
        classes.bg,
        classes.text,
      )}
    >
      {author.initials}
    </span>
  )
}

export function FollowButton({ handle, className }: { handle: string; className?: string }) {
  const { isFollowing, isPendingFollow, requestFollow, unfollow, cancelFollowRequest } = useSocial()
  const [confirmUnfollow, setConfirmUnfollow] = useState(false)
  if (handle === YOU.handle) return null
  const following = isFollowing(handle)
  const pending = isPendingFollow(handle)
  const author = ALL_AUTHORS.find((a) => a.handle === handle) ?? null

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (following) setConfirmUnfollow(true)
          else if (pending) cancelFollowRequest(handle)
          else requestFollow(handle)
        }}
        className={clsx(
          "tap-scale shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
          following && "border border-brand/25 bg-brand-soft text-brand hover:border-rose/30 hover:bg-rose-soft hover:text-rose",
          pending && "border border-border-strong bg-surface-raised text-ink-muted hover:text-ink",
          !following && !pending && "bg-brand text-white hover:bg-brand-strong",
          className,
        )}
      >
        {following ? "Following" : pending ? "Requested" : "Follow"}
      </button>
      <UnfollowSheet
        open={confirmUnfollow}
        author={author}
        onClose={() => setConfirmUnfollow(false)}
        onConfirm={() => {
          unfollow(handle)
          setConfirmUnfollow(false)
        }}
      />
    </>
  )
}

// Avatar with a quick-follow "+" corner badge (hidden once already following).
// Tapping the avatar opens a small popover — Follow / Visit profile — instead
// of navigating straight to the profile, so the byline no longer needs a
// separate always-visible Follow pill next to it.
export function AvatarFollowMenu({
  author,
  size = "md",
}: {
  author: SocialAuthor
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const { isFollowing, isPendingFollow, requestFollow, unfollow, cancelFollowRequest } = useSocial()
  const [open, setOpen] = useState(false)
  const [confirmUnfollow, setConfirmUnfollow] = useState(false)
  const isYou = author.handle === YOU.handle
  const following = isFollowing(author.handle)
  const pending = isPendingFollow(author.handle)

  if (isYou) {
    return (
      <Link to={profileHref(author.handle)} className="shrink-0">
        <SocialAvatar author={author} size={size} />
      </Link>
    )
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="tap-scale relative block rounded-full"
      >
        <SocialAvatar author={author} size={size} />
        {following ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-[var(--color-badge-bg)] text-[var(--color-badge-icon)] ring-2 ring-canvas">
            <Check weight="bold" className="size-2.5" />
          </span>
        ) : pending ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-surface-raised text-ink-muted ring-2 ring-canvas">
            <Clock weight="bold" className="size-2.5" />
          </span>
        ) : (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-brand text-white ring-2 ring-canvas">
            <Plus weight="bold" className="size-2.5" />
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(false)
            }}
          />
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-2xl border border-[var(--color-menu-border)] bg-[var(--color-menu-bg)] shadow-pop backdrop-blur-md">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpen(false)
                if (following) setConfirmUnfollow(true)
                else if (pending) cancelFollowRequest(author.handle)
                else requestFollow(author.handle)
              }}
              className="tap-scale flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-[var(--color-menu-text)] hover:bg-surface"
            >
              {following ? (
                <MinusCircle weight="bold" className="size-4" />
              ) : pending ? (
                <Clock weight="bold" className="size-4" />
              ) : (
                <Plus weight="bold" className="size-4" />
              )}
              {following ? "Unfollow" : pending ? "Cancel request" : "Follow"}
            </button>
            <Link
              to={profileHref(author.handle)}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
              className="tap-scale flex w-full items-center gap-2.5 border-t border-[var(--color-menu-border)] px-4 py-3 text-left text-sm font-semibold text-[var(--color-menu-text)] hover:bg-surface"
            >
              <User className="size-4" />
              Visit profile
            </Link>
          </div>
        </>
      )}

      <UnfollowSheet
        open={confirmUnfollow}
        author={author}
        onClose={() => setConfirmUnfollow(false)}
        onConfirm={() => {
          unfollow(author.handle)
          setConfirmUnfollow(false)
        }}
      />
    </div>
  )
}

export function SuggestionRow({ author, onNavigate }: { author: SocialAuthor; onNavigate?: () => void }) {
  const isYou = author.handle === YOU.handle

  return (
    <Link
      to={profileHref(author.handle)}
      onClick={onNavigate}
      className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 hover:bg-surface-raised"
    >
      <SocialAvatar author={author} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{author.name}</p>
        <p className="text-xs text-ink-faint">{author.handle}</p>
        {!isYou && <p className="mt-0.5 text-xs text-ink-faint">{author.followers.toLocaleString()} followers</p>}
      </div>
      <FollowButton handle={author.handle} />
    </Link>
  )
}

export function DeedShareBadge({
  deedTitle,
  deedPoints,
  deedStreak,
  className,
}: {
  deedTitle?: string
  deedPoints?: number
  deedStreak?: number
  className?: string
}) {
  return (
    <div className={clsx("flex flex-wrap items-center gap-2", className)}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber-soft px-3 py-1.5 text-xs font-semibold text-amber">
        <Sparkle weight="fill" className="size-3.5" />
        {deedTitle} · +{deedPoints} pts
      </span>
      {Boolean(deedStreak && deedStreak > 1) && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose/25 bg-rose-soft px-3 py-1.5 text-xs font-semibold text-rose">
          <Flame weight="fill" className="size-3.5" />
          {deedStreak} day streak
        </span>
      )}
    </div>
  )
}

export function QuranVerseBadge({
  surahName,
  fromAyah,
  toAyah,
  className,
}: {
  surahName: string
  fromAyah: number
  toAyah: number
  className?: string
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald-soft px-3 py-1.5 text-xs font-semibold text-emerald",
        className,
      )}
    >
      <BookOpen weight="fill" className="size-3.5" />
      {surahName} · Ayah {fromAyah === toAyah ? fromAyah : `${fromAyah}–${toAyah}`}
    </span>
  )
}

export function AudioPost({ audioId, audioSeconds, className }: { audioId?: string; audioSeconds?: number; className?: string }) {
  const url = useMediaUrl(audioId)
  if (!audioId) return null
  if (!url) return <div className={clsx("h-[64px] animate-pulse rounded-2xl bg-surface-raised", className)} />
  return <AudioAttachmentPlayer src={url} durationSeconds={audioSeconds} className={className} />
}

export function VideoPlayer({ videoId, className }: { videoId?: string; className?: string }) {
  const url = useMediaUrl(videoId)
  if (!videoId) return null

  if (!url) {
    return (
      <div
        className={clsx(
          "flex aspect-video w-full items-center justify-center rounded-xl bg-surface-raised text-ink-faint",
          className,
        )}
      >
        <Play weight="fill" className="size-6 animate-pulse" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      src={url}
      controls
      playsInline
      className={clsx("max-h-[420px] w-full rounded-xl bg-black", className)}
    />
  )
}

export function ImageViewer({ imageId, className }: { imageId?: string; className?: string }) {
  const url = useMediaUrl(imageId)
  if (!imageId) return null

  if (!url) {
    return (
      <div
        className={clsx(
          "flex aspect-video w-full items-center justify-center rounded-xl bg-surface-raised text-ink-faint",
          className,
        )}
      >
        <Play weight="fill" className="size-6 animate-pulse" />
      </div>
    )
  }

  return <img src={url} alt="" className={clsx("max-h-[420px] w-full rounded-xl object-cover", className)} />
}

export function LocationPill({ location, className }: { location?: string; className?: string }) {
  if (!location) return null
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-muted",
        className,
      )}
    >
      <MapPin weight="fill" className="size-3.5 text-brand" />
      {location}
    </span>
  )
}

export function PostMenu({ post, className }: { post: SocialPost; className?: string }) {
  const { reportPost, deletePost, isPostArchived, toggleArchivePost } = useSocial()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reported, setReported] = useState(false)
  const isOwn = post.author.handle === YOU.handle
  const archived = isPostArchived(post.id)

  function handleReport(reason: ReportReason, details?: string) {
    reportPost(post.id, reason, details)
    setReported(true)
    setOpen(false)
    showToast("Report submitted — thanks for helping keep Social safe.")
  }

  function handleArchiveToggle() {
    toggleArchivePost(post.id)
    setOpen(false)
  }

  function handleDelete() {
    deletePost(post.id)
    setConfirmDelete(false)
    navigate("/social")
  }

  if (reported) return null

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        aria-label="More options"
        className={clsx("tap-scale flex size-7 items-center justify-center rounded-full text-ink-faint hover:text-ink", className)}
      >
        <DotsThree weight="bold" className="size-[18px]" />
      </button>
      {isOwn ? (
        <>
          <PostActionsSheet
            open={open}
            archived={archived}
            onClose={() => setOpen(false)}
            onArchiveToggle={handleArchiveToggle}
            onDeleteRequest={() => {
              setOpen(false)
              setConfirmDelete(true)
            }}
          />
          <DeleteSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} />
        </>
      ) : (
        <ReportSheet open={open} onClose={() => setOpen(false)} onSubmit={handleReport} />
      )}
    </>
  )
}

export function SocialPostCard({
  post,
  liked,
  onToggleLike,
}: {
  post: SocialPost
  liked: boolean
  onToggleLike: () => void
}) {
  const navigate = useNavigate()
  const [justLiked, setJustLiked] = useState(false)

  return (
    <div className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <div className="flex gap-3">
        <AvatarFollowMenu author={post.author} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link to={profileHref(post.author.handle)} className="text-sm font-semibold text-ink hover:underline">
              {post.author.name}
            </Link>
            <AuthorTierBadge author={post.author} />
            <span className="text-xs text-ink-faint">{post.author.handle}</span>
            <span className="text-xs text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="text-xs text-ink-faint">{relativeTime(post.createdAt)}</span>
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

          <div onClick={() => navigate(`/social/${post.id}`)} className="cursor-pointer">
            <p className="mt-1 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">
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
          </div>

          <div className="mt-3 -ml-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (!liked) setJustLiked(true)
                onToggleLike()
              }}
              className={clsx(
                "tap-scale flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
                liked ? "text-rose hover:bg-rose-soft" : "text-ink-faint hover:bg-surface-raised hover:text-ink",
              )}
            >
              <Heart
                weight={liked ? "fill" : "regular"}
                className={clsx("size-4", justLiked && "animate-like-pop")}
                onAnimationEnd={() => setJustLiked(false)}
              />
              {post.likes}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/social/${post.id}`)}
              className="tap-scale flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink"
            >
              <ChatCircle className="size-4" />
              {countReplies(post.replies)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
