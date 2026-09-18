const STORAGE_KEY = "good-deeds:profile:v1"

export type Gender = "female" | "male"

export interface ProfileRecord {
  fullName: string
  email: string
  // Distinct from the immutable @you social handle used across Social —
  // this is just a personal-info field, not wired into posts/mentions.
  username: string
  gender: Gender | ""
  phoneCountryCode: string
  phoneNumber: string
  nationalityCode: string
  countryCode: string
}

export const EMPTY_PROFILE: ProfileRecord = {
  fullName: "",
  email: "",
  username: "",
  gender: "",
  phoneCountryCode: "",
  phoneNumber: "",
  nationalityCode: "",
  countryCode: "",
}

export function getProfile(): ProfileRecord {
  if (typeof window === "undefined") return EMPTY_PROFILE
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return EMPTY_PROFILE
  try {
    return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<ProfileRecord>) }
  } catch {
    return EMPTY_PROFILE
  }
}

export function saveProfile(profile: ProfileRecord): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}
