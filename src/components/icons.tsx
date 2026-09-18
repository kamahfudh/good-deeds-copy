import { forwardRef } from "react"
import { Mosque, BookOpenText, Moon, Flag, TrendUp, Trophy, type Icon, type IconProps } from "@phosphor-icons/react"
import type { CategoryId } from "../lib/data"
import type { ProfileId } from "../lib/questionnaire"

export const CATEGORY_ICONS: Record<CategoryId, Icon> = {
  salah: Mosque,
  quran: BookOpenText,
  fasting: Moon,
}

export const PROFILE_ICONS: Record<ProfileId, Icon> = {
  foundation: Flag,
  devoted: TrendUp,
  exemplar: Trophy,
}

// Phosphor has no literal Kaaba icon — this is a custom monochrome silhouette
// (cube body, cutout band for the kiswah's gold belt, cutout door) that follows
// the same currentColor/viewBox-256 convention as every Phosphor icon so it
// drops into DEED_ICONS/CATEGORY_ICONS maps unchanged.
export const Kaaba: Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", size = "1em", ...rest }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill={color}
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M60,44 H196 A16,16 0 0 1 212,60 V196 A16,16 0 0 1 196,212 H60 A16,16 0 0 1 44,196 V60 A16,16 0 0 1 60,44 Z M50,96 H206 V120 H50 Z M112,160 H144 V196 H112 Z"
      />
    </svg>
  ),
)
Kaaba.displayName = "Kaaba"
