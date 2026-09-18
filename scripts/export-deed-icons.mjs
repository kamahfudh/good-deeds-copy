import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const BASE_SIZE = 24
const SCALE = 4
const OUT_SIZE = BASE_SIZE * SCALE // 96

// deed_id -> phosphor icon component name (mirrors src/lib/deedIcons.ts)
const DEED_ICON_NAME = {
  deed_salah_001: "Kaaba", // custom icon, not from @phosphor-icons/react
  deed_salah_002: "UsersThree",
  deed_salah_004: "Stack",
  deed_salah_005: "SunHorizon",
  deed_salah_006: "Star",
  deed_salah_007: "MoonStars",
  deed_salah_008: "Sun",
  deed_salah_009: "HandWaving",
  deed_salah_010: "Drop",
  deed_salah_011: "Compass",
  deed_salah_012: "Heart",
  deed_salah_013: "CalendarCheck",
  deed_salah_017: "SunDim",
  deed_salah_018: "Flower",
  deed_salah_019: "ArrowFatLineDown",
  deed_salah_020: "HandHeart",

  deed_quran_001: "BookBookmark",
  deed_quran_003: "Books",
  deed_quran_004: "Moon",
  deed_quran_005: "Crown",
  deed_quran_006: "ShieldCheck",
  deed_quran_007: "SpeakerHigh",
  deed_quran_008: "Shield",
  deed_quran_009: "Brain",
  deed_quran_010: "Rewind",
  deed_quran_014: "ListNumbers",
  deed_quran_015: "Flame",

  deed_fasting_001: "CalendarStar",
  deed_fasting_002: "CalendarBlank",
  deed_fasting_003: "CircleHalf",
  deed_fasting_004: "Mountains",
  deed_fasting_005: "Flag",
  deed_fasting_006: "Confetti",
  deed_fasting_007: "Hourglass",
  deed_fasting_008: "CalendarPlus",
  deed_fasting_009: "Trophy",
  deed_fasting_010: "CalendarDots",
  deed_fasting_011: "ListChecks",
  deed_fasting_012: "Certificate",
  deed_fasting_013: "Gavel",
  deed_fasting_014: "ShieldCheck",
  deed_fasting_015: "Handshake",
}

// deed_id -> category (mirrors src/lib/data.ts)
const deedCategoryJson = fs.readFileSync("/tmp/deed_category.json", "utf8")
const DEED_CATEGORY = JSON.parse(deedCategoryJson)

// category -> accent color name (mirrors src/lib/data.ts CATEGORIES)
const CATEGORY_ACCENT = {
  salah: "brand",
  quran: "emerald",
  fasting: "violet",
}

// accent -> { light: inactiveHex, dark: inactiveHex } (mirrors src/index.css)
// active state is always white text on a solid accent fill (colors.ts solidBg),
// so active icon color is white in both themes.
const ACCENT_INACTIVE_HEX = {
  brand: { light: "#3946EA", dark: "#5A65ED" },
  emerald: { light: "#28806F", dark: "#40C4AA" },
  violet: { light: "#7C3AED", dark: "#B794F6" },
}
const ACTIVE_HEX = "#FFFFFF"

// Custom Kaaba path, mirrors src/components/icons.tsx
const KAABA_PATH =
  "M60,44 H196 A16,16 0 0 1 212,60 V196 A16,16 0 0 1 196,212 H60 A16,16 0 0 1 44,196 V60 A16,16 0 0 1 60,44 Z M50,96 H206 V120 H50 Z M112,160 H144 V196 H112 Z"
const KAABA_FILL_RULE = "evenodd"

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

  // Fake React: createElement just needs to capture props/children so we can
  // read back the raw path data — no actual rendering happens here.
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
  let paths
  if (iconName === "Kaaba") {
    paths = [{ d: KAABA_PATH, fillRule: KAABA_FILL_RULE }]
  } else {
    paths = extractFillPath(iconName)
  }
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

const STATES = [
  { state: "active", theme: "light", hex: ACTIVE_HEX },
  { state: "active", theme: "dark", hex: ACTIVE_HEX },
  { state: "inactive", theme: "light", hexFrom: "light" },
  { state: "inactive", theme: "dark", hexFrom: "dark" },
]

let count = 0
for (const [deedId, iconName] of Object.entries(DEED_ICON_NAME)) {
  const category = DEED_CATEGORY[deedId]
  const accent = CATEGORY_ACCENT[category]

  for (const variant of STATES) {
    const hex = variant.hex ?? ACCENT_INACTIVE_HEX[accent][variant.hexFrom]
    const svg = buildSvg(iconName, hex)
    const png = renderPng(svg, OUT_SIZE)

    const outDir = path.join(root, "src/assets/icon-exports", variant.theme, variant.state)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, `${deedId}.png`), png)
    count++
  }
}

console.log(`Exported ${count} PNGs (${Object.keys(DEED_ICON_NAME).length} deeds x 4 variants) at ${OUT_SIZE}x${OUT_SIZE}`)
