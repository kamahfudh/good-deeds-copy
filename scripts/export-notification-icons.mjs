import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const BASE_SIZE = 24
const SCALE = 4
const OUT_SIZE = BASE_SIZE * SCALE // 96

// Every distinct icon used across the Notifications feature: NotificationBell.tsx,
// NotificationsSpotlight.tsx, NotificationsFollowRequests.tsx, and
// notificationsFeed.ts (the per-kind status/good-deed icon map). Colors are the
// *actual* on-screen hex per theme, read from src/index.css and each file's
// className. ChatsCircle and Sparkle double as category-tab icons with a real
// active/inactive state (filled white on the active brand pill vs. ink-muted
// otherwise); every other icon renders in a single fixed color on screen (most
// of them white-on-gradient inside a notification-type badge), so their
// active/inactive files are intentionally identical — generated anyway so
// every icon has the same file shape.
const ICON_VARIANTS = {
  // Genuine 2-state icons (category tab: active vs. inactive)
  ChatsCircle: { light: { active: "#FFFFFF", inactive: "#36394A" }, dark: { active: "#FFFFFF", inactive: "#A4ACB9" } },
  Sparkle: { light: { active: "#FFFFFF", inactive: "#36394A" }, dark: { active: "#FFFFFF", inactive: "#A4ACB9" } },

  // Single fixed-color icons (no real state — active/inactive duplicated)
  ArrowLeft: { light: { active: "#0D0D12", inactive: "#0D0D12" }, dark: { active: "#ECEFF3", inactive: "#ECEFF3" } },
  Bell: { light: { active: "#0D0D12", inactive: "#0D0D12" }, dark: { active: "#ECEFF3", inactive: "#ECEFF3" } },
  CaretRight: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  UsersThree: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  BookOpenText: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  CheckCircle: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  Clock: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  Flame: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  ListChecks: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  Mosque: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  Trophy: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
  WarningCircle: { light: { active: "#FFFFFF", inactive: "#FFFFFF" }, dark: { active: "#FFFFFF", inactive: "#FFFFFF" } },
}

function loadWeightsMap(iconName) {
  const defPath = path.join(root, "node_modules/@phosphor-icons/react/dist/defs", `${iconName}.es.js`)
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

let pngCount = 0
let svgCount = 0
for (const [iconName, byTheme] of Object.entries(ICON_VARIANTS)) {
  const fileName = kebabCase(iconName)
  for (const theme of ["light", "dark"]) {
    // One representative SVG per icon per theme, colored with the "active"
    // (primary on-screen) hex — vector output has no fixed pixel state to
    // branch on the way the PNG export does.
    const svg = buildSvg(iconName, byTheme[theme].active)
    const svgDir = path.join(root, "src/assets/icon-exports/notifications", theme, "svg")
    fs.mkdirSync(svgDir, { recursive: true })
    fs.writeFileSync(path.join(svgDir, `${fileName}.svg`), svg)
    svgCount++

    for (const state of ["active", "inactive"]) {
      const hex = byTheme[theme][state]
      const stateSvg = buildSvg(iconName, hex)
      const png = renderPng(stateSvg, OUT_SIZE)

      const outDir = path.join(root, "src/assets/icon-exports/notifications", theme, state)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, `${fileName}.png`), png)
      pngCount++
    }
  }
}

console.log(
  `Exported ${svgCount} SVGs and ${pngCount} PNGs (${Object.keys(ICON_VARIANTS).length} icons) at ${OUT_SIZE}x${OUT_SIZE}`,
)
