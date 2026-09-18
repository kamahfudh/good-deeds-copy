import { useState, type ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { CaretDown, Globe, Image, Info, LockSimple, MapPin, Microphone, VideoCamera, X } from "@phosphor-icons/react"
import clsx from "clsx"
import { useSocial } from "../lib/socialStore"
import { LocationPill, SocialAvatar } from "../components/SocialPostCard"
import { AudioAttachmentPlayer } from "../components/AudioAttachmentPlayer"
import { SurahListSheet } from "../components/SurahListSheet"
import { VersePickerSheet } from "../components/VersePickerSheet"
import { YOU, type SocialVisibility } from "../lib/social"
import { getProfile } from "../lib/profile"
import { getAccountVisibility } from "../lib/privacy"
import { SURAHS, type Surah } from "../lib/quran"
import { getAyahText } from "../lib/ayahText"
import {
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  readAudioDuration,
  saveMedia,
} from "../lib/mediaStore"

const MAX_CHARS = 300

export function TadabburCompose() {
  const navigate = useNavigate()
  const { createPost } = useSocial()
  const profile = getProfile()
  const displayName = profile.fullName || YOU.name

  const [surah, setSurah] = useState<Surah>(SURAHS[72]) // Al-Muzzammil, matching the reference default
  const [verse, setVerse] = useState(2)
  const [surahSheetOpen, setSurahSheetOpen] = useState(false)
  const [verseSheetOpen, setVerseSheetOpen] = useState(false)

  const [draft, setDraft] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [audioSeconds, setAudioSeconds] = useState<number | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  const [showLocationInput, setShowLocationInput] = useState(false)
  const [locationDraft, setLocationDraft] = useState("")
  const [location, setLocation] = useState<string | null>(null)

  // A private account defaults new posts to private too — still overridable
  // per-post below, matching the general composer's behavior.
  const [visibility, setVisibility] = useState<SocialVisibility>(() => getAccountVisibility())

  const ayahText = getAyahText(surah.number, verse)

  function chooseSurah(s: Surah) {
    setSurah(s)
    setVerse(1)
    setSurahSheetOpen(false)
  }

  function clearAudio() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    setAudioFile(null)
    setAudioPreviewUrl(null)
    setAudioSeconds(null)
  }

  function clearVideo() {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl(null)
  }

  function clearImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl(null)
  }

  function handleVideoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_VIDEO_BYTES) {
      setMediaError("Video is too large — max 25MB.")
      return
    }
    setMediaError(null)
    clearImage()
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }

  function handleImageSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setMediaError("Image is too large — max 8MB.")
      return
    }
    setMediaError(null)
    clearVideo()
    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  function handleSaveLocation() {
    const value = locationDraft.trim()
    if (!value) return
    setLocation(value)
    setLocationDraft("")
    setShowLocationInput(false)
  }

  async function handleAudioSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_AUDIO_BYTES) {
      setMediaError("Audio is too large — max 8MB.")
      return
    }
    let seconds: number
    try {
      seconds = await readAudioDuration(file)
    } catch {
      setMediaError("Couldn't read that audio file.")
      return
    }
    if (seconds > MAX_AUDIO_SECONDS) {
      setMediaError(`Audio is too long — max ${MAX_AUDIO_SECONDS}s.`)
      return
    }
    setMediaError(null)
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    setAudioFile(file)
    setAudioPreviewUrl(URL.createObjectURL(file))
    setAudioSeconds(seconds)
  }

  const canShare =
    (draft.trim().length > 0 || audioFile !== null || videoFile !== null || imageFile !== null) && !posting

  async function handleShare() {
    if (!canShare) return
    setPosting(true)
    try {
      let audioId: string | undefined
      let videoId: string | undefined
      let imageId: string | undefined
      if (audioFile) {
        audioId = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await saveMedia(audioId, audioFile)
      }
      if (videoFile) {
        videoId = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await saveMedia(videoId, videoFile)
      }
      if (imageFile) {
        imageId = `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await saveMedia(imageId, imageFile)
      }
      const id = createPost({
        text: draft.trim() || " ",
        audioId,
        audioSeconds: audioSeconds ?? undefined,
        videoId,
        imageId,
        location: location ?? undefined,
        visibility,
        quranAttachment: {
          surahNumber: surah.number,
          surahName: surah.nameTransliteration,
          fromAyah: verse,
          toAyah: verse,
        },
      })
      navigate(`/social/${id}`)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap-scale rounded-full border border-border-strong bg-surface-raised px-4 py-2 text-sm font-semibold text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <p className="text-[17px] font-bold text-ink">New tadabbur</p>
        <button
          type="button"
          disabled={!canShare}
          onClick={handleShare}
          className={clsx(
            "tap-scale rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            canShare ? "bg-cyan text-[#0D0D12] hover:bg-cyan/90" : "cursor-not-allowed bg-surface-raised text-ink-faint",
          )}
        >
          {posting ? "Sharing…" : "Share"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSurahSheetOpen(true)}
          className="tap-scale flex items-center gap-1.5 rounded-full border border-cyan/25 bg-cyan-soft px-3.5 py-2 text-sm font-semibold text-cyan hover:bg-cyan-soft/80"
        >
          {surah.nameTransliteration} · {surah.number}
          <CaretDown weight="bold" className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setVerseSheetOpen(true)}
          className="tap-scale flex items-center gap-1.5 rounded-full border border-cyan/25 bg-cyan-soft px-3.5 py-2 text-sm font-semibold text-cyan hover:bg-cyan-soft/80"
        >
          Verse {verse}
          <CaretDown weight="bold" className="size-3.5" />
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-cyan/25 bg-cyan-soft/40 p-4">
        {ayahText ? (
          <>
            <p dir="rtl" className="text-right text-xl leading-loose text-ink">
              {ayahText.arabic}
            </p>
            <p className="mt-2 text-sm text-ink-faint">{ayahText.translation}</p>
          </>
        ) : (
          <p className="flex items-start gap-2 text-sm text-ink-faint">
            <Info weight="fill" className="mt-0.5 size-4 shrink-0 text-cyan" />
            No text preview available for {surah.nameTransliteration}, verse {verse} yet — your tadabbur will still
            reference it correctly.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-start gap-3">
        <SocialAvatar author={YOU} size="md" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-ink">
            {displayName} <span className="font-normal text-ink-faint">{YOU.handle}</span>
          </p>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
            placeholder="What did this verse open up for you?"
            rows={3}
            maxLength={MAX_CHARS}
            className="mt-1 w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-ink-faint/70 focus:outline-none"
          />
        </div>
      </div>

      {videoPreviewUrl && (
        <div className="relative mt-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={videoPreviewUrl}
            controls
            playsInline
            className="max-h-[320px] w-full rounded-2xl border border-border bg-black"
          />
          <button
            type="button"
            onClick={clearVideo}
            aria-label="Remove video"
            className="tap-scale absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {imagePreviewUrl && (
        <div className="relative mt-3">
          <img
            src={imagePreviewUrl}
            alt=""
            className="max-h-[320px] w-full rounded-2xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            aria-label="Remove image"
            className="tap-scale absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {location && (
        <div className="mt-3 flex items-center gap-2">
          <LocationPill location={location} />
          <button
            type="button"
            onClick={() => setLocation(null)}
            aria-label="Remove location"
            className="tap-scale flex size-6 items-center justify-center rounded-full text-ink-faint hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {showLocationInput && (
        <div className="mt-3 flex items-center gap-2 rounded-full border border-border-strong bg-canvas px-4 py-2.5">
          <MapPin className="size-4 shrink-0 text-cyan" />
          <input
            autoFocus
            value={locationDraft}
            onChange={(e) => setLocationDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveLocation()
              if (e.key === "Escape") setShowLocationInput(false)
            }}
            placeholder="Add a location, e.g. Masjid al-Haram"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveLocation}
            disabled={locationDraft.trim().length === 0}
            className="tap-scale text-sm font-semibold text-cyan disabled:text-ink-faint"
          >
            Add
          </button>
        </div>
      )}

      {audioPreviewUrl ? (
        <div className="relative mt-3">
          <AudioAttachmentPlayer src={audioPreviewUrl} durationSeconds={audioSeconds ?? undefined} />
          <button
            type="button"
            onClick={clearAudio}
            aria-label="Remove voice reflection"
            className="tap-scale absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-canvas/80 text-ink-faint backdrop-blur-md hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <input type="file" accept="audio/*" onChange={handleAudioSelected} className="hidden" id="tadabbur-audio-input" />
          <button
            type="button"
            onClick={() => document.getElementById("tadabbur-audio-input")?.click()}
            className="tap-scale flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan-soft px-4 py-2.5 text-sm font-semibold text-cyan hover:bg-cyan-soft/80"
          >
            <Microphone weight="fill" className="size-4" />
            Add a voice reflection
          </button>
        </div>
      )}

      {mediaError && <p className="mt-2 text-xs font-medium text-rose">{mediaError}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-canvas p-1">
          <input type="file" accept="video/*" onChange={handleVideoSelected} className="hidden" id="tadabbur-video-input" />
          <button
            type="button"
            onClick={() => document.getElementById("tadabbur-video-input")?.click()}
            aria-label="Attach video"
            className="tap-scale flex size-9 items-center justify-center rounded-full text-cyan hover:bg-cyan-soft"
          >
            <VideoCamera weight="bold" className="size-[19px]" />
          </button>

          <input type="file" accept="image/*" onChange={handleImageSelected} className="hidden" id="tadabbur-image-input" />
          <button
            type="button"
            onClick={() => document.getElementById("tadabbur-image-input")?.click()}
            aria-label="Attach image"
            className="tap-scale flex size-9 items-center justify-center rounded-full text-cyan hover:bg-cyan-soft"
          >
            <Image weight="bold" className="size-[19px]" />
          </button>

          <button
            type="button"
            onClick={() => setShowLocationInput((v) => !v)}
            aria-label="Add location"
            className="tap-scale flex size-9 items-center justify-center rounded-full text-cyan hover:bg-cyan-soft"
          >
            <MapPin weight="bold" className="size-[19px]" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-canvas p-1">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            aria-pressed={visibility === "public"}
            className={clsx(
              "tap-scale flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              visibility === "public" ? "bg-ink text-canvas" : "text-ink-faint hover:text-ink",
            )}
          >
            <Globe weight="bold" className="size-3.5" />
            Public
          </button>
          <button
            type="button"
            onClick={() => setVisibility("private")}
            aria-pressed={visibility === "private"}
            className={clsx(
              "tap-scale flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              visibility === "private" ? "bg-ink text-canvas" : "text-ink-faint hover:text-ink",
            )}
          >
            <LockSimple weight="bold" className="size-3.5" />
            Private
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-end">
        <span className="text-xs text-ink-faint">{MAX_CHARS - draft.length} characters left</span>
      </div>

      <p className="mt-5 text-xs text-ink-faint">
        {visibility === "private"
          ? "Only visible to you — private posts don't appear in the feed or search."
          : "Shared with everyone on Social."}{" "}
        You can delete it anytime from the post menu.
      </p>

      <SurahListSheet open={surahSheetOpen} onSelect={chooseSurah} onClose={() => setSurahSheetOpen(false)} />
      <VersePickerSheet
        open={verseSheetOpen}
        surahName={surah.nameTransliteration}
        verseCount={surah.verseCount}
        selectedVerse={verse}
        onSelect={setVerse}
        onClose={() => setVerseSheetOpen(false)}
      />
    </div>
  )
}
