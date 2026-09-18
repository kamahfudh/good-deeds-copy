const STORAGE_KEY = "good-deeds:language:v1"

export interface Language {
  code: string
  name: string
  nativeName: string
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
]

// Stores the preference only — the app's copy is English-only for now, so
// picking another language here doesn't retranslate the UI yet.
export function getLanguageCode(): string {
  if (typeof window === "undefined") return "en"
  return window.localStorage.getItem(STORAGE_KEY) || "en"
}

export function setLanguageCode(code: string): void {
  window.localStorage.setItem(STORAGE_KEY, code)
}

export function getLanguage(): Language {
  return LANGUAGES.find((l) => l.code === getLanguageCode()) ?? LANGUAGES[0]
}
