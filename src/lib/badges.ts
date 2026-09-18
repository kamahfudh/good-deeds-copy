import { Compass, Crown, Medal, ShieldCheck, type Icon } from "@phosphor-icons/react"

export interface BadgeTier {
  id: string
  label: string
  minPoints: number
  maxPoints: number | null
  perks: string[]
  icon: Icon
}

export const BADGE_TIERS: BadgeTier[] = [
  {
    id: "seeker",
    label: "Seeker",
    minPoints: 0,
    maxPoints: 499,
    perks: ["Full deed library access", "Daily streak tracking"],
    icon: Compass,
  },
  {
    id: "devoted",
    label: "Devoted",
    minPoints: 500,
    maxPoints: 1999,
    perks: ["Everything in Seeker", "Social profile badge", "Deed history insights"],
    icon: Medal,
  },
  {
    id: "steadfast",
    label: "Steadfast",
    minPoints: 2000,
    maxPoints: 4999,
    perks: ["Everything in Devoted", "Early access to new deeds", "Featured reflections on Social"],
    icon: ShieldCheck,
  },
  {
    id: "luminary",
    label: "Luminary",
    minPoints: 5000,
    maxPoints: null,
    perks: ["Everything in Steadfast", "Luminary badge on Social", "Yearly reflection summary"],
    icon: Crown,
  },
]

export function tierIndexForPoints(points: number): number {
  const idx = BADGE_TIERS.findIndex((t) => points >= t.minPoints && (t.maxPoints === null || points <= t.maxPoints))
  return idx === -1 ? BADGE_TIERS.length - 1 : idx
}

export function getTierForPoints(points: number): BadgeTier {
  return BADGE_TIERS[tierIndexForPoints(points)]
}

export function getNextTier(points: number): BadgeTier | null {
  return BADGE_TIERS[tierIndexForPoints(points) + 1] ?? null
}
