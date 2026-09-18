import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  FacebookLogo,
  Globe,
  InstagramLogo,
  MoonStars,
  SealCheck,
  ThreadsLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
  type IconProps,
} from "@phosphor-icons/react"
import type { ComponentType } from "react"

function SocialIcon({ icon: Icon }: { icon: ComponentType<IconProps> }) {
  return (
    <span className="tap-scale flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand hover:bg-brand-soft/80">
      <Icon weight="fill" className="size-4" />
    </span>
  )
}

function IdentityCard({
  avatar,
  name,
  subtitle,
  icons,
}: {
  avatar: React.ReactNode
  name: string
  subtitle: string
  icons: ComponentType<IconProps>[]
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-ink">{name}</p>
            <SealCheck weight="fill" className="size-4 shrink-0 text-brand" />
          </div>
          <p className="text-xs text-ink-faint">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        {icons.map((Icon, i) => (
          <SocialIcon key={i} icon={Icon} />
        ))}
      </div>
    </div>
  )
}

export function About() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:max-w-xl lg:px-10 lg:pt-12">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-scale flex size-10 items-center justify-center rounded-full bg-surface text-ink hover:bg-surface-raised"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <p className="text-[17px] font-bold text-ink">About</p>
        <span className="inline-flex w-10" />
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="tap-scale mb-5 hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink lg:inline-flex"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-6 flex flex-col items-center text-center lg:mt-0 lg:items-start lg:text-left">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-4 -z-10 animate-pulse rounded-full bg-brand/20 blur-2xl [animation-duration:4s]"
          />
          <span className="flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand shadow-card">
            <MoonStars weight="fill" className="size-8" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-extrabold lowercase tracking-tight text-ink">
          alafasy<span className="text-brand">.</span>
        </p>
        <span className="mt-2 inline-flex items-center rounded-full border border-border-strong bg-surface-raised px-2.5 py-1 text-xs font-semibold text-ink-faint">
          Version 2.0.0 (200)
        </span>
      </div>

      <div className="mt-7 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-muted">
        <p>
          Alafasy App is your all-in-one Islamic companion designed to support your daily spiritual practice with
          ease and purpose. Whether you're tracking your prayers, checking prayer times, or finding the Qiblah
          direction, the app helps you stay connected to your faith any time, anywhere.
        </p>
        <p>
          Our goal is to make it easier for Muslims to stay connected to their faith in every moment of life. With
          features like prayer tracking, Qur'an reading, dzikir, nasheeds, and hadith reflection, Alafasy App is here
          to encourage daily worship, deepen understanding, and bring peace and purpose to your spiritual journey
          anytime and anywhere.
        </p>
        <p>
          Inside the app, you'll find a collection of features designed to support your spiritual growth and daily
          worship. Whether it's guiding your prayers, helping you reflect, or bringing peace through uplifting
          content, the app is here to make your faith more present, consistent, and meaningful every day.
        </p>
      </div>

      <p className="mt-6 text-center text-base font-semibold italic text-brand">
        "Thank you for making Alafasy part of your journey."
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <IdentityCard
          avatar={
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <MoonStars weight="fill" className="size-5" />
            </span>
          }
          name="Alafasy Official App"
          subtitle="Official account"
          icons={[XLogo, FacebookLogo, InstagramLogo, YoutubeLogo, ThreadsLogo, Globe]}
        />

        <IdentityCard
          avatar={
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-raised text-sm font-bold text-ink">
              MA
            </span>
          }
          name="Mishary Rashid Al-Alafasy"
          subtitle="Reciter & founder"
          icons={[XLogo, FacebookLogo, InstagramLogo, YoutubeLogo, TiktokLogo, ThreadsLogo]}
        />
      </div>
    </div>
  )
}
