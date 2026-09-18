import { ArrowLeft, Check } from "@phosphor-icons/react"
import clsx from "clsx"
import { LANGUAGES, type Language } from "../lib/language"

const CODE_TONES = [
  "bg-brand-soft text-brand",
  "bg-emerald-soft text-emerald",
  "bg-violet-soft text-violet",
  "bg-cyan-soft text-cyan",
  "bg-amber-soft text-amber",
  "bg-rose-soft text-rose",
]

export function LanguagePickerSheet({
  open,
  selectedCode,
  onSelect,
  onClose,
}: {
  open: boolean
  selectedCode: string
  onSelect: (language: Language) => void
  onClose: () => void
}) {
  if (!open) return null

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
        <p className="truncate text-[15px] font-bold text-ink">Select language</p>
        <span className="inline-flex w-9" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {LANGUAGES.map((language, index) => {
          const selected = language.code === selectedCode
          const tone = CODE_TONES[index % CODE_TONES.length]
          return (
            <button
              key={language.code}
              type="button"
              onClick={() => {
                onSelect(language)
                onClose()
              }}
              className={clsx(
                "tap-scale flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors",
                selected ? "bg-brand-soft" : "hover:bg-surface-raised",
              )}
            >
              <span className={clsx("flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase", tone)}>
                {language.code}
              </span>
              <span className="min-w-0 flex-1">
                <p className={clsx("truncate text-sm font-semibold", selected ? "text-brand" : "text-ink")}>{language.nativeName}</p>
                {language.nativeName !== language.name && (
                  <p className={clsx("truncate text-xs", selected ? "text-brand/70" : "text-ink-faint")}>{language.name}</p>
                )}
              </span>
              {selected && (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Check weight="bold" className="size-3.5" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
