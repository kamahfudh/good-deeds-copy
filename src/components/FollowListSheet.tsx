import { useState } from "react"
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react"
import clsx from "clsx"
import type { SocialAuthor } from "../lib/social"
import { FollowButton, SocialAvatar, profileHref } from "./SocialPostCard"
import { Link } from "react-router-dom"

type ListTab = "followers" | "following"

export function FollowListSheet({
  open,
  handle,
  initialTab,
  followers,
  following,
  onClose,
}: {
  open: boolean
  handle: string
  initialTab: ListTab
  followers: SocialAuthor[]
  following: SocialAuthor[]
  onClose: () => void
}) {
  const [tab, setTab] = useState<ListTab>(initialTab)
  const [query, setQuery] = useState("")

  if (!open) return null

  const list = tab === "followers" ? followers : following
  const q = query.trim().toLowerCase()
  const visible =
    q.length === 0
      ? list
      : list.filter((a) => a.name.toLowerCase().includes(q) || a.handle.toLowerCase().includes(q))

  function handleTabChange(next: ListTab) {
    setTab(next)
    setQuery("")
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="tap-scale flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-5" />
        </button>
        <p className="truncate text-[15px] font-bold text-ink">{handle}</p>
        <span className="inline-flex w-9" />
      </div>

      <div className="flex shrink-0 border-b border-border">
        <button
          type="button"
          onClick={() => handleTabChange("followers")}
          className={clsx(
            "flex-1 border-b-2 py-3 text-sm font-semibold transition-colors",
            tab === "followers" ? "border-ink text-ink" : "border-transparent text-ink-faint hover:text-ink",
          )}
        >
          {followers.length.toLocaleString()} followers
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("following")}
          className={clsx(
            "flex-1 border-b-2 py-3 text-sm font-semibold transition-colors",
            tab === "following" ? "border-ink text-ink" : "border-transparent text-ink-faint hover:text-ink",
          )}
        >
          {following.length.toLocaleString()} following
        </button>
      </div>

      <div className="shrink-0 px-4 pt-3">
        <div className="flex items-center gap-2 rounded-full bg-surface-raised px-4 py-2.5">
          <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-faint">
            {q.length > 0 ? `No results for "${query}"` : "Nobody here yet."}
          </p>
        ) : (
          visible.map((author) => (
            <Link
              key={author.handle}
              to={profileHref(author.handle)}
              onClick={onClose}
              className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 hover:bg-surface-raised"
            >
              <SocialAvatar author={author} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{author.handle.replace(/^@/, "")}</p>
                <p className="truncate text-xs text-ink-faint">{author.name}</p>
              </div>
              <FollowButton handle={author.handle} />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
