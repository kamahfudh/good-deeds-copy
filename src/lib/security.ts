const STORAGE_KEY = "good-deeds:security:v1"

// The starter "current password" for this device before anyone has changed
// it — there's no real signup flow, so this is what a first-time change
// verifies against. Shown to the user on the Change Password screen itself
// rather than hidden, since there's no email/SMS recovery to fall back on.
export const DEFAULT_PASSWORD = "gooddeeds123"

interface SecurityRecord {
  passwordHash: string
  updatedAt: number
}

// NOT real cryptographic hashing — this app is 100% client-side with no
// server and no account system, so this only avoids storing the literal
// password string in localStorage. Do not reuse this for anything real.
function hashPassword(password: string): string {
  let hash = 5381
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

function loadRecord(): SecurityRecord | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SecurityRecord
  } catch {
    return null
  }
}

export function verifyCurrentPassword(password: string): boolean {
  const record = loadRecord()
  const expectedHash = record?.passwordHash ?? hashPassword(DEFAULT_PASSWORD)
  return hashPassword(password) === expectedHash
}

export function setPassword(password: string): void {
  const record: SecurityRecord = { passwordHash: hashPassword(password), updatedAt: Date.now() }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function getPasswordUpdatedAt(): number | null {
  return loadRecord()?.updatedAt ?? null
}
