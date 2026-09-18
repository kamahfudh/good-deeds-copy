import { useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, Eye, EyeSlash, Info, ShieldCheck, WarningCircle } from "@phosphor-icons/react"
import clsx from "clsx"
import { DEFAULT_PASSWORD, setPassword, verifyCurrentPassword } from "../lib/security"
import { useToast } from "../lib/toastStore"

interface Requirement {
  label: string
  test: (pw: string) => boolean
}

const REQUIREMENTS: Requirement[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
]

function passwordStrength(pw: string): { label: string; tone: "rose" | "amber" | "emerald"; score: number } {
  const passed = REQUIREMENTS.filter((r) => r.test(pw)).length
  if (pw.length === 0) return { label: "", tone: "rose", score: 0 }
  if (passed <= 1) return { label: "Weak", tone: "rose", score: 1 }
  if (passed === 2) return { label: "Fair", tone: "amber", score: 2 }
  return { label: "Strong", tone: "emerald", score: 3 }
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </label>
      <div
        className={clsx(
          "flex items-center gap-2 rounded-xl border bg-canvas px-3.5 py-3 transition-colors focus-within:border-brand",
          error ? "border-rose/60" : "border-border-strong",
        )}
      >
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="tap-scale shrink-0 text-ink-faint hover:text-ink"
        >
          {visible ? <EyeSlash className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose">
          <WarningCircle weight="fill" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export function ChangePassword() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [currentError, setCurrentError] = useState<string | undefined>()
  const [touchedConfirm, setTouchedConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => passwordStrength(next), [next])
  const requirementsMet = REQUIREMENTS.every((r) => r.test(next))
  const confirmError = touchedConfirm && confirm.length > 0 && confirm !== next ? "Passwords don't match." : undefined
  const isSameAsCurrent = current.length > 0 && next.length > 0 && current === next

  const canSubmit =
    current.length > 0 && requirementsMet && confirm.length > 0 && confirm === next && !isSameAsCurrent && !submitting

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || submitting) return

    if (!verifyCurrentPassword(current)) {
      setCurrentError("That's not your current password.")
      return
    }

    setSubmitting(true)
    setPassword(next)
    window.setTimeout(() => {
      showToast("Password updated.")
      navigate(-1)
    }, 450)
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
        <p className="text-[17px] font-bold text-ink">Change Password</p>
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
          <ShieldCheck weight="fill" className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-ink">Update your password</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-faint">
          Choose a strong password to keep your account secure. It's stored only on this device.
        </p>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3">
        <Info weight="fill" className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="text-xs leading-relaxed text-brand">
          First time here? Your device's starter password is{" "}
          <span className="rounded bg-brand/15 px-1 py-0.5 font-mono font-semibold">{DEFAULT_PASSWORD}</span>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <PasswordField
          id="current-password"
          label="Current password"
          value={current}
          onChange={(v) => {
            setCurrent(v)
            if (currentError) setCurrentError(undefined)
          }}
          error={currentError}
          autoComplete="current-password"
        />

        <div>
          <PasswordField
            id="new-password"
            label="New password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            error={isSameAsCurrent ? "New password must be different from your current one." : undefined}
          />

          {next.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={clsx(
                      "h-full flex-1 rounded-full transition-colors",
                      i < strength.score
                        ? strength.tone === "rose"
                          ? "bg-rose"
                          : strength.tone === "amber"
                            ? "bg-amber"
                            : "bg-emerald"
                        : "bg-surface-raised",
                    )}
                  />
                ))}
              </div>
              <span
                className={clsx(
                  "shrink-0 text-xs font-semibold",
                  strength.tone === "rose" && "text-rose",
                  strength.tone === "amber" && "text-amber",
                  strength.tone === "emerald" && "text-emerald",
                )}
              >
                {strength.label}
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-1.5">
            {REQUIREMENTS.map((req) => {
              const met = req.test(next)
              return (
                <span
                  key={req.label}
                  className={clsx(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    met ? "text-emerald" : "text-ink-faint",
                  )}
                >
                  <CheckCircle weight={met ? "fill" : "regular"} className="size-3.5 shrink-0" />
                  {req.label}
                </span>
              )
            })}
          </div>
        </div>

        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v)
            setTouchedConfirm(true)
          }}
          error={confirmError}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className={clsx(
            "tap-scale mt-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors",
            canSubmit ? "bg-ink text-canvas hover:bg-ink/90" : "cursor-not-allowed bg-surface-raised text-ink-faint",
          )}
        >
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  )
}
