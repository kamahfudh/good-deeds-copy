import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Globe, LockKey, ShieldWarning, Trash, WarningCircle } from "@phosphor-icons/react"
import clsx from "clsx"
import { getAccountVisibility, setAccountVisibility, deleteAllLocalData, type AccountVisibility } from "../lib/privacy"
import { useToast } from "../lib/toastStore"

const DELETE_CONFIRM_WORD = "DELETE"

function VisibilityCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof Globe
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "tap-scale flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        active ? "border-brand/40 bg-brand-soft" : "border-border-strong bg-canvas hover:border-border",
      )}
    >
      <span
        className={clsx(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          active ? "bg-brand text-white" : "bg-surface-raised text-ink-faint",
        )}
      >
        <Icon weight="fill" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <p className={clsx("text-sm font-bold", active ? "text-brand" : "text-ink")}>{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{description}</p>
      </span>
      <span
        className={clsx(
          "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          active ? "border-brand bg-brand" : "border-border-strong",
        )}
      >
        {active && <Check weight="bold" className="size-3 text-white" />}
      </span>
    </button>
  )
}

export function PrivacySettings() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [visibility, setVisibilityState] = useState<AccountVisibility>(() => getAccountVisibility())
  const [confirmPrivate, setConfirmPrivate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  function applyVisibility(next: AccountVisibility) {
    setVisibilityState(next)
    setAccountVisibility(next)
    showToast(next === "private" ? "Your account is now private." : "Your account is now public.")
  }

  function chooseVisibility(next: AccountVisibility) {
    if (next === "private" && visibility !== "private") {
      setConfirmPrivate(true)
      return
    }
    applyVisibility(next)
  }

  function handleDelete() {
    if (confirmText.trim() !== DELETE_CONFIRM_WORD || deleting) return
    setDeleting(true)
    deleteAllLocalData()
    window.setTimeout(() => {
      window.location.href = "/"
    }, 400)
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
        <p className="text-[17px] font-bold text-ink">Privacy Settings</p>
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
          <LockKey weight="fill" className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-ink">Control your privacy</h1>
        <p className="mt-1 max-w-sm text-sm text-ink-faint">Decide who can see your Social activity, or start over completely.</p>
      </div>

      <section className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Social Visibility</h2>
        <div className="mt-2 flex flex-col gap-2.5">
          <VisibilityCard
            active={visibility === "public"}
            icon={Globe}
            title="Public"
            description="Anyone can see your profile, posts, and replies on Social."
            onClick={() => chooseVisibility("public")}
          />
          <VisibilityCard
            active={visibility === "private"}
            icon={LockKey}
            title="Private"
            description="Only approved followers can see your posts. New posts you create default to private too, though you can still switch each one individually."
            onClick={() => chooseVisibility("private")}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-rose">Danger Zone</h2>
        <div className="mt-2 overflow-hidden rounded-2xl border border-rose/25 bg-rose-soft/40">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="tap-scale flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-rose-soft/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-soft text-rose">
              <Trash weight="fill" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose">Delete my account</p>
              <p className="text-xs text-rose/70">Permanently erase all your data from this device</p>
            </span>
          </button>
        </div>
      </section>

      {confirmPrivate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setConfirmPrivate(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <LockKey weight="fill" className="size-6" />
              </span>
              <p className="mt-3 text-[15px] font-bold text-ink">Make your account private?</p>
              <p className="mt-1.5 max-w-xs text-sm text-ink-faint">
                Only approved followers will be able to see your posts and profile. New posts will default to
                private too. You can switch back to public anytime.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  applyVisibility("private")
                  setConfirmPrivate(false)
                }}
                className="tap-scale w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-canvas hover:bg-ink/90"
              >
                Make Private
              </button>
              <button
                type="button"
                onClick={() => setConfirmPrivate(false)}
                className="tap-scale w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-rose-soft text-rose">
                <ShieldWarning weight="fill" className="size-6" />
              </span>
              <p className="mt-3 text-[15px] font-bold text-ink">Delete your account?</p>
              <p className="mt-1.5 max-w-xs text-sm text-ink-faint">This can't be undone. You'll permanently lose:</p>
            </div>

            <ul className="mt-3 flex flex-col gap-1.5 rounded-xl bg-canvas p-3.5">
              {[
                "All your points & badge progress",
                "Every deed you've completed",
                "Your posts, replies & likes",
                "Your saved profile & password",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-ink-muted">
                  <WarningCircle weight="fill" className="mt-0.5 size-3.5 shrink-0 text-rose" />
                  {item}
                </li>
              ))}
            </ul>

            <label htmlFor="delete-confirm" className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Type {DELETE_CONFIRM_WORD} to confirm
            </label>
            <input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRM_WORD}
              autoComplete="off"
              className="mt-1.5 w-full rounded-xl border border-border-strong bg-canvas px-3.5 py-3 text-sm font-semibold tracking-wide text-ink placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-faint focus:border-rose focus:outline-none"
            />

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText.trim() !== DELETE_CONFIRM_WORD || deleting}
                className={clsx(
                  "tap-scale w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  confirmText.trim() === DELETE_CONFIRM_WORD && !deleting
                    ? "bg-rose text-white hover:bg-rose/90"
                    : "cursor-not-allowed bg-surface-raised text-ink-faint",
                )}
              >
                {deleting ? "Deleting…" : "Permanently Delete Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false)
                  setConfirmText("")
                }}
                disabled={deleting}
                className="tap-scale w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-semibold text-ink hover:border-border-strong"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
