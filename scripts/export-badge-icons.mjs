import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const BASE_SIZE = 24
const SCALE = 4
const OUT_SIZE = BASE_SIZE * SCALE // 96

// tier_id -> phosphor icon name (mirrors src/lib/badges.ts BADGE_TIERS)
const TIER_ICON_NAME = {
  seeker: "Compass",
  devoted: "Medal",
  steadfast: "ShieldCheck",
  luminary: "Crown",
}

// TierBadge.tsx has 3 real states (current/reached/locked); per user direction
// this export collapses current+reached into one "active" (white) look, and
// keeps "locked" as "inactive" (muted gray, same hex in both themes).
const STATE_HEX = {
  active: "#FFFFFF",
  inactive: "#666D80", // --color-ink-faint, identical in light and dark themes
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

let count = 0
for (const [tierId, iconName] of Object.entries(TIER_ICON_NAME)) {
  for (const theme of ["light", "dark"]) {
    for (const [state, hex] of Object.entries(STATE_HEX)) {
      const svg = buildSvg(iconName, hex)
      const png = renderPng(svg, OUT_SIZE)

      const outDir = path.join(root, "src/assets/icon-exports/badges", theme, state)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, `${tierId}.png`), png)
      count++
    }
  }
}

console.log(`Exported ${count} PNGs (${Object.keys(TIER_ICON_NAME).length} tiers x 4 variants) at ${OUT_SIZE}x${OUT_SIZE}`)
