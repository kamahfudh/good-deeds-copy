import type { Category } from "./data"

export type AccentColor = Category["color"]

interface AccentClasses {
  text: string
  bg: string
  border: string
  dot: string
  solidBg: string
  ring: string
  wash: string
}

const MAP: Record<AccentColor, AccentClasses> = {
  amber: {
    text: "text-amber",
    bg: "bg-amber-soft",
    border: "border-amber/25",
    dot: "bg-amber",
    solidBg: "bg-[#FFBE4C] text-[#0D0D12]",
    ring: "ring-amber/30",
    wash: "bg-gradient-to-br from-amber/25 via-amber/8 to-transparent",
  },
  brand: {
    text: "text-brand",
    bg: "bg-brand-soft",
    border: "border-brand/25",
    dot: "bg-brand",
    solidBg: "bg-brand text-white",
    ring: "ring-brand/30",
    wash: "bg-gradient-to-br from-brand/25 via-brand/8 to-transparent",
  },
  emerald: {
    text: "text-emerald",
    bg: "bg-emerald-soft",
    border: "border-emerald/25",
    dot: "bg-emerald",
    solidBg: "bg-[#28806F] text-white",
    ring: "ring-emerald/30",
    wash: "bg-gradient-to-br from-emerald/25 via-emerald/8 to-transparent",
  },
  rose: {
    text: "text-rose",
    bg: "bg-rose-soft",
    border: "border-rose/25",
    dot: "bg-rose",
    solidBg: "bg-[#96132C] text-white",
    ring: "ring-rose/30",
    wash: "bg-gradient-to-br from-rose/25 via-rose/8 to-transparent",
  },
  violet: {
    text: "text-violet",
    bg: "bg-violet-soft",
    border: "border-violet/25",
    dot: "bg-violet",
    solidBg: "bg-[#7C3AED] text-white",
    ring: "ring-violet/30",
    wash: "bg-gradient-to-br from-violet/25 via-violet/8 to-transparent",
  },
  cyan: {
    text: "text-cyan",
    bg: "bg-cyan-soft",
    border: "border-cyan/25",
    dot: "bg-cyan",
    solidBg: "bg-cyan text-[#0D0D12]",
    ring: "ring-cyan/30",
    wash: "bg-gradient-to-br from-cyan/25 via-cyan/8 to-transparent",
  },
}

export function accentClasses(color: AccentColor): AccentClasses {
  return MAP[color]
}
