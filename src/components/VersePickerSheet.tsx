import { useState } from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import clsx from "clsx"

export function VersePickerSheet({
  open,
  surahName,
  verseCount,
  selectedVerse,
  onSelect,
  onClose,
}: {
  open: boolean
  surahName: string
  verseCount: number
  selectedVerse: number
  onSelect: (verse: number) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")

  if (!open) return null

  const q = query.trim()
  const all = Array.from({ length: verseCount }, (_, i) => i + 1)
  const visible = q.length === 0 ? all : all.filter((v) => String(v).startsWith(q))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-[28px] bg-surface shadow-pop sm:mb-6 sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 rounded-t-[28px] bg-gradient-to-b from-brand-soft to-transparent px-5 pb-4 pt-3">
          <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-border-strong" />
          <p className="text-xl font-bold text-ink">Choose a Verse</p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {surahName} · {verseCount} verses total
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5">
            <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
            <input
              autoFocus
              inputMode="numeric"
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={`Jump to verse (1–${verseCount})`}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-faint">No verse "{query}"</p>
          ) : (
            <div className="grid grid-cols-5 gap-2.5 pb-2 sm:grid-cols-6">
              {visible.map((v) => {
                const selected = v === selectedVerse
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      onSelect(v)
                      onClose()
                    }}
                    className={clsx(
                      "tap-scale flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                      selected ? "bg-brand text-white" : "bg-surface-raised/60 text-ink hover:bg-border/40",
                    )}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
