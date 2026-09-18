import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CaretRight,
  CheckCircle,
  ListChecks,
  MagnifyingGlass,
  Sparkle,
  X,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { CATEGORIES, DEEDS, getCategory, getDeedById, type CategoryId, type Category, type Deed } from "../lib/data"
import { DeedTile } from "../components/DeedTile"
import { accentClasses } from "../lib/colors"
import { CATEGORY_ICONS } from "../components/icons"
import { PointsBadge } from "../components/PointsBadge"
import { NotificationBell } from "../components/NotificationBell"
import { todayCode, useGoodDeeds, type Subscription } from "../lib/store"

export function DeedsCatalog() {
  const navigate = useNavigate()
  const { subscriptions, completedToday, assessment } = useGoodDeeds()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all")

  const today = todayCode()
  const dueToday = useMemo(
    () =>
      subscriptions.filter((s) => {
        // Occasional deeds (eclipse prayer, funeral prayer, etc.) have no
        // fixed day pattern — leave them out of the daily nudge so they
        // don't demand action on ordinary days with no occasion for them.
        const deed = getDeedById(s.deedId)
        if (deed?.flexibleSchedule) return false
        return s.days.includes(today) && !completedToday(s.id)
      }),
    [subscriptions, today, completedToday],
  )

  const matchesQuery = (deed: (typeof DEEDS)[number], q: string) =>
    q.length === 0 ||
    deed.title.toLowerCase().includes(q) ||
    deed.summary.toLowerCase().includes(q) ||
    deed.arabicName?.toLowerCase().includes(q)

  const categoryFiltered = useMemo(() => {
    if (activeCategory === "all") return []
    const q = query.trim().toLowerCase()
    return DEEDS.filter((d) => d.category === activeCategory).filter((deed) => matchesQuery(deed, q))
  }, [query, activeCategory])

  const activeCategoryMeta =
    activeCategory !== "all" ? CATEGORIES.find((c) => c.id === activeCategory) : undefined

  const subscribedDeedIds = useMemo(() => new Set(subscriptions.map((s) => s.deedId)), [subscriptions])

  const activeDeeds = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEEDS.filter((d) => subscribedDeedIds.has(d.id)).filter((deed) => matchesQuery(deed, q))
  }, [subscribedDeedIds, query])

  const recommendedDeeds = useMemo(() => {
    if (!assessment) return []
    const q = query.trim().toLowerCase()
    return DEEDS.filter((d) => assessment.deedIds.includes(d.id) && !subscribedDeedIds.has(d.id)).filter(
      (deed) => matchesQuery(deed, q),
    )
  }, [assessment, subscribedDeedIds, query])

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-5xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">Good Deeds</p>
        <span className="inline-flex items-center gap-2">
          <NotificationBell />
          <PointsBadge />
        </span>
      </div>

      {dueToday.length > 0 ? (
        <DueTodayCarousel subscriptions={dueToday} />
      ) : (
        <NoDeedsDueToday />
      )}

      <Link
        to="/my-deeds"
        className="tap-scale mt-3 flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3.5 text-[14.5px] font-bold text-brand hover:bg-brand-soft/80 lg:mt-6"
      >
        <Sparkle weight="fill" className="size-4" />
        View my deeds
      </Link>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-border-strong">
        <MagnifyingGlass className="size-[18px] shrink-0 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deeds, e.g. fasting, dhikr, sadaqah"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="tap-scale shrink-0 text-ink-faint hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={clsx(
            "tap-scale shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink",
          )}
        >
          Recommended deeds
        </button>
        {CATEGORIES.map((category) => {
          const active = activeCategory === category.id
          const classes = accentClasses(category.color)
          const Icon = CATEGORY_ICONS[category.id]
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(active ? "all" : category.id)}
              className={clsx(
                "tap-scale flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? clsx(classes.solidBg, "border-transparent")
                  : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink",
              )}
            >
              <Icon weight="fill" className="size-3.5" />
              {category.label}
            </button>
          )
        })}
      </div>

      {activeCategory === "all" &&
        (assessment ? (
          <Link
            to="/assessment"
            state={{ viewSaved: true }}
            className="tap-scale mt-5 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-border-strong hover:bg-surface-raised"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Sparkle weight="fill" className="size-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-semibold text-ink">Your worship profile</span>
              <span className="block text-xs text-ink-faint">
                Assessed{" "}
                {new Date(assessment.completedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
            <CaretRight className="size-4 shrink-0 text-ink-faint" />
          </Link>
        ) : (
          <Link
            to="/assessment"
            className="tap-scale mt-5 flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand-soft px-4 py-3 hover:border-brand/70"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <Sparkle weight="fill" className="size-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-semibold text-brand">Take the worship assessment</span>
              <span className="block text-xs text-ink-faint">
                2 minutes — get deeds picked for where you are today
              </span>
            </span>
            <CaretRight className="size-4 shrink-0 text-brand" />
          </Link>
        ))}

      {activeCategory === "all" && activeDeeds.length === 0 && recommendedDeeds.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-ink-muted">No deeds match your search.</p>
          <p className="mt-1 text-sm text-ink-faint">Try a different keyword or category.</p>
        </div>
      )}

      {activeCategory !== "all" && categoryFiltered.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-ink-muted">No deeds match your search.</p>
          <p className="mt-1 text-sm text-ink-faint">Try a different keyword or category.</p>
        </div>
      )}

      {activeCategory === "all" && (
        <>
          {activeDeeds.length > 0 && (
            <>
              <div className="mt-6">
                <h2 className="text-[15px] font-semibold text-ink">Active Deeds</h2>
                <p className="mt-0.5 text-xs text-ink-faint">Deeds currently in your plan.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activeDeeds.map((deed) => (
                  <DeedTile key={deed.id} deed={deed} />
                ))}
              </div>
            </>
          )}

          {recommendedDeeds.length > 0 && (
            <>
              <div className="mt-6">
                <h2 className="text-[15px] font-semibold text-ink">Recommended deeds</h2>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Picked from your worship profile, still to add.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {recommendedDeeds.map((deed) => (
                  <DeedTile key={deed.id} deed={deed} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeCategory !== "all" && categoryFiltered.length > 0 && activeCategoryMeta && (
        <>
          <CategoryHero category={activeCategoryMeta} deeds={categoryFiltered} />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryFiltered.map((deed) => (
              <DeedTile key={deed.id} deed={deed} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CategoryHero({ category, deeds }: { category: Category; deeds: Deed[] }) {
  const classes = accentClasses(category.color)
  const Icon = CATEGORY_ICONS[category.id]
  const totalPoints = deeds.reduce((sum, d) => sum + d.points, 0)

  return (
    <div
      className={clsx(
        "relative mt-8 overflow-hidden rounded-3xl border p-5 sm:p-6",
        classes.border,
        classes.wash,
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={clsx(
            "flex size-16 shrink-0 items-center justify-center rounded-2xl ring-2 ring-offset-2 ring-offset-surface",
            classes.solidBg,
            classes.ring,
          )}
        >
          <Icon weight="fill" className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{category.label}</h2>
          <p className="mt-0.5 text-xs text-ink-faint">{category.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
            classes.border,
            classes.bg,
            classes.text,
          )}
        >
          <ListChecks weight="bold" className="size-3.5" />
          {deeds.length} {deeds.length === 1 ? "deed" : "deeds"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber-soft px-3 py-1.5 text-xs font-semibold text-amber">
          <Sparkle weight="fill" className="size-3.5" />
          {totalPoints} XP available
        </span>
      </div>
    </div>
  )
}

function DueTodayCarousel({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="mt-6 lg:mt-0">
      <p className="mb-2.5 text-[13px] font-semibold text-ink-muted">
        {subscriptions.length} deed{subscriptions.length > 1 ? "s" : ""} due today
      </p>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scroll-pl-4 sm:mx-0 sm:px-0 sm:scroll-pl-0">
        {subscriptions.map((sub) => {
          const deed = getDeedById(sub.deedId)
          if (!deed) return null
          const category = getCategory(deed.category)
          const classes = accentClasses(category.color)
          const Icon = CATEGORY_ICONS[deed.category]

          return (
            <Link
              key={sub.id}
              to={`/deeds/${deed.id}`}
              className="tap-scale flex w-[84%] shrink-0 snap-start items-center gap-3.5 rounded-[20px] border border-border bg-surface p-4 hover:border-border-strong sm:w-[320px]"
            >
              <span
                className={clsx(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                  classes.bg,
                  classes.text,
                )}
              >
                <Icon weight="fill" className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-ink">{deed.title}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{sub.time}</span>
              </span>
              <CaretRight className="size-4 shrink-0 text-ink-faint" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function NoDeedsDueToday() {
  return (
    <div className="mt-6 lg:mt-0">
      <p className="mb-2.5 text-[13px] font-semibold text-ink-muted">Nothing due today</p>
      <div className="flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-soft text-emerald">
          <CheckCircle weight="fill" className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-ink">All caught up</span>
          <span className="mt-0.5 block text-xs text-ink-muted">
            No deeds scheduled for today. Great job!
          </span>
        </span>
      </div>
    </div>
  )
}
