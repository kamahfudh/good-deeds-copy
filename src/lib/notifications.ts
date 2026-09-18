const STORAGE_KEY = "good-deeds:notifications:v1"

export interface NotificationPrefs {
  prayerReminders: boolean
  socialActivity: boolean
  weeklySummary: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  prayerReminders: true,
  socialActivity: true,
  weeklySummary: false,
}

export function getNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_NOTIFICATION_PREFS
  try {
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) }
  } catch {
    return DEFAULT_NOTIFICATION_PREFS
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}
