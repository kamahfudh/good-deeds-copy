import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { ChatsCircle, Compass, ListChecks, Sparkle, MoonStars } from "@phosphor-icons/react"
import clsx from "clsx"
import { useGoodDeeds } from "../lib/store"
import { ThemeToggle } from "./ThemeToggle"
import { PointsBadge } from "./PointsBadge"
import { NotificationBell } from "./NotificationBell"

const NAV_ITEMS = [
  { to: "/", label: "Discover", icon: Compass, end: true },
  { to: "/my-deeds", label: "My Deeds", icon: ListChecks, end: false },
  { to: "/social", label: "Social", icon: ChatsCircle, end: false },
]

export function AppShell() {
  const { totalPoints } = useGoodDeeds()
  const location = useLocation()
  const hasOwnMobileNav =
    location.pathname === "/" ||
    location.pathname === "/notifications" ||
    location.pathname === "/notifications/follow-requests" ||
    location.pathname === "/my-deeds" ||
    location.pathname === "/assessment" ||
    location.pathname === "/social" ||
    location.pathname.startsWith("/deeds/") ||
    location.pathname.startsWith("/social/") ||
    location.pathname.startsWith("/my-deeds/history/") ||
    location.pathname.startsWith("/points")

  return (
    <div className="min-h-dvh bg-canvas lg:flex">
      <aside className="hidden w-[264px] shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-2.5 px-6 pb-2 pt-7">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <MoonStars weight="fill" className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold text-ink">Good Deeds</p>
              <p className="text-xs text-ink-faint">Daily worship tracker</p>
            </div>
          </div>
          <NotificationBell />
        </div>

        <nav className="mt-6 flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-soft text-brand"
                    : "text-ink-muted hover:bg-surface-raised hover:text-ink",
                )
              }
            >
              <item.icon weight="duotone" className="size-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <Link
            to="/points"
            className="tap-scale block rounded-2xl border border-border bg-surface-raised p-4 hover:border-border-strong"
          >
            <p className="text-xs font-medium text-ink-faint">Total points earned</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums text-ink">
              <Sparkle weight="fill" className="size-5 text-amber" />
              {totalPoints}
            </p>
          </Link>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        {!hasOwnMobileNav && (
          <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3.5 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <MoonStars weight="fill" className="size-4" />
              </span>
              <p className="text-[15px] font-bold text-ink">Good Deeds</p>
            </Link>
            <span className="flex items-center gap-2">
              <NotificationBell />
              <PointsBadge />
            </span>
          </header>
        )}

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <ThemeToggle />
    </div>
  )
}
