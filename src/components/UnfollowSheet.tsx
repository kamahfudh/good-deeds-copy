import { accentClasses } from "../lib/colors"
import type { SocialAuthor } from "../lib/social"

// Confirms before unfollowing — matches the "are you sure?" pattern real
// social apps use, with extra copy for private accounts since re-following
// one means sending a brand-new request, not an instant re-follow.
export function UnfollowSheet({
  open,
  author,
  onClose,
  onConfirm,
}: {
  open: boolean
  author: SocialAuthor | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open || !author) return null
  const classes = accentClasses(author.color)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center py-2 text-center">
          <span
            className={`flex size-14 items-center justify-center rounded-full text-lg font-bold ${classes.bg} ${classes.text}`}
          >
            {author.initials}
          </span>
          <p className="mt-3 text-[15px] font-bold text-ink">Unfollow {author.name}?</p>
          <p className="mt-1.5 max-w-xs text-sm text-ink-faint">
            {author.isPrivate
              ? `You'll need to send a new follow request to see ${author.handle}'s posts again.`
              : `You can follow ${author.handle} again anytime.`}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="tap-scale w-full rounded-xl border border-rose/25 bg-rose-soft px-4 py-3 text-sm font-semibold text-rose hover:bg-rose-soft/80"
          >
            Unfollow
          </button>
          <button
            type="button"
            onClick={onClose}
            className="tap-scale w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
