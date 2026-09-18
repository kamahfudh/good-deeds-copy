import { useState, type FormEvent, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  At,
  CaretDown,
  CaretRight,
  Envelope,
  GenderFemale,
  GenderMale,
  Globe,
  IdentificationCard,
  MapPin,
  Phone,
  User,
  WarningCircle,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { COUNTRIES, type Country } from "../lib/countries"
import { getProfile, saveProfile, type Gender, type ProfileRecord } from "../lib/profile"
import { CountryPickerSheet } from "../components/CountryPickerSheet"
import { useToast } from "../lib/toastStore"

const GENDER_OPTIONS: { value: Gender; label: string; icon: typeof GenderFemale }[] = [
  { value: "female", label: "Female", icon: GenderFemale },
  { value: "male", label: "Male", icon: GenderMale },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code)
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">{children}</label>
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose">
      <WarningCircle weight="fill" className="size-3.5 shrink-0" />
      {message}
    </p>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  prefix,
  error,
  autoFocus,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  icon?: typeof User
  prefix?: string
  error?: string
  autoFocus?: boolean
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className={clsx(
          "flex items-center gap-2 rounded-xl border bg-canvas px-3.5 py-3 transition-colors focus-within:border-brand",
          error ? "border-rose/60" : "border-border-strong",
        )}
      >
        {Icon && <Icon className="size-4 shrink-0 text-ink-faint" />}
        {prefix && <span className="shrink-0 text-sm font-semibold text-ink-faint">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}

function FieldButton({
  label,
  value,
  placeholder,
  icon: Icon,
  onClick,
}: {
  label: string
  value?: string
  placeholder: string
  icon: typeof User
  onClick: () => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        onClick={onClick}
        className="tap-scale flex w-full items-center gap-2 rounded-xl border border-border-strong bg-canvas px-3.5 py-3 text-left hover:border-border"
      >
        <Icon className="size-4 shrink-0 text-ink-faint" />
        <span className={clsx("min-w-0 flex-1 truncate text-sm", value ? "text-ink" : "text-ink-faint")}>
          {value || placeholder}
        </span>
        <CaretRight className="size-4 shrink-0 text-ink-faint" />
      </button>
    </div>
  )
}

type PickerTarget = "nationality" | "country" | "phoneCode" | null

export function PersonalInfo() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const focusUsername = Boolean((location.state as { focusUsername?: boolean } | null)?.focusUsername)

  const [profile, setProfile] = useState<ProfileRecord>(() => getProfile())
  const [touched, setTouched] = useState(false)
  const [picker, setPicker] = useState<PickerTarget>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof ProfileRecord>(key: K, value: ProfileRecord[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  const fullNameError = touched && profile.fullName.trim().length === 0 ? "Full name is required." : undefined
  const emailError = touched && profile.email.trim().length > 0 && !EMAIL_PATTERN.test(profile.email.trim()) ? "Enter a valid email address." : undefined
  const usernameError =
    touched && profile.username.trim().length > 0 && !USERNAME_PATTERN.test(profile.username.trim())
      ? "3 to 20 characters: lowercase letters, numbers, and underscores."
      : undefined

  const canSubmit =
    profile.fullName.trim().length > 0 &&
    (profile.email.trim().length === 0 || EMAIL_PATTERN.test(profile.email.trim())) &&
    (profile.username.trim().length === 0 || USERNAME_PATTERN.test(profile.username.trim())) &&
    !saving

  const phoneCountry = findCountry(profile.phoneCountryCode)
  const nationalityCountry = findCountry(profile.nationalityCode)
  const residenceCountry = findCountry(profile.countryCode)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return

    setSaving(true)
    saveProfile({
      ...profile,
      fullName: profile.fullName.trim(),
      email: profile.email.trim(),
      username: profile.username.trim().toLowerCase(),
      phoneNumber: profile.phoneNumber.trim(),
    })
    window.setTimeout(() => {
      showToast("Personal info updated.")
      navigate(-1)
    }, 350)
  }

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
        <p className="text-[17px] font-bold text-ink">Personal Info</p>
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
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <IdentificationCard weight="fill" className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-ink">Tell us about yourself</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-faint">
          This stays on your device and is only used to personalize your experience, nothing more.
        </p>
      </div>

      {focusUsername && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3">
          <At weight="bold" className="mt-0.5 size-4 shrink-0 text-brand" />
          <p className="text-xs leading-relaxed text-brand">
            Pick a username before using Social, so people can find and mention you.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <TextField
          id="full-name"
          label="Full name"
          value={profile.fullName}
          onChange={(v) => update("fullName", v)}
          placeholder="e.g. Ahmad Rahman"
          icon={User}
          error={fullNameError}
        />

        <TextField
          id="email"
          label="Email address"
          value={profile.email}
          onChange={(v) => update("email", v)}
          placeholder="you@example.com"
          type="email"
          icon={Envelope}
          error={emailError}
        />

        <TextField
          id="username"
          label="Username"
          value={profile.username}
          onChange={(v) => update("username", v.toLowerCase())}
          placeholder="ahmadrahman"
          icon={At}
          error={usernameError}
          autoFocus={focusUsername}
        />

        <div>
          <FieldLabel>Gender</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt) => {
              const active = profile.gender === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("gender", opt.value)}
                  aria-pressed={active}
                  className={clsx(
                    "tap-scale flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-xl border px-2 text-center text-xs font-semibold leading-tight transition-colors sm:text-sm",
                    active
                      ? "border-brand/40 bg-brand-soft text-brand"
                      : "border-border-strong bg-canvas text-ink-faint hover:text-ink",
                  )}
                >
                  <Icon weight="bold" className="size-4 shrink-0" />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Phone number</FieldLabel>
          <div className="flex items-stretch overflow-hidden rounded-xl border border-border-strong bg-canvas transition-colors focus-within:border-brand">
            <button
              type="button"
              onClick={() => setPicker("phoneCode")}
              className="tap-scale flex shrink-0 items-center gap-1.5 border-r border-border-strong px-3 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              {phoneCountry ? (
                <>
                  <span className="text-base leading-none">{phoneCountry.flag}</span>
                  <span>{phoneCountry.dial}</span>
                </>
              ) : (
                <>
                  <Phone className="size-4 text-ink-faint" />
                  <span className="text-ink-faint">Code</span>
                </>
              )}
              <CaretDown className="size-3 text-ink-faint" />
            </button>
            <input
              value={profile.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
              placeholder="812 3456 7890"
              inputMode="tel"
              className="w-full min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>

        <FieldButton
          label="Nationality"
          value={nationalityCountry ? `${nationalityCountry.flag} ${nationalityCountry.name}` : undefined}
          placeholder="Select nationality"
          icon={Globe}
          onClick={() => setPicker("nationality")}
        />

        <FieldButton
          label="Country"
          value={residenceCountry ? `${residenceCountry.flag} ${residenceCountry.name}` : undefined}
          placeholder="Select country of residence"
          icon={MapPin}
          onClick={() => setPicker("country")}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className={clsx(
            "tap-scale mt-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors",
            canSubmit ? "bg-ink text-canvas hover:bg-ink/90" : "cursor-not-allowed bg-surface-raised text-ink-faint",
          )}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      <CountryPickerSheet
        open={picker === "nationality"}
        title="Select nationality"
        selectedCode={profile.nationalityCode}
        onSelect={(c) => update("nationalityCode", c.code)}
        onClose={() => setPicker(null)}
      />
      <CountryPickerSheet
        open={picker === "country"}
        title="Select country"
        selectedCode={profile.countryCode}
        onSelect={(c) => update("countryCode", c.code)}
        onClose={() => setPicker(null)}
      />
      <CountryPickerSheet
        open={picker === "phoneCode"}
        title="Select country code"
        selectedCode={profile.phoneCountryCode}
        onSelect={(c) => update("phoneCountryCode", c.code)}
        onClose={() => setPicker(null)}
      />
    </div>
  )
}
