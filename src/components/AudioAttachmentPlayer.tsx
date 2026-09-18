import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "@phosphor-icons/react"

// A fixed, deterministic bar pattern (not real waveform analysis — this is a
// decorative voice-note look, same spirit as messaging apps) so it doesn't
// reshuffle on every render.
const BAR_HEIGHTS = [40, 65, 30, 80, 50, 90, 35, 60, 45, 75, 55, 85, 40, 70, 30, 95, 50, 65, 35, 80, 45, 60, 30, 55]

function formatSeconds(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  return `0:${s.toString().padStart(2, "0")}`
}

export function AudioAttachmentPlayer({
  src,
  durationSeconds,
  className,
}: {
  src: string
  durationSeconds?: number
  className?: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => {
      if (el.duration) setProgress(el.currentTime / el.duration)
    }
    const onLoaded = () => setDuration(el.duration)
    const onEnded = () => {
      setPlaying(false)
      setProgress(0)
    }
    el.addEventListener("timeupdate", onTime)
    el.addEventListener("loadedmetadata", onLoaded)
    el.addEventListener("ended", onEnded)
    return () => {
      el.removeEventListener("timeupdate", onTime)
      el.removeEventListener("loadedmetadata", onLoaded)
      el.removeEventListener("ended", onEnded)
    }
  }, [])

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
      setPlaying(true)
    }
  }

  const playedBars = Math.round(progress * BAR_HEIGHTS.length)
  const remaining = Math.max(0, duration - duration * progress)

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3 ${className ?? ""}`}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="tap-scale flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald text-white hover:bg-emerald/90"
      >
        {playing ? <Pause weight="fill" className="size-4" /> : <Play weight="fill" className="ml-0.5 size-4" />}
      </button>

      <div className="flex h-8 flex-1 items-center gap-[3px]">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className={`w-full min-w-[2px] rounded-full transition-colors ${i < playedBars ? "bg-emerald" : "bg-ink-faint/25"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <span className="shrink-0 text-xs font-medium tabular-nums text-ink-faint">
        {formatSeconds(playing || progress > 0 ? remaining : duration)}
      </span>
    </div>
  )
}
