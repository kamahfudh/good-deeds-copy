import { Clock, WarningCircle, X } from "@phosphor-icons/react"
import clsx from "clsx"
import type { SocialPost } from "../lib/social"

export function ModerationInfoSheet({
  status,
  onClose,
}: {
  status: Extract<SocialPost["moderationStatus"], "pending" | "rejected"> | null
  onClose: () => void
}) {
  if (!status) return null
  const isPending = status === "pending"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "flex size-8 items-center justify-center rounded-full",
                isPending ? "bg-amber-soft text-amber" : "bg-rose-soft text-rose",
              )}
            >
              {isPending ? (
                <Clock weight="fill" className="size-4" />
              ) : (
                <WarningCircle weight="fill" className="size-4" />
              )}
            </span>
            <p className="text-[15px] font-bold text-ink">{isPending ? "Pending review" : "Rejected"}</p>
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

        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {isPending
            ? "This post is being reviewed against our Islamic community guidelines before it goes live. Approval is usually instant, so there's nothing you need to do."
            : "This post breaks our Islamic community guidelines, including riba/interest-based scams, gambling, hate speech, or anything not halal. It won't appear in the feed or search."}
        </p>

        {!isPending && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-rose/25 bg-rose-soft px-4 py-3">
            <Clock weight="fill" className="mt-0.5 size-4 shrink-0 text-rose" />
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-rose">This post will be deleted in 24 hours.</span> Delete it
              sooner from the "…" menu.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="tap-scale mt-4 w-full rounded-xl border border-border bg-surface-raised py-3 text-sm font-semibold text-ink hover:border-border-strong"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
