import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CaretRight,
  ChatsCircle,
  CheckCircle,
  Gift,
  Lightning,
  ListChecks,
  Lock,
  Trophy,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { DEEDS } from "../lib/data"
import { useGoodDeeds } from "../lib/store"
import { BADGE_TIERS, getNextTier, getTierForPoints, tierIndexForPoints } from "../lib/badges"
import { SOCIAL_WAYS_TO_EARN, SOCIAL_WEEKLY_CAP } from "../lib/socialEarning"
import { TierBadge } from "../components/TierBadge"

export function Points() {
  const navigate = useNavigate()
  const { totalPoints } = useGoodDeeds()

  const tier = getTierForPoints(totalPoints)
  const nextTier = getNextTier(totalPoints)
  const tierIndex = tierIndexForPoints(totalPoints)

  const progress = nextTier
    ? Math.min(100, Math.max(0, ((totalPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100

  const deedPoints = DEEDS.map((d) => d.points)
  const deedsMin = Math.min(...deedPoints)
  const deedsMax = Math.max(...deedPoints)

  const socialPoints = SOCIAL_WAYS_TO_EARN.map((w) => w.points)
  const socialMin = Math.min(...socialPoints)
  const socialMax = Math.max(...socialPoints)

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
        <p className="text-[17px] font-bold text-ink">Points & Badges</p>
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

      <div
        className="relative mt-4 overflow-hidden rounded-3xl p-6 sm:p-7 lg:mt-0"
        style={{ background: "linear-gradient(135deg, #5C3D1F 0%, #966422 55%, #5C3D1F 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-2 top-6 size-20 rounded-full bg-white/10" />
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
          <Lightning weight="fill" className="size-3.5" />
          Current points
        </p>
        <p className="mt-2 text-5xl font-extrabold tabular-nums text-white">{totalPoints.toLocaleString()}</p>
        <p className="mt-1.5 text-sm text-white/80">pts earned · {tier.label} tier</p>
      </div>

      <Link
        to="/points/rewards"
        className="tap-scale mt-4 flex items-center gap-3 rounded-2xl border border-amber/25 bg-amber-soft px-4 py-3.5 hover:bg-amber-soft/80"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber/15 text-amber">
          <Gift weight="fill" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Redeem Rewards</p>
          <p className="text-xs text-ink-faint">Unlock exclusive perks & content</p>
        </div>
        <CaretRight className="size-4 shrink-0 text-ink-faint" />
      </Link>

      <section className="mt-4 rounded-3xl border border-border bg-surface p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TierBadge tier={tier} state="current" size="lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Your badge</p>
              <p className="mt-1 text-2xl font-extrabold text-amber">{tier.label}</p>
            </div>
          </div>
          {nextTier && (
            <div className="text-right">
              <p className="text-xs font-medium text-ink-faint">Next</p>
              <p className="text-sm font-bold text-ink">{nextTier.label}</p>
            </div>
          )}
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #966422 0%, #FFBE4C 100%)",
            }}
          />
        </div>

        <p className="mt-2.5 text-sm text-ink-faint">
          {nextTier ? (
            <>
              <span className="font-semibold tabular-nums text-ink">
                {(nextTier.minPoints - totalPoints).toLocaleString()} pts
              </span>{" "}
              to upgrade to <span className="font-semibold text-amber">{nextTier.label}</span>
            </>
          ) : (
            "You've reached the highest badge tier — may Allah accept your efforts."
          )}
        </p>
      </section>

      <div className="mt-7 flex items-center gap-2">
        <Trophy weight="fill" className="size-5 text-amber" />
        <h2 className="text-lg font-bold text-ink">Badge Tiers</h2>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {BADGE_TIERS.map((t, idx) => {
          const isCurrent = idx === tierIndex
          const isReached = idx <= tierIndex
          const isLocked = !isReached
          const rangeLabel = t.maxPoints === null ? `${t.minPoints.toLocaleString()}+ pts` : `${t.minPoints.toLocaleString()} – ${t.maxPoints.toLocaleString()} pts`

          return (
            <div
              key={t.id}
              className={clsx(
                "rounded-2xl border p-4 sm:p-5",
                isCurrent ? "border-amber/40 bg-amber-soft" : "border-border bg-surface",
              )}
            >
              <div className="flex items-center gap-3">
                <TierBadge tier={t} state={isCurrent ? "current" : isReached ? "reached" : "locked"} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={clsx("text-base font-bold", isCurrent ? "text-amber" : isLocked ? "text-ink-faint" : "text-ink")}>
                      {t.label}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0D0D12]">
                        Current
                      </span>
                    )}
                    {isLocked && <Lock weight="bold" className="size-3.5 text-ink-faint" />}
                  </div>
                  <p className="text-xs text-ink-faint">{rangeLabel}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 pl-[52px]">
                {t.perks.map((perk) => (
                  <span
                    key={perk}
                    className={clsx(
                      "flex items-center gap-1.5 text-sm",
                      isLocked ? "text-ink-faint" : "text-ink-muted",
                    )}
                  >
                    <CheckCircle weight={isLocked ? "regular" : "fill"} className={clsx("size-4 shrink-0", isLocked ? "text-ink-faint" : "text-amber")} />
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-7 flex items-center gap-2">
        <Lightning weight="fill" className="size-5 text-amber" />
        <h2 className="text-lg font-bold text-ink">Ways to Earn</h2>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        <Link
          to="/points/deeds"
          className="tap-scale flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 hover:border-border-strong"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
            <ListChecks weight="fill" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Good Deeds Activity</p>
            <p className="text-xs text-ink-faint">Salah, Qur'an & Fasting deeds</p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-amber">
            +{deedsMin}–{deedsMax} pts
          </span>
          <CaretRight className="size-4 shrink-0 text-ink-faint" />
        </Link>
        <Link
          to="/points/social"
          className="tap-scale flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 hover:border-border-strong"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <ChatsCircle weight="fill" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Social Activity</p>
            <p className="text-xs text-ink-faint">Capped at {SOCIAL_WEEKLY_CAP} pts/week</p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-amber">
            +{socialMin}–{socialMax} pts
          </span>
          <CaretRight className="size-4 shrink-0 text-ink-faint" />
        </Link>
      </div>
    </div>
  )
}
