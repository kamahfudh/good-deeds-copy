import { Link } from "react-router-dom"
import { Bell } from "@phosphor-icons/react"
import clsx from "clsx"
import { NOTIFICATIONS, unreadCount } from "../lib/notificationsFeed"

export function NotificationBell({ className }: { className?: string }) {
  const hasUnread = unreadCount(NOTIFICATIONS) > 0

  return (
    <Link
      to="/notifications"
      aria-label="Notifications"
      className={clsx(
        "tap-scale relative flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised",
        className,
      )}
    >
      <Bell weight="bold" className="size-[18px]" />
      {hasUnread && (
        <span className="absolute right-2 top-2 size-2 rounded-full bg-rose ring-2 ring-canvas" aria-hidden />
      )}
    </Link>
  )
}
