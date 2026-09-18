import { useEffect, useState } from "react"

const DB_NAME = "good-deeds-social-media"
const STORE_NAME = "media"
const DB_VERSION = 1

export const MAX_VIDEO_BYTES = 25 * 1024 * 1024
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024
export const MAX_AUDIO_SECONDS = 50

// Reads duration client-side via a throwaway <audio> element — no upload or
// decode library needed, just enough to enforce the 50s cap before saving.
export function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.preload = "metadata"
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read audio file."))
    }
    audio.src = url
  })
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Fired after a blob is written so any already-mounted useMediaUrl(id) can
// pick it up — needed because seed media (seedMedia.ts) is generated
// asynchronously in the background, often after the posts referencing it
// have already mounted and given up looking (their one-time lookup ran
// before the blob existed).
const MEDIA_SAVED_EVENT = "good-deeds:media-saved"

export async function saveMedia(id: string, blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  window.dispatchEvent(new CustomEvent<string>(MEDIA_SAVED_EVENT, { detail: id }))
}

export async function loadMediaBlob(id: string): Promise<Blob | undefined> {
  const db = await openDb()
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(id)
    req.onsuccess = () => resolve(req.result as Blob | undefined)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return blob
}

export function useMediaUrl(mediaId?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!mediaId) {
      setUrl(undefined)
      return
    }
    let objectUrl: string | undefined
    let cancelled = false

    function attemptLoad() {
      loadMediaBlob(mediaId!).then((blob) => {
        if (cancelled || !blob || objectUrl) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
    }

    function onMediaSaved(e: Event) {
      if ((e as CustomEvent<string>).detail === mediaId) attemptLoad()
    }

    attemptLoad()
    window.addEventListener(MEDIA_SAVED_EVENT, onMediaSaved)
    return () => {
      cancelled = true
      window.removeEventListener(MEDIA_SAVED_EVENT, onMediaSaved)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  return url
}
