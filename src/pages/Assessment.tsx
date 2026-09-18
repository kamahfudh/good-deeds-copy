import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, CheckCircle, Sparkle } from "@phosphor-icons/react"
import clsx from "clsx"
import { AnimatePresence, motion } from "motion/react"
import { CATEGORIES, getCategory, getDeedById, type CategoryId, type Deed } from "../lib/data"
import {
  END_NODE,
  PROFILES,
  QUESTIONS,
  deriveAssessmentState,
  type AssessmentAnswer,
  type CategoryResult,
  type QuestionNode,
} from "../lib/questionnaire"
import { CATEGORY_ICONS, PROFILE_ICONS } from "../components/icons"
import { accentClasses } from "../lib/colors"
import { DeedRow } from "../components/DeedRow"
import { useGoodDeeds } from "../lib/store"

type Stage = "intro" | "flow" | "viewSaved"

export function Assessment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { assessment, saveAssessment } = useGoodDeeds()
  const wantsSaved = Boolean((location.state as { viewSaved?: boolean } | null)?.viewSaved)

  const [stage, setStage] = useState<Stage>(wantsSaved && assessment ? "viewSaved" : "intro")
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])

  const { nodeId, results } = useMemo(() => deriveAssessmentState(answers), [answers])
  const currentNode = nodeId === END_NODE ? null : QUESTIONS[nodeId]

  const handleSelect = (optionIndex: number) => {
    if (!currentNode) return
    setAnswers((prev) => [...prev, { nodeId: currentNode.id, optionIndex }])
  }

  const handleBack = () => {
    if (stage === "viewSaved") {
      navigate(-1)
      return
    }
    if (answers.length === 0) {
      if (stage === "flow") setStage("intro")
      else navigate(-1)
      return
    }
    setAnswers((prev) => prev.slice(0, -1))
  }

  const handleRetake = () => {
    setAnswers([])
    setStage("flow")
  }

  const handleSave = () => {
    const deedIds = new Set<string>()
    for (const result of Object.values(results)) {
      result?.deedIds.forEach((id) => deedIds.add(id))
    }
    saveAssessment({ deedIds: Array.from(deedIds), categoryResults: results, completedAt: Date.now() })
    navigate("/")
  }

  if (stage === "viewSaved" && assessment) {
    return (
      <ResultsScreen
        results={assessment.categoryResults}
        onBack={handleBack}
        primaryAction={{ label: "Retake assessment", onClick: handleRetake }}
        secondaryAction={{ label: "Close", onClick: () => navigate(-1) }}
      />
    )
  }

  if (stage === "intro") {
    return <IntroScreen onStart={() => setStage("flow")} onSkip={() => navigate(-1)} />
  }

  if (!currentNode) {
    return (
      <ResultsScreen
        results={results}
        onBack={handleBack}
        primaryAction={{ label: "Save & view recommended deeds", onClick: handleSave }}
        secondaryAction={{ label: "Retake assessment", onClick: handleRetake }}
      />
    )
  }

  return (
    <QuestionScreen
      node={currentNode}
      questionNumber={answers.length + 1}
      onSelect={handleSelect}
      onBack={handleBack}
    />
  )
}

function ScreenShell({
  onBack,
  title,
  right,
  children,
}: {
  onBack: () => void
  title: string
  right?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">{title}</p>
        <span className="inline-flex w-14 items-center justify-end">{right}</span>
      </div>
      {children}
    </div>
  )
}

function IntroScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <ScreenShell onBack={onSkip} title="Worship Assessment">
      <div className="mt-8 flex flex-col items-center text-center">
        <span className="relative flex size-16 items-center justify-center rounded-3xl">
          <span className="absolute inset-0 rounded-3xl bg-brand opacity-40 blur-xl" />
          <span className="relative flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand">
            <Sparkle weight="fill" className="size-7" />
          </span>
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">Find your worship profile</h1>
        <p className="mt-2.5 max-w-sm text-sm text-ink-muted">
          Answer a short set of questions about your Salah, Qur'an, and Fasting habits. We'll use
          your answers to recommend the deeds that fit where you are right now.
        </p>

        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {CATEGORIES.map((category) => {
            const classes = accentClasses(category.color)
            const Icon = CATEGORY_ICONS[category.id]
            return (
              <div
                key={category.id}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-2 py-5"
              >
                <span
                  className={clsx(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl sm:size-14",
                    classes.bg,
                    classes.text,
                  )}
                >
                  <Icon weight="fill" className="size-6 sm:size-7" />
                </span>
                <span className="text-xs font-semibold text-ink sm:text-sm">{category.shortLabel}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-8 w-full text-left">
          <p className="mb-3 text-sm font-semibold text-ink">Where you could land</p>
          <div className="flex flex-col gap-2.5">
            {Object.values(PROFILES).map((profile) => {
              const classes = accentClasses(profile.color)
              const Icon = PROFILE_ICONS[profile.id]
              return (
                <div
                  key={profile.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
                >
                  <span
                    className={clsx(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      classes.bg,
                      classes.text,
                    )}
                  >
                    <Icon weight="fill" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{profile.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{profile.tagline}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="tap-scale mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-[14.5px] font-bold text-white hover:bg-brand/90"
        >
          Start assessment
          <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="tap-scale mt-3 text-sm font-medium text-ink-faint hover:text-ink"
        >
          Not now
        </button>
      </div>
    </ScreenShell>
  )
}

function CategoryStepper({ activeCategoryId }: { activeCategoryId: CategoryId }) {
  const activeIndex = CATEGORIES.findIndex((c) => c.id === activeCategoryId)

  return (
    <div className="flex items-center justify-center">
      {CATEGORIES.map((c, index) => {
        const Icon = CATEGORY_ICONS[c.id]
        const classes = accentClasses(c.color)
        const isDone = index < activeIndex
        const isActive = index === activeIndex

        return (
          <div key={c.id} className="flex items-center">
            <span
              className={clsx(
                "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                isDone && clsx(classes.bg, classes.text, "border-transparent"),
                isActive && clsx(classes.bg, classes.text, "border-transparent ring-2", classes.ring),
                !isDone && !isActive && "border-border text-ink-faint",
              )}
            >
              {isDone ? (
                <Check weight="bold" className="size-3.5" />
              ) : (
                <Icon weight="fill" className="size-3.5" />
              )}
            </span>
            {index < CATEGORIES.length - 1 && (
              <span
                className={clsx(
                  "h-px w-10 transition-colors duration-300",
                  index < activeIndex ? "bg-brand" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function LevelDots({
  level,
  total,
  active,
  accentDot,
}: {
  level: number
  total: number
  active: boolean
  accentDot: string
}) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "size-[7px] rounded-full transition-colors duration-150",
            i < level ? (active ? accentDot : "bg-ink-muted") : "bg-border",
          )}
        />
      ))}
    </span>
  )
}

function QuestionScreen({
  node,
  questionNumber,
  onSelect,
  onBack,
}: {
  node: QuestionNode
  questionNumber: number
  onSelect: (optionIndex: number) => void
  onBack: () => void
}) {
  const category = getCategory(node.category)
  const classes = accentClasses(category.color)
  const Icon = CATEGORY_ICONS[node.category]
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)

  useEffect(() => {
    setPickedIndex(null)
  }, [node.id])

  const handlePick = (index: number) => {
    if (pickedIndex !== null) return
    setPickedIndex(index)
    window.setTimeout(() => onSelect(index), 150)
  }

  return (
    <ScreenShell
      onBack={onBack}
      title={category.shortLabel}
      right={
        <span className={clsx("flex size-8 items-center justify-center rounded-full", classes.bg, classes.text)}>
          <Icon weight="fill" className="size-4" />
        </span>
      }
    >
      <div className="mt-7">
        <CategoryStepper activeCategoryId={node.category} />
      </div>

      <div className="flex min-h-[66dvh] flex-col justify-center sm:min-h-[58dvh]">
        <div className="flex flex-col items-center text-center">
          <span className="relative flex size-16 items-center justify-center rounded-3xl">
            <span className={clsx("absolute inset-0 rounded-3xl opacity-60 blur-xl", classes.bg)} />
            <span
              className={clsx(
                "relative flex size-16 items-center justify-center rounded-3xl",
                classes.bg,
                classes.text,
              )}
            >
              <Icon weight="fill" className="size-7" />
            </span>
          </span>
          <p className="mt-4 text-xs font-medium text-ink-faint">
            {category.label} &middot; Question {questionNumber}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-5"
          >
            <h1 className="text-center text-2xl font-bold leading-snug text-ink">{node.text}</h1>

            <div className="mt-7 flex flex-col gap-2.5">
              {node.options.map((option, index) => {
                const isPicked = pickedIndex === index
                const isDimmed = pickedIndex !== null && !isPicked

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handlePick(index)}
                    disabled={pickedIndex !== null}
                    className={clsx(
                      "tap-scale group flex items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-colors duration-150",
                      isPicked
                        ? clsx(classes.border, classes.bg)
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised",
                      isDimmed && "opacity-40",
                    )}
                  >
                    <LevelDots
                      level={index + 1}
                      total={node.options.length}
                      active={isPicked}
                      accentDot={classes.dot}
                    />
                    <span
                      className={clsx(
                        "flex-1 text-[15px] font-semibold text-ink",
                        isPicked && classes.text,
                      )}
                    >
                      {option.label}
                    </span>
                    {isPicked && (
                      <CheckCircle weight="fill" className={clsx("size-5 shrink-0", classes.text)} />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ScreenShell>
  )
}

interface ResultsAction {
  label: string
  onClick: () => void
}

function ResultsScreen({
  results,
  onBack,
  primaryAction,
  secondaryAction,
}: {
  results: Partial<Record<CategoryId, CategoryResult>>
  onBack: () => void
  primaryAction: ResultsAction
  secondaryAction: ResultsAction
}) {
  const allDeedIds = useMemo(
    () => Array.from(new Set(Object.values(results).flatMap((r) => r?.deedIds ?? []))),
    [results],
  )

  return (
    <ScreenShell onBack={onBack} title="Your Results">
      <div className="mt-6 flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-3xl bg-emerald-soft text-emerald">
          <CheckCircle weight="fill" className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink">Here's your worship profile</h1>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
          {allDeedIds.length} deed{allDeedIds.length === 1 ? "" : "s"} recommended across Salah,
          Qur'an, and Fasting.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        {CATEGORIES.map((category) => {
          const result = results[category.id]
          if (!result) return null
          const profile = PROFILES[result.profile]
          const profileClasses = accentClasses(profile.color)
          const categoryClasses = accentClasses(category.color)
          const Icon = CATEGORY_ICONS[category.id]
          const ProfileIcon = PROFILE_ICONS[profile.id]
          const deeds = result.deedIds
            .map((id) => getDeedById(id))
            .filter((d): d is Deed => d !== undefined)

          return (
            <section
              key={category.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    categoryClasses.bg,
                    categoryClasses.text,
                  )}
                >
                  <Icon weight="fill" className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[15px] font-semibold text-ink">{category.label}</p>
                  <span
                    className={clsx(
                      "mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      profileClasses.bg,
                      profileClasses.text,
                    )}
                  >
                    <ProfileIcon weight="fill" className="size-3" />
                    {profile.label}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink-muted">{profile.tagline}</p>

              <div className="mt-4 flex flex-col gap-2">
                {deeds.map((deed) => (
                  <DeedRow key={deed.id} deed={deed} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={primaryAction.onClick}
          className="tap-scale flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-[14.5px] font-bold text-white hover:bg-brand/90"
        >
          {primaryAction.label}
          <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="tap-scale text-sm font-medium text-ink-faint hover:text-ink"
        >
          {secondaryAction.label}
        </button>
      </div>
    </ScreenShell>
  )
}
