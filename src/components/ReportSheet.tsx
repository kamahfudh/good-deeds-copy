import { useState } from "react"
import { ArrowLeft, Flag, X } from "@phosphor-icons/react"
import type { ReportReason } from "../lib/socialStore"

const REASONS: ReportReason[] = ["Spam", "Harassment or bullying", "False information", "Something else"]

export function ReportSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: ReportReason, details?: string) => void
}) {
  const [showDetailsInput, setShowDetailsInput] = useState(false)
  const [details, setDetails] = useState("")

  if (!open) return null

  function reset() {
    setShowDetailsInput(false)
    setDetails("")
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleReasonSelect(reason: ReportReason) {
    if (reason === "Something else") {
      setShowDetailsInput(true)
      return
    }
    onSubmit(reason)
    reset()
  }

  function handleSubmitDetails() {
    const trimmed = details.trim()
    if (!trimmed) return
    onSubmit("Something else", trimmed)
    reset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showDetailsInput ? (
              <button
                type="button"
                onClick={() => setShowDetailsInput(false)}
                aria-label="Back"
                className="tap-scale flex size-8 items-center justify-center rounded-full text-ink-faint hover:text-ink"
              >
                <ArrowLeft className="size-4" />
              </button>
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-rose-soft text-rose">
                <Flag weight="fill" className="size-4" />
              </span>
            )}
            <p className="text-[15px] font-bold text-ink">Report post</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="tap-scale flex size-8 items-center justify-center rounded-full text-ink-faint hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-faint">
          {showDetailsInput ? "Tell us more about what's wrong with this post." : "Why are you reporting this post?"}
        </p>

        {showDetailsInput ? (
          <div className="mt-4 flex flex-col gap-3">
            <textarea
              autoFocus
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className="w-full resize-none rounded-xl border border-border-strong bg-canvas p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              type="button"
              disabled={details.trim().length === 0}
              onClick={handleSubmitDetails}
              className="tap-scale rounded-xl bg-rose px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose/90 disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-ink-faint"
            >
              Submit report
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => handleReasonSelect(reason)}
                className="tap-scale rounded-xl border border-border bg-surface-raised px-4 py-3 text-left text-sm font-medium text-ink hover:border-border-strong"
              >
                {reason}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
