import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import { GoodDeedsProvider } from "./lib/store.tsx"
import { SocialProvider } from "./lib/socialStore.tsx"
import { ThemeProvider } from "./lib/theme.tsx"
import { MosqueProvider } from "./lib/mosqueStore.tsx"
import { ToastProvider } from "./lib/toastStore.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <GoodDeedsProvider>
            <MosqueProvider>
              <SocialProvider>
                <App />
              </SocialProvider>
            </MosqueProvider>
          </GoodDeedsProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
