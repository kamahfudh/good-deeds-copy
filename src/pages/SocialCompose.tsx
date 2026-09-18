import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, BookOpen, Globe, Image, LockSimple, MapPin, Microphone, VideoCamera, X } from "@phosphor-icons/react"
import clsx from "clsx"
import { useSocial, type DeedShareAttachment } from "../lib/socialStore"
import { DeedShareBadge, LocationPill, QuranVerseBadge, SocialAvatar } from "../components/SocialPostCard"
import { AudioAttachmentPlayer } from "../components/AudioAttachmentPlayer"
import { QuranPickerSheet } from "../components/QuranPickerSheet"
import { YOU, type SocialVisibility } from "../lib/social"
import {
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  readAudioDuration,
  saveMedia,
} from "../lib/mediaStore"
import { getAccountVisibility } from "../lib/privacy"
import type { QuranAttachment } from "../lib/quran"

function draftTextFor(deed: DeedShareAttachment) {
  return `Alhamdulillah — just completed ${deed.deedTitle}.`
}

// A dedicated screen (not a popup) for composing a post — reached via the
// always-on "+" button on the Social feed, or directly from a deed-share /
// profile mention, both of which hand it a prefilled draft via router state.
export function SocialCompose() {
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const { createPost } = useSocial()

  const routerState = routerLocation.state as
    | { deedDraft?: DeedShareAttachment; mentionDraft?: string }
    | null
  const [attachedDeed, setAttachedDeed] = useState<DeedShareAttachment | null>(
    () => routerState?.deedDraft ?? null,
  )
  const [draft, setDraft] = useState(() => {
    if (routerState?.deedDraft) return draftTextFor(routerState.deedDraft)
    if (routerState?.mentionDraft) return routerState.mentionDraft
    return ""
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [audioSeconds, setAudioSeconds] = useState<number | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const [quranAttachment, setQuranAttachment] = useState<QuranAttachment | null>(null)
  const [quranPickerOpen, setQuranPickerOpen] = useState(false)

  const [showLocationInput, setShowLocationInput] = useState(false)
  const [locationDraft, setLocationDraft] = useState("")
  const [location, setLocation] = useState<string | null>(null)

  // A private account defaults new posts to private too — still overridable
  // per-post below, matching how a private account's own posts behave.
  const [visibility, setVisibility] = useState<SocialVisibility>(() => getAccountVisibility())

  const [posting, setPosting] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const draftTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    draftTextareaRef.current?.focus()
  }, [])

  // Auto-grow the textarea to fit its content instead of a fixed row count,
  // so the composer never shows dead empty space or clips a long draft. Also
  // recalculates on width changes (viewport resize, orientation change) since
  // reflowed text needs a different height even though `draft` didn't change.
  useEffect(() => {
    const el = draftTextareaRef.current
    if (!el) return
    const resize = () => {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [draft])

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

  function clearAudio() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    setAudioFile(null)
    setAudioPreviewUrl(null)
    setAudioSeconds(null)
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

  async function handlePost() {
    const text = draft.trim()
    if (!text && !videoFile && !imageFile && !audioFile && !quranAttachment) return
    setPosting(true)
    try {
      let videoId: string | undefined
      let imageId: string | undefined
      let audioId: string | undefined
      if (videoFile) {
        videoId = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await saveMedia(videoId, videoFile)
      }
      if (imageFile) {
        imageId = `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await saveMedia(imageId, imageFile)
      }
      if (audioFile) {
        audioId = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await saveMedia(audioId, audioFile)
      }
      const id = createPost({
        text: text || " ",
        deed: attachedDeed ?? undefined,
        videoId,
        imageId,
        audioId,
        audioSeconds: audioSeconds ?? undefined,
        quranAttachment: quranAttachment ?? undefined,
        location: location ?? undefined,
        visibility,
      })
      navigate(`/social/${id}`)
    } finally {
      setPosting(false)
    }
  }

  const canPost =
    (draft.trim().length > 0 || videoFile !== null || imageFile !== null || audioFile !== null || quranAttachment !== null) &&
    !posting

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-2xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">New post</p>
        <button
          type="button"
          disabled={!canPost}
          onClick={handlePost}
          className={clsx(
            "tap-scale rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            canPost ? "bg-ink text-canvas hover:bg-ink/90" : "cursor-not-allowed text-ink-faint",
          )}
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </div>

      <div className="mb-5 hidden items-center justify-between lg:flex">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap-scale inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          disabled={!canPost}
          onClick={handlePost}
          className={clsx(
            "tap-scale rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            canPost
              ? "bg-ink text-canvas shadow-sm hover:bg-ink/90"
              : "cursor-not-allowed bg-surface-raised text-ink-faint",
          )}
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-surface p-5 transition-colors focus-within:border-border-strong sm:p-6 lg:mt-0">
        <div className="flex items-start gap-3">
          <SocialAvatar author={YOU} size="lg" />
          <div className="min-w-0 flex-1 pt-1">
            {attachedDeed && (
              <div className="mb-3 flex items-start justify-between gap-2 rounded-2xl border border-border bg-surface-raised p-3">
                <DeedShareBadge
                  deedTitle={attachedDeed.deedTitle}
                  deedPoints={attachedDeed.points}
                  deedStreak={attachedDeed.streak}
                />
                <button
                  type="button"
                  onClick={() => setAttachedDeed(null)}
                  aria-label="Remove attached deed"
                  className="tap-scale flex size-6 shrink-0 items-center justify-center rounded-full text-ink-faint hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            <textarea
              ref={draftTextareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's new?"
              rows={2}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-ink-faint/70 focus:outline-none"
            />

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

            {audioPreviewUrl && (
              <div className="relative mt-3">
                <AudioAttachmentPlayer src={audioPreviewUrl} durationSeconds={audioSeconds ?? undefined} />
                <button
                  type="button"
                  onClick={clearAudio}
                  aria-label="Remove audio"
                  className="tap-scale absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-canvas/80 text-ink-faint backdrop-blur-md hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {quranAttachment && (
              <div className="mt-3 flex items-center gap-2">
                <QuranVerseBadge
                  surahName={quranAttachment.surahName}
                  fromAyah={quranAttachment.fromAyah}
                  toAyah={quranAttachment.toAyah}
                />
                <button
                  type="button"
                  onClick={() => setQuranAttachment(null)}
                  aria-label="Remove Qur'an attachment"
                  className="tap-scale flex size-6 items-center justify-center rounded-full text-ink-faint hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {mediaError && <p className="mt-2 text-xs font-medium text-rose">{mediaError}</p>}

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
                <MapPin className="size-4 shrink-0 text-brand" />
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
                  className="tap-scale text-sm font-semibold text-brand disabled:text-ink-faint"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-canvas p-1">
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelected} className="hidden" />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              aria-label="Attach video"
              className="tap-scale flex size-9 items-center justify-center rounded-full text-brand hover:bg-brand-soft"
            >
              <VideoCamera weight="bold" className="size-[19px]" />
            </button>

            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              aria-label="Attach image"
              className="tap-scale flex size-9 items-center justify-center rounded-full text-brand hover:bg-brand-soft"
            >
              <Image weight="bold" className="size-[19px]" />
            </button>

            <button
              type="button"
              onClick={() => setShowLocationInput((v) => !v)}
              aria-label="Add location"
              className="tap-scale flex size-9 items-center justify-center rounded-full text-brand hover:bg-brand-soft"
            >
              <MapPin weight="bold" className="size-[19px]" />
            </button>

            <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioSelected} className="hidden" />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              aria-label={`Attach audio, up to ${MAX_AUDIO_SECONDS} seconds`}
              className="tap-scale flex size-9 items-center justify-center rounded-full text-brand hover:bg-brand-soft"
            >
              <Microphone weight="bold" className="size-[19px]" />
            </button>

            <button
              type="button"
              onClick={() => setQuranPickerOpen(true)}
              aria-label="Attach Qur'an verses"
              className="tap-scale flex size-9 items-center justify-center rounded-full text-emerald hover:bg-emerald-soft"
            >
              <BookOpen weight="bold" className="size-[19px]" />
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

        {visibility === "private" && (
          <p className="mt-2.5 text-right text-xs text-ink-faint">
            Only visible to you — private posts don't appear in the feed or search.
          </p>
        )}
      </div>

      <QuranPickerSheet
        open={quranPickerOpen}
        onAttach={setQuranAttachment}
        onClose={() => setQuranPickerOpen(false)}
      />
    </div>
  )
}
