import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle } from "@phosphor-icons/react"

interface ToastItem {
  id: string
  message: string
}

interface ToastApi {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TOAST_DURATION_MS = 2600

// Rendered at the app root (main.tsx) rather than inside whatever triggered
// it, so the toast survives even when the triggering item (e.g. a reported
// post) is immediately removed from the list underneath it.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)

  const showToast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToast({ id, message })
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, TOAST_DURATION_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4 lg:bottom-8">
          <div className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-3 shadow-pop">
            <CheckCircle weight="fill" className="size-[18px] shrink-0 text-emerald" />
            <p className="text-sm font-medium text-ink">{toast.message}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
