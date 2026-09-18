import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo at /good-deeds-copy/, not the domain root —
  // only apply that base to production builds so local dev keeps using /.
  base: command === "build" ? "/good-deeds-copy/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
  },
}))
