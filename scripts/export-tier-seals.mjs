import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const BASE_SIZE = 24
const SCALE = 4
const OUT_SIZE = BASE_SIZE * SCALE // 96

// Reproduces TierBadge.tsx's SEAL_CLIP_PATH math exactly (14-cusp scalloped
// seal), but as SVG polygon points on a 0-100 viewBox instead of a CSS
// clip-path percentage string.
function sealPolygonPoints() {
  const cusps = 14
  const outerR = 50
  const innerR = 41
  const points = []
  for (let i = 0; i < cusps * 2; i++) {
    const angle = (Math.PI * i) / cusps
    const r = i % 2 === 0 ? outerR : innerR
    const x = 50 + r * Math.sin(angle)
    const y = 50 - r * Math.cos(angle)
    points.push(`${x.toFixed(3)},${y.toFixed(3)}`)
  }
  return points.join(" ")
}

const POLYGON_POINTS = sealPolygonPoints()

// Background-only (no icon) — mirrors TierBadge.tsx's 3 state fills exactly:
// current = amber gradient, reached = emerald gradient (both fixed hex, same
// in both themes per the light-mode contrast fix), locked = solid
// bg-surface-raised, which DOES differ per theme (src/index.css:23,75) so it
// alone is theme-split, matching every other icon-exports category's
// {theme}/{variant}/{name}.png layout.
const STATE_FILLS_BY_THEME = {
  dark: {
    current: { type: "gradient", from: "#FFBE4C", fromOpacity: 1, to: "#FFBE4C", toOpacity: 0.6 },
    reached: { type: "gradient", from: "#28806F", fromOpacity: 1, to: "#28806F", toOpacity: 0.6 },
    locked: { type: "solid", color: "#272835" },
  },
  light: {
    current: { type: "gradient", from: "#FFBE4C", fromOpacity: 1, to: "#FFBE4C", toOpacity: 0.6 },
    reached: { type: "gradient", from: "#28806F", fromOpacity: 1, to: "#28806F", toOpacity: 0.6 },
    locked: { type: "solid", color: "#f6f8fa" },
  },
}

const TIERS = ["seeker", "devoted", "steadfast", "luminary"]

function buildSvg(fill) {
  const defs =
    fill.type === "gradient"
      ? `<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${fill.from}" stop-opacity="${fill.fromOpacity}"/>
          <stop offset="100%" stop-color="${fill.to}" stop-opacity="${fill.toOpacity}"/>
        </linearGradient></defs>`
      : ""
  const fillAttr = fill.type === "gradient" ? "url(#g)" : fill.color
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${defs}<polygon points="${POLYGON_POINTS}" fill="${fillAttr}"/></svg>`
}

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  })
  return resvg.render().asPng()
}

let count = 0
for (const [theme, stateFills] of Object.entries(STATE_FILLS_BY_THEME)) {
  for (const tier of TIERS) {
    for (const [state, fill] of Object.entries(stateFills)) {
      const svg = buildSvg(fill)
      const png = renderPng(svg, OUT_SIZE)

      const outDir = path.join(root, "src/assets/icon-exports/badge-seals", theme, state)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, `${tier}.png`), png)
      count++
    }
  }
}

console.log(`Exported ${count} PNGs (2 themes x ${TIERS.length} tiers x 3 states) at ${OUT_SIZE}x${OUT_SIZE}`)
