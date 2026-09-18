const STORAGE_KEY = "good-deeds:privacy:v1"

export type AccountVisibility = "public" | "private"

export function getAccountVisibility(): AccountVisibility {
  if (typeof window === "undefined") return "public"
  return window.localStorage.getItem(STORAGE_KEY) === "private" ? "private" : "public"
}

export function setAccountVisibility(visibility: AccountVisibility): void {
  window.localStorage.setItem(STORAGE_KEY, visibility)
}

// Wipes every good-deeds:* localStorage key (points, deeds, social, profile,
// password, theme, privacy) plus the IndexedDB store for post media. This is
// a fully device-local app with no server — "deleting your account" means
// erasing everything this device has stored for it, then reloading fresh.
export function deleteAllLocalData(): void {
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith("good-deeds"))
    .forEach((key) => window.localStorage.removeItem(key))

  try {
    window.indexedDB.deleteDatabase("good-deeds-social-media")
  } catch {
    // best-effort — the reload below still leaves the app in a clean state
  }
}
