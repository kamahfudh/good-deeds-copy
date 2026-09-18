import { Archive, ArrowCounterClockwise, Trash, X } from "@phosphor-icons/react"

export function PostActionsSheet({
  open,
  archived,
  onClose,
  onArchiveToggle,
  onDeleteRequest,
}: {
  open: boolean
  archived: boolean
  onClose: () => void
  onArchiveToggle: () => void
  onDeleteRequest: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-ink">Post options</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-scale flex size-8 items-center justify-center rounded-full text-ink-faint hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={onArchiveToggle}
            className="tap-scale flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-raised"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              {archived ? (
                <ArrowCounterClockwise weight="bold" className="size-4" />
              ) : (
                <Archive weight="bold" className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {archived ? "Unarchive post" : "Archive post"}
              </span>
              <span className="block text-xs text-ink-faint">
                {archived
                  ? "Show this post in the feed and search again"
                  : "Hide from the feed & search — only you can still see it, on your profile"}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onDeleteRequest}
            className="tap-scale flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-rose-soft/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-soft text-rose">
              <Trash weight="bold" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-rose">Delete post</span>
              <span className="block text-xs text-ink-faint">This can't be undone</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
