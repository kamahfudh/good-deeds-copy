import { useNavigate } from "react-router-dom"
import { At, CaretRight } from "@phosphor-icons/react"

export function UsernameRequiredOverlay() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand">
        <At weight="bold" className="size-8" />
      </span>
      <h1 className="mt-5 text-xl font-bold text-ink">Set up your username</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-faint">
        Choose a username before using Social, so people can find and mention you properly.
      </p>
      <button
        type="button"
        onClick={() => navigate("/social/settings/personal-info", { state: { focusUsername: true } })}
        className="tap-scale mt-6 flex w-full max-w-xs items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-canvas hover:bg-ink/90"
      >
        Set up username
        <CaretRight weight="bold" className="size-4" />
      </button>
    </div>
  )
}
