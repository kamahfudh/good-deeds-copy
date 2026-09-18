import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const BASE_SIZE = 24
const SCALE = 4
const OUT_SIZE = BASE_SIZE * SCALE // 96

// The remaining (non-badge-tier) icons used across the Points & Rewards pages
// (Points.tsx, PointsRewards.tsx, PointsDeedsEarning.tsx, PointsSocialEarning.tsx).
// Colors are the *actual* on-screen hex per theme, read from src/index.css and
// each page's className. Four icons (CheckCircle, Certificate, Palette,
// PaintBrush/Sparkle-as-reward) have a genuine active/inactive distinction in
// the app (unlocked vs locked); the rest render in a single fixed color with
// no toggle state, so their active/inactive PNGs are intentionally identical —
// generated anyway so every icon has the same 4-file shape.
const ICON_VARIANTS = {
  // Genuine 2-state icons
  CheckCircle: { light: { active: "#FFBE4C", inactive: "#666D80" }, dark: { active: "#FFBE4C", inactive: "#666D80" } },
  Certificate: { light: { active: "#28806F", inactive: "#666D80" }, dark: { active: "#40C4AA", inactive: "#666D80" } },
  Palette: { light: { active: "#28806F", inactive: "#666D80" }, dark: { active: "#40C4AA", inactive: "#666D80" } },
  PaintBrush: { light: { active: "#28806F", inactive: "#666D80" }, dark: { active: "#40C4AA", inactive: "#666D80" } },
  Sparkle: { light: { active: "#28806F", inactive: "#666D80" }, dark: { active: "#40C4AA", inactive: "#666D80" } },

  // Single fixed-color icons (no real state — active/inactive duplicated)
  ArrowLeft: { light: { active: "#0D0D12", inactive: "#0D0D12" }, dark: { active: "#ECEFF3", inactive: "#ECEFF3" } },
  CaretRight: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  ChatsCircle: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  Gift: { light: { active: "#FFBE4C", inactive: "#FFBE4C" }, dark: { active: "#FFBE4C", inactive: "#FFBE4C" } },
  Lightning: { light: { active: "#FFBE4C", inactive: "#FFBE4C" }, dark: { active: "#FFBE4C", inactive: "#FFBE4C" } },
  ListChecks: { light: { active: "#28806F", inactive: "#28806F" }, dark: { active: "#40C4AA", inactive: "#40C4AA" } },
  Lock: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  Trophy: { light: { active: "#FFBE4C", inactive: "#FFBE4C" }, dark: { active: "#FFBE4C", inactive: "#FFBE4C" } },
  Info: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
}

function loadWeightsMap(iconName) {
  const defPath = path.join(
    root,
    "node_modules/@phosphor-icons/react/dist/defs",
    `${iconName}.es.js`,
  )
  let src = fs.readFileSync(defPath, "utf8")

  const importMatch = src.match(/import \* as (\w+) from "react";/)
  if (!importMatch) throw new Error(`No react import found for ${iconName}`)
  const reactVar = importMatch[1]
  src = src.replace(importMatch[0], "")

  const constMatch = src.match(/const (\w+) = \/\* @__PURE__ \*\/ new Map/)
  if (!constMatch) throw new Error(`No weights map found for ${iconName}`)
  const mapVar = constMatch[1]

  src = src.replace(/export \{[\s\S]*?\};?\s*$/, "")

  const fakeReact = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    Fragment: "Fragment",
  }

  const fn = new Function(reactVar, `${src}\nreturn ${mapVar};`)
  return fn(fakeReact)
}

function extractFillPath(iconName) {
  const map = loadWeightsMap(iconName)
  const fillEl = map.get("fill")
  if (!fillEl) throw new Error(`No "fill" weight found for ${iconName}`)
  const kids = fillEl.children.filter(Boolean)
  if (kids.length === 0) throw new Error(`No paths found in "fill" weight for ${iconName}`)
  return kids.map((k) => ({ d: k.props.d, fillRule: k.props.fillRule ?? "nonzero" }))
}

function buildSvg(iconName, colorHex) {
  const paths = extractFillPath(iconName)
  const pathTags = paths
    .map((p) => `<path d="${p.d}" fill-rule="${p.fillRule}" clip-rule="${p.fillRule}"/>`)
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="${colorHex}">${pathTags}</svg>`
}

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  })
  return resvg.render().asPng()
}

function kebabCase(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

let count = 0
for (const [iconName, byTheme] of Object.entries(ICON_VARIANTS)) {
  const fileName = kebabCase(iconName)
  for (const theme of ["light", "dark"]) {
    for (const state of ["active", "inactive"]) {
      const hex = byTheme[theme][state]
      const svg = buildSvg(iconName, hex)
      const png = renderPng(svg, OUT_SIZE)

      const outDir = path.join(root, "src/assets/icon-exports/points-ui", theme, state)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, `${fileName}.png`), png)
      count++
    }
  }
}

console.log(`Exported ${count} PNGs (${Object.keys(ICON_VARIANTS).length} icons x 4 variants) at ${OUT_SIZE}x${OUT_SIZE}`)
