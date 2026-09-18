import { useState } from "react"
import { ArrowLeft, BookOpen, Check, Minus, Plus } from "@phosphor-icons/react"
import clsx from "clsx"
import type { QuranAttachment, Surah } from "../lib/quran"
import { SurahListSheet } from "./SurahListSheet"

type Step = "surah" | "ayah"

export function QuranPickerSheet({
  open,
  onAttach,
  onClose,
}: {
  open: boolean
  onAttach: (attachment: QuranAttachment) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>("surah")
  const [surah, setSurah] = useState<Surah | null>(null)
  const [fromAyah, setFromAyah] = useState(1)
  const [toAyah, setToAyah] = useState(1)

  if (!open) return null

  function close() {
    setStep("surah")
    setSurah(null)
    onClose()
  }

  function chooseSurah(s: Surah) {
    setSurah(s)
    setFromAyah(1)
    setToAyah(Math.min(3, s.verseCount))
    setStep("ayah")
  }

  function adjustFrom(delta: number) {
    if (!surah) return
    const next = Math.max(1, Math.min(surah.verseCount, fromAyah + delta))
    setFromAyah(next)
    if (next > toAyah) setToAyah(next)
  }

  function adjustTo(delta: number) {
    if (!surah) return
    const next = Math.max(1, Math.min(surah.verseCount, toAyah + delta))
    setToAyah(next)
    if (next < fromAyah) setFromAyah(next)
  }

  function confirm() {
    if (!surah) return
    onAttach({
      surahNumber: surah.number,
      surahName: surah.nameTransliteration,
      fromAyah,
      toAyah,
    })
    close()
  }

  if (step === "surah") {
    return <SurahListSheet open onSelect={chooseSurah} onClose={close} />
  }

  if (!surah) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={() => setStep("surah")}
          aria-label="Back"
          className="tap-scale flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-5" />
        </button>
        <p className="truncate text-[15px] font-bold text-ink">Select Verses</p>
        <span className="inline-flex w-9" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4">
        <div className="flex flex-col items-center rounded-3xl border border-border bg-surface p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-soft text-emerald">
            <BookOpen weight="fill" className="size-6" />
          </span>
          <p className="mt-3 text-lg font-bold text-ink">{surah.nameTransliteration}</p>
          <p className="text-xl text-ink-faint">{surah.nameArabic}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {surah.nameMeaning} · {surah.verseCount} verses · {surah.revelation}
          </p>
        </div>

        <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Verse range</p>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-ink-faint">From</span>
            <div className="flex items-center gap-2">
              <Stepper onClick={() => adjustFrom(-1)} disabled={fromAyah <= 1} icon={Minus} />
              <span className="w-10 text-center text-lg font-bold tabular-nums text-ink">{fromAyah}</span>
              <Stepper onClick={() => adjustFrom(1)} disabled={fromAyah >= surah.verseCount} icon={Plus} />
            </div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-ink-faint">To</span>
            <div className="flex items-center gap-2">
              <Stepper onClick={() => adjustTo(-1)} disabled={toAyah <= 1} icon={Minus} />
              <span className="w-10 text-center text-lg font-bold tabular-nums text-ink">{toAyah}</span>
              <Stepper onClick={() => adjustTo(1)} disabled={toAyah >= surah.verseCount} icon={Plus} />
            </div>
          </div>
        </div>

        <p className="mt-4 px-1 text-center text-sm text-ink-faint">
          Attaching <span className="font-semibold text-ink">{surah.nameTransliteration}</span>, ayah{" "}
          <span className="font-semibold text-ink">
            {fromAyah === toAyah ? fromAyah : `${fromAyah}–${toAyah}`}
          </span>
        </p>

        <button
          type="button"
          onClick={confirm}
          className="tap-scale mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-canvas hover:bg-ink/90"
        >
          <Check weight="bold" className="size-4" />
          Attach verses
        </button>
      </div>
    </div>
  )
}

function Stepper({
  onClick,
  disabled,
  icon: Icon,
}: {
  onClick: () => void
  disabled: boolean
  icon: typeof Plus
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "tap-scale flex size-8 items-center justify-center rounded-full border",
        disabled ? "cursor-not-allowed border-border text-ink-faint/40" : "border-border-strong text-ink hover:bg-surface-raised",
      )}
    >
      <Icon weight="bold" className="size-3.5" />
    </button>
  )
}
