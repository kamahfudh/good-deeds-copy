import { Trash, X } from "@phosphor-icons/react"

export function DeleteSheet({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-rose-soft text-rose">
              <Trash weight="fill" className="size-4" />
            </span>
            <p className="text-[15px] font-bold text-ink">Delete post</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-scale flex size-8 items-center justify-center rounded-full text-ink-faint hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-faint">
          This can't be undone. Your post and its replies will be removed.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="tap-scale flex-1 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="tap-scale flex-1 rounded-xl border border-rose/25 bg-rose-soft px-4 py-3 text-sm font-semibold text-rose hover:bg-rose-soft/80"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
