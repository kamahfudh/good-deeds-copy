import { Link, useNavigate } from "react-router-dom"
import { useState, type ComponentType } from "react"
import {
  ArrowLeft,
  CaretRight,
  Gear,
  Lock,
  Moon,
  PencilSimple,
  ShieldCheck,
  SignOut,
  Sun,
  User,
  type IconProps,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { useGoodDeeds } from "../lib/store"
import { getTierForPoints } from "../lib/badges"
import { relativeTime, YOU } from "../lib/social"
import { SocialAvatar } from "../components/SocialPostCard"
import { TierBadge } from "../components/TierBadge"
import { FollowListSheet } from "../components/FollowListSheet"
import { useSocial } from "../lib/socialStore"
import { useTheme } from "../lib/theme"
import { useToast } from "../lib/toastStore"
import { getPasswordUpdatedAt } from "../lib/security"
import { getProfile } from "../lib/profile"
import { getAccountVisibility } from "../lib/privacy"

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

function formatPasswordAge(updatedAt: number): string {
  return Date.now() - updatedAt < 60000 ? "just now" : `${relativeTime(updatedAt)} ago`
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
  tone: "brand" | "emerald" | "violet" | "rose"
  label: string
  description?: string
  trailing?: React.ReactNode
  onClick: () => void
}) {
  const toneClasses = {
    brand: "bg-brand-soft text-brand",
    emerald: "bg-emerald-soft text-emerald",
    violet: "bg-violet-soft text-violet",
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

export function ProfileSettings() {
  const navigate = useNavigate()
  const { totalPoints } = useGoodDeeds()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const { posts, getFollowingList, getFollowersList } = useSocial()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [listSheet, setListSheet] = useState<"following" | "followers" | null>(null)

  const tier = getTierForPoints(totalPoints)
  const isDark = theme === "dark"
  const passwordUpdatedAt = getPasswordUpdatedAt()
  const profile = getProfile()
  const displayName = profile.fullName || YOU.name
  const accountVisibility = getAccountVisibility()
  const postCount = posts.filter((p) => p.author.handle === YOU.handle && !p.archived).length
  const followingList = getFollowingList(YOU.handle)
  const followersList = getFollowersList(YOU.handle)

  function stub(message: string) {
    showToast(message)
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
        <p className="text-[17px] font-bold text-ink">Profile Settings</p>
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

      <div className="mt-6 flex flex-col items-center text-center lg:mt-0">
        <div className="relative">
          <SocialAvatar author={YOU} size="xl" />
          <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-canvas">
            <TierBadge tier={tier} state="current" size="sm" />
          </span>
        </div>
        <button
          type="button"
          onClick={() => stub("Photo uploads aren't available yet. Good Deeds runs fully on this device.")}
          className="tap-scale mt-3 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-3 py-1.5 text-xs font-semibold text-ink hover:border-border"
        >
          <PencilSimple weight="bold" className="size-3.5" />
          Edit picture
        </button>

        <p className="mt-4 text-xl font-bold text-ink">{displayName}</p>
        <p className="text-sm text-ink-faint">
          {YOU.handle}
          {profile.email && <span className="text-ink-faint"> · {profile.email}</span>}
        </p>

        <div className="mt-4 flex items-center gap-5">
          <Link to="/social/profile/you" className="tap-scale flex flex-col items-center">
            <span className="text-base font-bold tabular-nums text-ink">{postCount}</span>
            <span className="text-xs text-ink-faint">Posts</span>
          </Link>
          <span className="h-8 w-px bg-border" />
          <button type="button" onClick={() => setListSheet("followers")} className="tap-scale flex flex-col items-center">
            <span className="text-base font-bold tabular-nums text-ink">{followersList.length}</span>
            <span className="text-xs text-ink-faint">Followers</span>
          </button>
          <span className="h-8 w-px bg-border" />
          <button type="button" onClick={() => setListSheet("following")} className="tap-scale flex flex-col items-center">
            <span className="text-base font-bold tabular-nums text-ink">{followingList.length}</span>
            <span className="text-xs text-ink-faint">Following</span>
          </button>
        </div>

        <Link
          to="/points"
          className="tap-scale mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber hover:bg-amber-soft/80"
        >
          <TierBadge tier={tier} state="current" size="xs" />
          {tier.label} · {totalPoints.toLocaleString()} pts
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Account</h2>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <SettingsRow
            icon={User}
            tone="brand"
            label="Personal info"
            description={profile.fullName ? `${displayName} · ${profile.email || "no email set"}` : "Name, email, username & more"}
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/personal-info")}
          />
          <SettingsRow
            icon={ShieldCheck}
            tone="brand"
            label="Login & security"
            description={passwordUpdatedAt ? `Password changed ${formatPasswordAge(passwordUpdatedAt)}` : "Set a password to secure this device"}
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/password")}
          />
          <SettingsRow
            icon={Lock}
            tone="brand"
            label="Privacy settings"
            description={accountVisibility === "private" ? "Only your followers can see your posts" : "Anyone can see your posts"}
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/privacy")}
          />
          <SettingsRow
            icon={Gear}
            tone="brand"
            label="General settings"
            description="Language, notifications, prayer times & more"
            trailing={<CaretRight className="size-4 shrink-0 text-ink-faint" />}
            onClick={() => navigate("/social/settings/general")}
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Appearance</h2>
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
          <button
            type="button"
            onClick={toggleTheme}
            className="tap-scale flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-raised/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-soft text-violet">
              {isDark ? <Moon weight="fill" className="size-4" /> : <Sun weight="fill" className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Dark mode</p>
              <p className="text-xs text-ink-faint">{isDark ? "On, easy on the eyes at night" : "Off, bright and high contrast"}</p>
            </span>
            <ToggleTrack active={isDark} />
          </button>
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
                  stub("There's no account to log out of. Your progress stays saved on this device.")
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

      {listSheet && (
        <FollowListSheet
          open
          handle={YOU.handle}
          initialTab={listSheet}
          followers={followersList}
          following={followingList}
          onClose={() => setListSheet(null)}
        />
      )}
    </div>
  )
}
