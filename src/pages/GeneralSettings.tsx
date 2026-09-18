import { useLocation, useNavigate } from "react-router-dom"
import { useState, type ComponentType } from "react"
import {
  ArrowLeft,
  Bell,
  CalendarStar,
  CaretRight,
  ChatCircleText,
  Clock,
  Info,
  Moon,
  SignOut,
  Sun,
  Translate,
  type IconProps,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { useTheme } from "../lib/theme"
import { useToast } from "../lib/toastStore"
import { getLanguage, setLanguageCode } from "../lib/language"
import { LanguagePickerSheet } from "../components/LanguagePickerSheet"
import { getNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from "../lib/notifications"
import { getHijriOffset } from "../lib/hijri"

function ToggleTrack({ active }: { active: boolean }) {
  return (
    <span className={clsx("relative h-6 w-10 shrink-0 rounded-full transition-colors", active ? "bg-brand" : "bg-surface-overlay/40")}>
      <span
        className={clsx(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          active ? "left-[18px]" : "left-0.5",
        )}
      />
    </span>
  )
}

function SettingsRow({
  icon: Icon,
  tone,
  label,
  description,
  trailing,
  onClick,
}: {
  icon: ComponentType<IconProps>
  tone: "brand" | "emerald" | "violet" | "cyan" | "rose"
  label: string
  description?: string
  trailing?: React.ReactNode
  onClick: () => void
}) {
  const toneClasses = {
    brand: "bg-brand-soft text-brand",
    emerald: "bg-emerald-soft text-emerald",
    violet: "bg-violet-soft text-violet",
    cyan: "bg-cyan-soft text-cyan",
    rose: "bg-rose-soft text-rose",
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-scale flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-raised/60"
    >
      <span className={clsx("flex size-9 shrink-0 items-center justify-center rounded-full", toneClasses)}>
        <Icon weight="fill" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <p className={clsx("text-sm font-semibold", tone === "rose" ? "text-rose" : "text-ink")}>{label}</p>
        {description && <p className="text-xs text-ink-faint">{description}</p>}
      </span>
      {trailing}
    </button>
  )
}

const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: "prayerReminders", label: "Prayer reminders", description: "A nudge as each prayer window opens" },
  { key: "socialActivity", label: "Social activity", description: "Likes, replies, and new followers" },
  { key: "weeklySummary", label: "Weekly summary", description: "Your points and streaks, once a week" },
]

