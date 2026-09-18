import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, UsersThree } from "@phosphor-icons/react"
import clsx from "clsx"
import { SocialAvatar } from "../components/SocialPostCard"
import { accentClasses } from "../lib/colors"
import { NOTIFICATIONS } from "../lib/notificationsFeed"
import type { SocialAuthor } from "../lib/social"

const REQUESTS_SOURCE = NOTIFICATIONS.find(
  (n) => n.category === "social" && n.kind === "follow-requests-group",
)
const INITIAL_REQUESTS: SocialAuthor[] =
  (REQUESTS_SOURCE && "actors" in REQUESTS_SOURCE ? REQUESTS_SOURCE.actors : undefined) ?? []

export function NotificationsFollowRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState(INITIAL_REQUESTS)

  const confirm = (handle: string) => {
    setRequests((prev) => prev.filter((a) => a.handle !== handle))
  }
  const remove = (handle: string) => {
    setRequests((prev) => prev.filter((a) => a.handle !== handle))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">Follow Requests</p>
        <span className="inline-flex w-10" />
      </div>

      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {requests.map((author) => {
            const accent = accentClasses(author.color)
            return (
              <div
                key={author.handle}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-border-strong"
              >
                <span className={clsx("shrink-0 rounded-full ring-2", accent.ring)}>
                  <SocialAvatar author={author} size="md" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-ink">{author.name}</p>
                  <p className="truncate text-sm text-ink-faint">{author.handle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => confirm(author.handle)}
                    className="tap-scale rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(90,101,237,0.6)] transition-colors hover:bg-brand-strong"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(author.handle)}
                    className="tap-scale rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-raised text-ink-faint">
        <UsersThree weight="bold" className="size-5" />
      </span>
      <p className="text-sm font-medium text-ink-muted">No pending follow requests.</p>
    </div>
  )
}
