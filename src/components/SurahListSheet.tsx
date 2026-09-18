import { useMemo, useState } from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import clsx from "clsx"
import { SURAHS, type Surah } from "../lib/quran"

type Filter = "all" | "Meccan" | "Medinan"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Meccan", label: "Meccan" },
  { key: "Medinan", label: "Medinan" },
]

function SurahCard({ surah, onSelect }: { surah: Surah; onSelect: (s: Surah) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(surah)}
      className="tap-scale flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface-raised/60 p-3.5 text-left"
    >
      <div className="flex w-full items-center justify-between">
        <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand">
          {surah.number}
        </span>
        <span
          className={clsx(
            "size-1.5 rounded-full",
            surah.revelation === "Meccan" ? "bg-amber" : "bg-cyan",
          )}
          aria-hidden
        />
      </div>
      <span className="text-2xl leading-none text-ink">{surah.nameArabic}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{surah.nameTransliteration}</span>
        <span className="block truncate text-[11px] text-ink-faint">
          {surah.nameMeaning} · {surah.verseCount} verses
        </span>
      </span>
    </button>
  )
}

export function SurahListSheet({
  open,
  title = "Choose a Surah",
  onSelect,
  onClose,
}: {
  open: boolean
  title?: string
  onSelect: (surah: Surah) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const visibleSurahs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SURAHS.filter((s) => {
      if (filter !== "all" && s.revelation !== filter) return false
      if (q.length === 0) return true
      return (
        s.nameTransliteration.toLowerCase().includes(q) ||
        s.nameMeaning.toLowerCase().includes(q) ||
        String(s.number) === q
      )
    })
  }, [query, filter])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-[28px] bg-surface shadow-pop sm:mb-6 sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 rounded-t-[28px] bg-gradient-to-b from-brand-soft to-transparent px-5 pb-4 pt-3 sm:rounded-t-[28px]">
          <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-border-strong" />
          <p className="text-xl font-bold text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-ink-faint">114 chapters of the Qur'an</p>

          <div className="mt-3 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5">
            <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or number"
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          <div className="mt-3 flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={clsx(
                  "tap-scale rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filter === f.key ? "bg-brand text-white" : "bg-surface text-ink-faint hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          {visibleSurahs.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-faint">No results for "{query}"</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visibleSurahs.map((s) => (
                <SurahCard
                  key={s.number}
                  surah={s}
                  onSelect={(surah) => {
                    onSelect(surah)
                    setQuery("")
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