export function GeneralSettings() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()

  const isDark = theme === "dark"
  const [language, setLanguage] = useState(() => getLanguage())
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs())
  const [notifSheetOpen, setNotifSheetOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(
    () => Boolean((location.state as { openFeedback?: boolean } | null)?.openFeedback),
  )
  const [feedbackText, setFeedbackText] = useState("")
  const [confirmLogout, setConfirmLogout] = useState(false)

  const hijriOffset = getHijriOffset()
  const notifOnCount = Object.values(notifPrefs).filter(Boolean).length

  function toggleNotif(key: keyof NotificationPrefs) {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(next)
    saveNotificationPrefs(next)
  }

  function submitFeedback() {
    if (feedbackText.trim().length === 0) return
    setFeedbackOpen(false)
    setFeedbackText("")
    showToast("Thanks for your feedback!")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">General Settings</p>
        <span className="inline-flex w-10" />
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="tap-scale mb-5 hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink lg:inline-flex"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <section className="mt-6 lg:mt-0">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">General</h2>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <SettingsRow
            icon={Translate}
            tone="brand"
            label="Language"
            description={language.nativeName}
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => setLanguagePickerOpen(true)}
          />
          <SettingsRow
            icon={Bell}
            tone="emerald"
            label="Notifications"
            description={`${notifOnCount} of ${NOTIFICATION_OPTIONS.length} enabled`}
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => setNotifSheetOpen(true)}
          />
          <SettingsRow
            icon={isDark ? Moon : Sun}
            tone="violet"
            label="Theme"
            description={isDark ? "Dark mode" : "Light mode"}
            trailing={<ToggleTrack active={isDark} />}
            onClick={toggleTheme}
          />
          <SettingsRow
            icon={CalendarStar}
            tone="cyan"
            label="Hijri date adjustment"
            description={hijriOffset === 0 ? "No adjustment" : `${hijriOffset > 0 ? "+" : ""}${hijriOffset} day${Math.abs(hijriOffset) === 1 ? "" : "s"}`}
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/general/hijri")}
          />
          <SettingsRow
            icon={Clock}
            tone="brand"
            label="Prayer time settings"
            description="Calculation method, madhab & per-prayer adjustments"
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/general/prayer-times")}
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Support</h2>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <SettingsRow
            icon={ChatCircleText}
            tone="emerald"
            label="Share feedback"
            description="Tell us what's working or what's not"
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => setFeedbackOpen(true)}
          />
          <SettingsRow
            icon={Info}
            tone="brand"
            label="About"
            description="Version, credits & how Good Deeds works"
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/general/about")}
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Session</h2>
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
          <SettingsRow
            icon={SignOut}
            tone="rose"
            label="Log out"
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => setConfirmLogout(true)}
          />
        </div>
        <p className="mt-3 px-1 text-xs text-ink-faint">
          Good Deeds runs fully on this device, so your progress stays local and there's no account to sign back into later.
        </p>
      </section>

      <LanguagePickerSheet
        open={languagePickerOpen}
        selectedCode={language.code}
        onSelect={(l) => {
          setLanguage(l)
          setLanguageCode(l.code)
          showToast(`Language set to ${l.nativeName}. The app's own text stays in English for now.`)
        }}
        onClose={() => setLanguagePickerOpen(false)}
      />

      {notifSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setNotifSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-bold text-ink">Notifications</p>
            <p className="mt-1 text-sm text-ink-faint">Choose what Good Deeds can notify you about.</p>

            <div className="mt-4 flex flex-col divide-y divide-border rounded-2xl border border-border">
              {NOTIFICATION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleNotif(opt.key)}
                  className="tap-scale flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-raised/60"
                >
                  <span className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{opt.label}</p>
                    <p className="text-xs text-ink-faint">{opt.description}</p>
                  </span>
                  <ToggleTrack active={notifPrefs[opt.key]} />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setNotifSheetOpen(false)}
              className="tap-scale mt-4 w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-canvas hover:bg-ink/90"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {feedbackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setFeedbackOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-bold text-ink">Share feedback</p>
            <p className="mt-1 text-sm text-ink-faint">What's working well, or what should change?</p>
            <textarea
              autoFocus
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Type your feedback here..."
              rows={4}
              className="mt-3 w-full resize-none rounded-xl border border-border-strong bg-canvas px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={submitFeedback}
                disabled={feedbackText.trim().length === 0}
                className={clsx(
                  "tap-scale w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  feedbackText.trim().length > 0 ? "bg-ink text-canvas hover:bg-ink/90" : "cursor-not-allowed bg-surface-raised text-ink-faint",
                )}
              >
                Send feedback
              </button>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="tap-scale w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLogout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setConfirmLogout(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-rose-soft text-rose">
                <SignOut weight="bold" className="size-6" />
              </span>
              <p className="mt-3 text-[15px] font-bold text-ink">Log out?</p>
              <p className="mt-1.5 max-w-xs text-sm text-ink-faint">
                Good Deeds doesn't use accounts. Everything is saved on this device, so there's nothing to sign back into later.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmLogout(false)
                  showToast("There's no account to log out of. Your progress stays saved on this device.")
                }}
                className="tap-scale w-full rounded-xl border border-rose/25 bg-rose-soft px-4 py-3 text-sm font-semibold text-rose hover:bg-rose-soft/80"
              >
                Log out anyway
              </button>
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="tap-scale w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
