import type { CategoryId } from "./data"

export type ProfileId = "foundation" | "devoted" | "exemplar"

export interface ProfileMeta {
  id: ProfileId
  label: string
  tagline: string
  color: "rose" | "emerald" | "cyan"
}

export const PROFILES: Record<ProfileId, ProfileMeta> = {
  foundation: {
    id: "foundation",
    label: "Foundation Builder",
    tagline:
      "Focuses on establishing and fulfilling all mandatory (Fard) acts of worship and clearing debts (Qada) before taking on extra practices.",
    color: "rose",
  },
  devoted: {
    id: "devoted",
    label: "Devoted Practitioner",
    tagline:
      "Consistently completes obligatory worship and is now establishing regular Sunnah habits and daily routines.",
    color: "emerald",
  },
  exemplar: {
    id: "exemplar",
    label: "Spiritual Exemplar",
    tagline:
      "Maintains high consistency in primary Sunnah routines, aiming for advanced voluntary acts (Nawafil) and deep spiritual consistency.",
    color: "cyan",
  },
}

export interface QuestionOption {
  label: string
  next: string
  result?: {
    profile: ProfileId
    deedIds: string[]
  }
}

export interface QuestionNode {
  id: string
  category: CategoryId
  text: string
  options: QuestionOption[]
}

export const START_NODE = "Q1"
export const END_NODE = "END"

export const QUESTIONS: Record<string, QuestionNode> = {
  Q1: {
    id: "Q1",
    category: "salah",
    text: "How many obligatory (Fard) prayers do you perform on an average day?",
    options: [
      {
        label: "0-4 Prayers",
        next: "Q2",
        result: { profile: "foundation", deedIds: ["deed_salah_001"] },
      },
      { label: "5 Prayers", next: "Q1.1" },
    ],
  },
  "Q1.1": {
    id: "Q1.1",
    category: "salah",
    text: "Out of your 5 daily prayers, how many do you perform in congregation at the mosque?",
    options: [
      {
        label: "0-4 Prayers",
        next: "Q2",
        result: { profile: "devoted", deedIds: ["deed_salah_002"] },
      },
      {
        label: "5 Prayers",
        next: "Q1.2",
        result: { profile: "devoted", deedIds: ["deed_salah_009"] },
      },
    ],
  },
  "Q1.2": {
    id: "Q1.2",
    category: "salah",
    text: "How many raka'at of Duha prayer do you perform per week?",
    options: [
      {
        label: "0 Raka'at",
        next: "Q2",
        result: { profile: "devoted", deedIds: ["deed_salah_008", "deed_salah_007"] },
      },
      { label: "2+ Raka'at", next: "Q1.3" },
    ],
  },
  "Q1.3": {
    id: "Q1.3",
    category: "salah",
    text: "How many nights per week do you perform Tahajjud (Night Vigil)?",
    options: [
      {
        label: "0 Nights",
        next: "Q2",
        result: { profile: "devoted", deedIds: ["deed_salah_007"] },
      },
      {
        label: "1-6 Nights",
        next: "Q2",
        result: { profile: "devoted", deedIds: ["deed_salah_007", "deed_salah_011"] },
      },
      {
        label: "7 Nights",
        next: "Q2",
        result: { profile: "exemplar", deedIds: ["deed_salah_007", "deed_salah_011"] },
      },
    ],
  },
  Q2: {
    id: "Q2",
    category: "quran",
    text: "How many pages of the Qur'an do you recite on an average day?",
    options: [
      { label: "0 Pages", next: "Q2.1" },
      { label: "1-4 Pages", next: "Q2.2" },
      { label: "5+ Pages (or 1+ Juz)", next: "Q2.2" },
    ],
  },
  "Q2.1": {
    id: "Q2.1",
    category: "quran",
    text: "Do you read short protective verses/surahs daily (e.g., Ayatul Kursi, 3 Quls)?",
    options: [
      {
        label: "No",
        next: "Q3",
        result: { profile: "foundation", deedIds: ["deed_quran_001", "deed_quran_005"] },
      },
      {
        label: "Yes",
        next: "Q3",
        result: { profile: "foundation", deedIds: ["deed_quran_015", "deed_quran_006"] },
      },
    ],
  },
  "Q2.2": {
    id: "Q2.2",
    category: "quran",
    text: "How many new verses (Ayat) do you memorize or systematically revise per week?",
    options: [
      {
        label: "0-4 Ayat",
        next: "Q3",
        result: {
          profile: "devoted",
          deedIds: ["deed_quran_004", "deed_quran_003", "deed_quran_008", "deed_quran_009"],
        },
      },
      {
        label: "5+ Ayat",
        next: "Q3",
        result: {
          profile: "exemplar",
          deedIds: ["deed_quran_010", "deed_quran_014", "deed_salah_019"],
        },
      },
    ],
  },
  Q3: {
    id: "Q3",
    category: "fasting",
    text: "How many missed obligatory fasts (Qada or Nadhr vows) do you currently owe?",
    options: [
      {
        label: "Did not perform obligatory fasts",
        next: "END",
        result: { profile: "foundation", deedIds: ["deed_fasting_001", "deed_fasting_011"] },
      },
      {
        label: "1 or more days",
        next: "END",
        result: { profile: "foundation", deedIds: ["deed_fasting_011", "deed_fasting_015"] },
      },
      { label: "0 days", next: "Q3.1" },
    ],
  },
  "Q3.1": {
    id: "Q3.1",
    category: "fasting",
    text: "Did you complete the entire month of Ramadan fasting last year?",
    options: [
      {
        label: "No",
        next: "END",
        result: { profile: "foundation", deedIds: ["deed_fasting_001"] },
      },
      { label: "Yes", next: "Q3.2" },
    ],
  },
  "Q3.2": {
    id: "Q3.2",
    category: "fasting",
    text: "How many voluntary days do you fast in an average month outside Ramadan?",
    options: [
      {
        label: "0 Days",
        next: "END",
        result: {
          profile: "devoted",
          deedIds: ["deed_fasting_002", "deed_fasting_004", "deed_fasting_005"],
        },
      },
      {
        label: "1-7 Days",
        next: "END",
        result: { profile: "devoted", deedIds: ["deed_fasting_002", "deed_fasting_003"] },
      },
      {
        label: "8-14 Days",
        next: "END",
        result: {
          profile: "exemplar",
          deedIds: ["deed_fasting_006", "deed_fasting_009", "deed_fasting_002"],
        },
      },
      {
        label: "14+ Days",
        next: "END",
        result: {
          profile: "exemplar",
          deedIds: ["deed_fasting_010", "deed_fasting_006", "deed_fasting_009"],
        },
      },
    ],
  },
}

export interface CategoryResult {
  profile: ProfileId
  deedIds: string[]
}

export interface AssessmentAnswer {
  nodeId: string
  optionIndex: number
}

export function deriveAssessmentState(answers: AssessmentAnswer[]) {
  let nodeId: string = START_NODE
  const results: Partial<Record<CategoryId, CategoryResult>> = {}

  for (const answer of answers) {
    const node = QUESTIONS[answer.nodeId]
    const option = node.options[answer.optionIndex]
    if (option.result) {
      const existing = results[node.category]
      const deedIds = new Set(existing?.deedIds ?? [])
      option.result.deedIds.forEach((id) => deedIds.add(id))
      results[node.category] = { profile: option.result.profile, deedIds: Array.from(deedIds) }
    }
    nodeId = option.next
  }

  return { nodeId, results }
}
