import { Moon, Sun } from "@phosphor-icons/react"
import { useLocation } from "react-router-dom"
import clsx from "clsx"
import { useTheme } from "../lib/theme"

// A post's thread page has its own floating comment bar docked at the
// bottom — raise the toggle to sit above it there instead of overlapping.
function useIsThreadPage() {
  const { pathname } = useLocation()
  return (
    pathname.startsWith("/social/") &&
    pathname !== "/social/new" &&
    !pathname.startsWith("/social/settings") &&
    !pathname.startsWith("/social/profile/")
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  const isThreadPage = useIsThreadPage()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={clsx(
        "tap-scale fixed right-5 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-pop hover:bg-surface-raised",
        isThreadPage ? "bottom-24" : "bottom-5",
      )}
    >
      {isDark ? <Sun weight="fill" className="size-[18px]" /> : <Moon weight="fill" className="size-[18px]" />}
    </button>
  )
}
