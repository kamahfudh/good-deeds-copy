import { loadMediaBlob, saveMedia } from "./mediaStore"

// Seed posts reference a small, fixed pool of generated image/video ids (not
// one asset per post) so startup generation stays cheap and the same few
// visuals repeat across the feed, the same way stock demo data usually does.
export const SEED_IMAGE_IDS = ["seed-media-img-1", "seed-media-img-2", "seed-media-img-3", "seed-media-img-4", "seed-media-img-5"]
export const SEED_VIDEO_IDS = ["seed-media-vid-1", "seed-media-vid-2", "seed-media-vid-3"]

// One gradient pair per generated image/video, pulled from the app's own
// accent palette (src/index.css) rather than inventing new colors.
const GRADIENTS: [string, string][] = [
  ["#5A65ED", "#28806F"], // brand -> emerald
  ["#FFBE4C", "#966422"], // amber -> amber-strong
  ["#B794F6", "#7C3AED"], // violet light -> violet
  ["#40C4AA", "#174E43"], // emerald -> emerald-strong
  ["#DF1C41", "#710E21"], // rose -> rose-strong
]

function drawGradientFrame(ctx: CanvasRenderingContext2D, size: number, colors: [string, string], ringStart = 40) {
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // A simple geometric overlay (concentric rings) so it reads as an
  // intentional illustration rather than a flat placeholder swatch.
  ctx.strokeStyle = "rgba(255,255,255,0.25)"
  ctx.lineWidth = 2
  for (let r = ringStart; r < size; r += 60) {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  }
}

async function generateImage(id: string, colors: [string, string]) {
  const size = 640
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  drawGradientFrame(ctx, size, colors)

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
  if (blob) await saveMedia(id, blob)
}

async function generateVideo(id: string, colors: [string, string]) {
  if (typeof MediaRecorder === "undefined") return // graceful no-op on unsupported browsers
  const size = 480
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  drawGradientFrame(ctx, size, colors)

  try {
    const stream = canvas.captureStream(10)
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
    })
    recorder.start(200) // flush a chunk every 200ms so the webm gets real duration metadata

    // Gently pulse the rings for ~2s so playback isn't just a single frozen
    // frame if the user scrubs the timeline.
    const durationMs = 2000
    const start = performance.now()
    await new Promise<void>((resolve) => {
      function frame(now: number) {
        const elapsed = now - start
        const pulse = 40 + 20 * Math.sin(elapsed / 220)
        ctx!.clearRect(0, 0, size, size)
        drawGradientFrame(ctx!, size, colors, pulse)
        if (elapsed < durationMs) requestAnimationFrame(frame)
        else resolve()
      }
      requestAnimationFrame(frame)
    })

    recorder.stop()
    await stopped
    stream.getTracks().forEach((t) => t.stop())
    if (chunks.length > 0) await saveMedia(id, new Blob(chunks, { type: "video/webm" }))
  } catch {
    // Recording isn't available/allowed in this environment — the post still
    // renders fine, just with the "media loading" placeholder indefinitely.
  }
}

let ensured = false

// Fire-and-forget: generates the seed image/video pool into IndexedDB the
// first time the app runs (skips any id that's already stored), so seed
// posts referencing them have something real to display instead of a
// permanent loading placeholder. Safe to call on every SocialProvider mount.
export function ensureSeedMediaGenerated() {
  if (ensured || typeof document === "undefined") return
  ensured = true
  ;(async () => {
    for (let i = 0; i < SEED_IMAGE_IDS.length; i++) {
      const id = SEED_IMAGE_IDS[i]
      const existing = await loadMediaBlob(id)
      if (!existing) await generateImage(id, GRADIENTS[i % GRADIENTS.length])
    }
    for (let i = 0; i < SEED_VIDEO_IDS.length; i++) {
      const id = SEED_VIDEO_IDS[i]
      const existing = await loadMediaBlob(id)
      if (!existing) await generateVideo(id, GRADIENTS[(i + 2) % GRADIENTS.length])
    }
  })()
}
