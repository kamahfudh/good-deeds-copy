import { useState } from "react"
import { ArrowLeft, Check, MagnifyingGlass } from "@phosphor-icons/react"
import { COUNTRIES, type Country } from "../lib/countries"

export function CountryPickerSheet({
  open,
  title,
  selectedCode,
  onSelect,
  onClose,
}: {
  open: boolean
  title: string
  selectedCode?: string
  onSelect: (country: Country) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")

  if (!open) return null

  const q = query.trim().toLowerCase()
  const visible =
    q.length === 0
      ? COUNTRIES
      : COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q))

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
        <p className="truncate text-[15px] font-bold text-ink">{title}</p>
        <span className="inline-flex w-9" />
      </div>

      <div className="shrink-0 px-4 pt-3">
        <div className="flex items-center gap-2 rounded-full bg-surface-raised px-4 py-2.5">
          <MagnifyingGlass className="size-4 shrink-0 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-faint">No results for "{query}"</p>
        ) : (
          visible.map((country) => {
            const selected = country.code === selectedCode
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onSelect(country)
                  onClose()
                }}
                className="tap-scale flex w-full items-center gap-3 border-b border-border py-3 text-left last:border-b-0 hover:bg-surface-raised"
              >
                <span className="text-xl leading-none">{country.flag}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{country.name}</span>
                <span className="shrink-0 text-xs font-medium text-ink-faint">{country.dial}</span>
                {selected && <Check weight="bold" className="size-4 shrink-0 text-brand" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
