import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const BASE_SIZE = 24
const SCALE = 4
const OUT_SIZE = BASE_SIZE * SCALE // 96

// Every distinct icon used across the Social Settings flow: ProfileSettings.tsx,
// PrivacySettings.tsx, PersonalInfo.tsx, ChangePassword.tsx, and
// CountryPickerSheet.tsx. Colors are the *actual* on-screen hex per theme, read
// from src/index.css and each page's className. A few icons (CheckCircle,
// Globe, LockKey) have a genuine active/inactive distinction in the app
// (met/unmet requirement, selected/unselected visibility card); the rest
// render in a single fixed color with no toggle state, so their
// active/inactive PNGs are intentionally identical — generated anyway so
// every icon has the same 4-file shape.
const ICON_VARIANTS = {
  // Genuine 2-state icons
  CheckCircle: { light: { active: "#28806F", inactive: "#666D80" }, dark: { active: "#40C4AA", inactive: "#666D80" } },
  Globe: { light: { active: "#FFFFFF", inactive: "#666D80" }, dark: { active: "#FFFFFF", inactive: "#666D80" } },
  LockKey: { light: { active: "#FFFFFF", inactive: "#666D80" }, dark: { active: "#FFFFFF", inactive: "#666D80" } },

  // Single fixed-color icons (no real state — active/inactive duplicated)
  ArrowLeft: { light: { active: "#0D0D12", inactive: "#0D0D12" }, dark: { active: "#ECEFF3", inactive: "#ECEFF3" } },
  At: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  CaretDown: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  CaretRight: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  Check: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  Envelope: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  Eye: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  EyeSlash: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  IdentificationCard: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  Info: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  Lock: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  MagnifyingGlass: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  MapPin: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  Moon: { light: { active: "#7C3AED", inactive: "#7C3AED" }, dark: { active: "#B794F6", inactive: "#B794F6" } },
  PencilSimple: { light: { active: "#0D0D12", inactive: "#0D0D12" }, dark: { active: "#ECEFF3", inactive: "#ECEFF3" } },
  Phone: { light: { active: "#666D80", inactive: "#666D80" }, dark: { active: "#666D80", inactive: "#666D80" } },
  ShieldCheck: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  ShieldWarning: { light: { active: "#96132C", inactive: "#96132C" }, dark: { active: "#DF1C41", inactive: "#DF1C41" } },
  SignOut: { light: { active: "#96132C", inactive: "#96132C" }, dark: { active: "#DF1C41", inactive: "#DF1C41" } },
  Sun: { light: { active: "#7C3AED", inactive: "#7C3AED" }, dark: { active: "#B794F6", inactive: "#B794F6" } },
  Trash: { light: { active: "#96132C", inactive: "#96132C" }, dark: { active: "#DF1C41", inactive: "#DF1C41" } },
  User: { light: { active: "#3946EA", inactive: "#3946EA" }, dark: { active: "#5A65ED", inactive: "#5A65ED" } },
  WarningCircle: { light: { active: "#96132C", inactive: "#96132C" }, dark: { active: "#DF1C41", inactive: "#DF1C41" } },
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

      const outDir = path.join(root, "src/assets/icon-exports/social-settings", theme, state)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, `${fileName}.png`), png)
      count++
    }
  }
}

console.log(`Exported ${count} PNGs (${Object.keys(ICON_VARIANTS).length} icons x 4 variants) at ${OUT_SIZE}x${OUT_SIZE}`)
