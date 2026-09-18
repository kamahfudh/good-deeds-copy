export type DayCode = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

export const ALL_DAYS: DayCode[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAILY = ALL_DAYS

export type PrayerCode = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"

export const ALL_PRAYERS: PrayerCode[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"]

export const PRAYER_LABELS: Record<PrayerCode, string> = {
  fajr: "Subuh",
  dhuhr: "Zuhur",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isya",
}

export type CategoryId = "salah" | "quran" | "fasting"

export interface Category {
  id: CategoryId
  label: string
  shortLabel: string
  description: string
  color: "amber" | "brand" | "emerald" | "rose" | "violet" | "cyan"
}

export const CATEGORIES: Category[] = [
  {
    id: "salah",
    label: "Salah (Prayers)",
    shortLabel: "Salah",
    description: "Obligatory and voluntary prayers",
    color: "brand",
  },
  {
    id: "quran",
    label: "Qur'an",
    shortLabel: "Qur'an",
    description: "Recitation, study & reflection",
    color: "emerald",
  },
  {
    id: "fasting",
    label: "Fasting",
    shortLabel: "Fasting",
    description: "Obligatory, Sunnah & voluntary fasts",
    color: "violet",
  },
]

export interface DeedReference {
  source: string
  quote: string
}

export interface Deed {
  id: string
  title: string
  arabicName?: string
  category: CategoryId
  subCategory: string
  points: number
  penaltyPoints: number
  frequencyLabel: string
  suggestedDays: DayCode[]
  suggestedTime: string
  summary: string
  howTo: string[]
  benefit: string
  references: DeedReference[]
  requiresMosqueCheckIn?: boolean
  mosqueMinStayMinutes?: number
  requiresPrayerSelection?: boolean
  // Locks the schedule to specific day(s) with no user choice — e.g. Jumu'ah
  // is always Friday, so the day-picker is skipped entirely and this array
  // is used as the subscription's days.
  fixedDays?: DayCode[]
  // Marks an occasional / event-triggered deed (entering a mosque, an
  // eclipse, a funeral prayer) that has no weekly pattern at all. The
  // day-picker is skipped, the subscription is always loggable, and it's
  // left out of the "due today" nudge so it doesn't nag on ordinary days.
  flexibleSchedule?: boolean
  // Narrows the day-picker to only these days instead of the full week —
  // e.g. Monday/Thursday fasting only ever makes sense on those two days,
  // but (unlike fixedDays) the user still chooses which of them to track.
  restrictedDays?: DayCode[]
}

export const DEEDS: Deed[] = [
  // ---- 1. Obligatory & Voluntary Salah ----
  {
    id: "deed_salah_001",
    title: "5 Obligatory Prayers (Fard)",
    arabicName: "As-Salawat Al-Khams",
    category: "salah",
    subCategory: "Obligatory Salah",
    points: 50,
    penaltyPoints: 20,
    frequencyLabel: "Daily, 5x",
    suggestedDays: DAILY,
    suggestedTime: "At each prayer's fixed time",
    summary: "The five daily prayers, the foundational pillar of Islam.",
    howTo: [
      "Pray Fajr (2 rak'ahs), Dhuhr (4), Asr (4), Maghrib (3), and Isha (4) within their prescribed time windows.",
      "Fulfill every compulsory pillar and act within each prayer with focus and humility.",
    ],
    benefit:
      "Serves as the foundational pillar of Islam, purifies daily sins between prayers, and maintains continuous divine connection.",
    references: [
      {
        source: "Surah An-Nisa 4:103",
        quote: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
      },
      {
        source: "Sahih al-Bukhari 528",
        quote: "The deed most beloved to Allah is prayer performed at its proper time.",
      },
    ],
    requiresPrayerSelection: true,
  },
  {
    id: "deed_salah_002",
    title: "Congregational Prayer in Mosque",
    arabicName: "Salah Jama'ah",
    category: "salah",
    subCategory: "Salah Excellence",
    points: 60,
    penaltyPoints: 15,
    frequencyLabel: "Daily, 5x",
    suggestedDays: DAILY,
    suggestedTime: "At each prayer's fixed time",
    summary: "Pray the five daily prayers behind the Imam at the mosque.",
    howTo: [
      "Make wudu and walk to the masjid ahead of the prayer time.",
      "Stand in rows behind the Imam and complete the obligatory prayer together with fellow worshipers.",
    ],
    benefit: "Multiplies the reward of prayer 27 times, fosters brotherhood, and secures divine protection.",
    references: [
      {
        source: "Sahih al-Bukhari 645",
        quote: "Prayer in congregation is twenty-seven times superior to prayer performed individually.",
      },
    ],
    requiresMosqueCheckIn: true,
    mosqueMinStayMinutes: 10,
    requiresPrayerSelection: true,
  },
  {
    id: "deed_salah_004",
    title: "12 Raka'at Sunnah Rawatib",
    arabicName: "As-Sunan ar-Rawatib",
    category: "salah",
    subCategory: "Sunnah Salah",
    points: 40,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Around each fard prayer",
    summary: "The twelve confirmed rak'ahs prayed around the five daily prayers.",
    howTo: [
      "Pray 2 rak'ahs before Fajr.",
      "Pray 4 rak'ahs before Dhuhr (as 2+2) and 2 rak'ahs after.",
      "Pray 2 rak'ahs after Maghrib and 2 rak'ahs after Isha.",
    ],
    benefit:
      "Guarantees a house built by Allah in Paradise and compensates for minor deficiencies in the obligatory prayers.",
    references: [
      {
        source: "Sahih Muslim 728",
        quote:
          "Whoever prays twelve rak'ahs in a day and a night will have a house built for him in Paradise.",
      },
    ],
  },
  {
    id: "deed_salah_005",
    title: "Sunnah Before Fajr (2 Raka'at)",
    category: "salah",
    subCategory: "Sunnah Salah",
    points: 30,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Right after the Fajr adhan",
    summary: "Two light rak'ahs prayed right after the Fajr adhan.",
    howTo: [
      "Perform 2 light rak'ahs immediately after the Fajr adhan.",
      "Recite Surah Al-Kafirun in the first rak'ah and Surah Al-Ikhlas in the second.",
    ],
    benefit: "Better than the entire world and everything in it; instills early morning peace and spiritual clarity.",
    references: [
      {
        source: "Sahih Muslim 725",
        quote: "The two rak'ahs of Fajr are better than the world and everything in it.",
      },
    ],
  },
  {
    id: "deed_salah_006",
    title: "Witr Prayer",
    arabicName: "Salat al-Witr",
    category: "salah",
    subCategory: "Sunnah Salah",
    points: 30,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Before sleep or before Fajr",
    summary: "An odd-numbered prayer that closes out the night.",
    howTo: [
      "Pray an odd number of rak'ahs (1, 3, or 5) as the final prayer of the night.",
      "Perform it either right after Isha or as the very last prayer before sleep or dawn.",
    ],
    benefit:
      "Fulfills a beloved Sunnah, since Allah is odd and loves the odd, ensuring your day finishes in devotion.",
    references: [
      {
        source: "Sahih Muslim 754",
        quote: "Make Witr the last of your prayer at night.",
      },
      {
        source: "Sunan Abi Dawud 1418",
        quote: "Allah is Witr (One) and loves the Witr, so perform Witr, O people of the Qur'an.",
      },
    ],
  },
  {
    id: "deed_salah_007",
    title: "Tahajjud (Night Vigil Prayer)",
    arabicName: "Salat al-Tahajjud",
    category: "salah",
    subCategory: "Voluntary Salah",
    points: 50,
    penaltyPoints: 15,
    frequencyLabel: "Daily / Custom",
    suggestedDays: DAILY,
    suggestedTime: "Last third of the night",
    summary: "Voluntary night prayer performed after waking, before Fajr.",
    howTo: [
      "Wake up in the last third of the night and make wudu.",
      "Pray 2 to 8 voluntary rak'ahs, in sets of two.",
    ],
    benefit:
      "Brings one closest to Allah during the Divine Descent, ensures answered supplications, and grants spiritual light (nur).",
    references: [
      {
        source: "Sahih al-Bukhari 1145",
        quote:
          "Our Lord descends every night to the lowest heaven when the last third of the night remains, and He says: Who is calling upon Me, that I may answer him? Who is asking of Me, that I may give him? Who is seeking My forgiveness, that I may forgive him?",
      },
    ],
  },
  {
    id: "deed_salah_008",
    title: "Duha Prayer (Forenoon Prayer)",
    arabicName: "Salat al-Duha",
    category: "salah",
    subCategory: "Voluntary Salah",
    points: 25,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Mid-morning, after sunrise",
    summary: "A short prayer after sunrise, standing in for daily charity.",
    howTo: [
      "Wait until about 15-20 minutes after sunrise.",
      "Pray 2, 4, 6, or 8 rak'ahs any time before Dhuhr.",
    ],
    benefit: "Fulfills the daily charity due upon all 360 joints of the body and brings blessing in livelihood.",
    references: [
      {
        source: "Sahih Muslim 720",
        quote:
          "In the morning, charity is due on every joint bone of the body of every one of you... and two rak'ahs which one prays in the forenoon will suffice for that.",
      },
    ],
  },
  {
    id: "deed_salah_009",
    title: "Tahiyyatul Masjid (Greeting Mosque)",
    category: "salah",
    subCategory: "Sunnah Salah",
    points: 20,
    penaltyPoints: 5,
    frequencyLabel: "On mosque entry",
    suggestedDays: DAILY,
    suggestedTime: "Whenever entering a mosque",
    summary: "Two light rak'ahs prayed immediately upon entering a mosque.",
    howTo: ["Upon entering a mosque, pray 2 light rak'ahs before sitting down."],
    benefit: "Demonstrates proper reverence for the house of Allah, converting physical entry into instant worship.",
    references: [
      {
        source: "Sahih al-Bukhari 444",
        quote: "When any one of you enters the mosque, he should not sit down until he has prayed two rak'ahs.",
      },
    ],
    requiresMosqueCheckIn: true,
    mosqueMinStayMinutes: 5,
  },
  {
    id: "deed_salah_010",
    title: "Tahiyyatul Wudu (Prayer After Wudu)",
    category: "salah",
    subCategory: "Sunnah Salah",
    points: 20,
    penaltyPoints: 5,
    frequencyLabel: "After wudu",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Right after wudu",
    summary: "Two voluntary rak'ahs prayed shortly after ablution.",
    howTo: ["Shortly after completing wudu, pray 2 voluntary rak'ahs with focus and humility."],
    benefit: "Erases prior minor sins and serves as a direct path to Paradise, as exemplified by Bilal (RA).",
    references: [
      {
        source: "Sahih al-Bukhari 1149",
        quote:
          "I have never purified myself with an ablution, at any hour of night or day, without praying with that purification whatever was written for me to pray, said Bilal, when asked by the Prophet about his most hopeful deed in Islam.",
      },
    ],
  },
  {
    id: "deed_salah_011",
    title: "Salat al-Istikhara (Guidance)",
    category: "salah",
    subCategory: "Voluntary Salah",
    points: 35,
    penaltyPoints: 10,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Whenever facing a decision",
    summary: "Two rak'ahs prayed for guidance before a decision.",
    howTo: [
      "When facing a decision, pray 2 non-obligatory rak'ahs.",
      "Follow with the prescribed Istikhara supplication, then proceed with an open heart.",
    ],
    benefit: "Eliminates anxiety, aligns choices with divine decree, and entrusts outcomes to Allah.",
    references: [
      {
        source: "Sahih al-Bukhari 1166",
        quote:
          "O Allah, I seek Your guidance through Your knowledge, and I seek ability through Your power, and I ask You of Your great bounty.",
      },
    ],
  },
  {
    id: "deed_salah_012",
    title: "Salat al-Tawbah (Repentance)",
    category: "salah",
    subCategory: "Voluntary Salah",
    points: 40,
    penaltyPoints: 10,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Whenever seeking repentance",
    summary: "Two rak'ahs prayed with sincere repentance.",
    howTo: [
      "Perform proper wudu and pray 2 rak'ahs.",
      "Sincerely ask Allah for forgiveness while resolving to leave the sin behind.",
    ],
    benefit: "Erases committed sins, purifies the heart, and re-establishes divine mercy.",
    references: [
      {
        source: "Sunan Abi Dawud 1521",
        quote:
          "There is no man who commits a sin, then gets up and purifies himself, then prays two rak'ahs, then asks forgiveness of Allah, but Allah forgives him.",
      },
    ],
  },
  {
    id: "deed_salah_013",
    title: "Jumu'ah (Friday) Prayer",
    category: "salah",
    subCategory: "Obligatory Salah",
    points: 80,
    penaltyPoints: 50,
    frequencyLabel: "Weekly",
    suggestedDays: ["Fri"],
    fixedDays: ["Fri"],
    suggestedTime: "Friday midday",
    summary: "The obligatory Friday congregational prayer and khutbah.",
    howTo: [
      "Perform ghusl and arrive early at the masjid.",
      "Listen attentively to the khutbah, then pray 2 rak'ahs with the Imam.",
    ],
    benefit: "Wipes away sins committed between Fridays and unites the Muslim community in weekly remembrance.",
    references: [
      {
        source: "Surah Al-Jumu'ah 62:9",
        quote:
          "O you who have believed, when the call to prayer is made on Friday, then proceed to the remembrance of Allah and leave trade. That is better for you, if you only knew.",
      },
      {
        source: "Sahih Muslim 857",
        quote:
          "Whoever performs ghusl on Friday like the ghusl for major impurity and then goes early to the mosque is as if he had sacrificed a camel.",
      },
    ],
    requiresMosqueCheckIn: true,
    mosqueMinStayMinutes: 15,
  },
  {
    id: "deed_salah_017",
    title: "Salat al-Kusuf / Khusuf (Eclipse)",
    category: "salah",
    subCategory: "Sunnah Mu'akkadah",
    points: 70,
    penaltyPoints: 15,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "During a solar or lunar eclipse",
    summary: "A special prayer performed during a solar or lunar eclipse.",
    howTo: [
      "During a solar or lunar eclipse, pray 2 rak'ahs.",
      "Perform two bowings (ruku') within each rak'ah with long recitation.",
    ],
    benefit: "Instills awe of Allah's cosmic power, reminds of the Day of Judgment, and prompts repentance.",
    references: [
      {
        source: "Sahih al-Bukhari 1040",
        quote:
          "The sun and the moon are two signs among the signs of Allah. They do not eclipse for the death or life of anyone, but when you see that, remember Allah.",
      },
    ],
  },
  {
    id: "deed_salah_018",
    title: "Salat al-Janazah (Funeral Prayer)",
    category: "salah",
    subCategory: "Fard Kifayah",
    points: 100,
    penaltyPoints: 20,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Whenever a funeral prayer is held",
    summary: "The communal funeral prayer, a collective obligation.",
    howTo: [
      "Stand in rows without ruku' or sujud.",
      "Say four Takbirs, reciting Al-Fatihah, Salawat, a du'a for the deceased, and closing Taslim.",
    ],
    benefit: "Earns a reward equivalent to a mountain of Uhud and fulfills a vital communal obligation.",
    references: [
      {
        source: "Sahih al-Bukhari 47",
        quote:
          "Whoever attends the funeral until the prayer is offered will have a reward of one qirat, and whoever attends until burial will have a reward of two qirats, each qirat like the great mountain of Uhud.",
      },
      {
        source: "Sahih Muslim 945",
        quote: "The smallest of the two qirats is like the mountain of Uhud.",
      },
    ],
  },
  {
    id: "deed_salah_019",
    title: "Sajdah al-Tilawah (Prostration)",
    category: "salah",
    subCategory: "Salah & Qur'an",
    points: 25,
    penaltyPoints: 5,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Whenever a prostration verse is recited",
    summary: "A single prostration upon reciting or hearing a verse of prostration.",
    howTo: [
      "Upon reading or hearing a verse of prostration, perform a single prostration.",
      "Glorify Allah during the prostration, then rise.",
    ],
    benefit: "Demonstrates immediate submission to revelation and causes Satan to weep in despair.",
    references: [
      {
        source: "Sahih Muslim 81",
        quote:
          "When the son of Adam recites a verse of prostration and prostrates, Satan withdraws weeping, saying: Woe to me, the son of Adam was commanded to prostrate and he prostrated, so his is Paradise, and I was commanded to prostrate and I refused, so mine is the Fire.",
      },
    ],
  },
  {
    id: "deed_salah_020",
    title: "Sajdah al-Shukr (Thanks Prostration)",
    category: "salah",
    subCategory: "Voluntary Act",
    points: 30,
    penaltyPoints: 5,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Whenever blessed with good news",
    summary: "A prostration of gratitude upon receiving good news.",
    howTo: [
      "Upon receiving joyful news or being saved from calamity, prostrate immediately.",
      "Give thanks to Allah during the prostration.",
    ],
    benefit: "Cultivates deep humility, preserves blessings from vanishing, and draws one closer to Allah.",
    references: [
      {
        source: "Sunan Abi Dawud 2774",
        quote:
          "Whenever a matter that would bring him joy came to him, or he was given glad tidings, the Prophet would fall down in prostration, thanking Allah.",
      },
    ],
  },

  // ---- 2. Qur'an Recitation, Study & Reflection ----
  {
    id: "deed_quran_001",
    title: "Recite Al-Qur'an (Any Surah)",
    arabicName: "Tilawah al-Qur'an",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 30,
    penaltyPoints: 10,
    frequencyLabel: "Daily / Custom",
    suggestedDays: DAILY,
    suggestedTime: "Anytime",
    summary: "Recite any portion of the Qur'an with focus and sincerity.",
    howTo: [
      "Read any portion or chapter of the Qur'an with proper Tajweed.",
      "Recite with focus and sincerity, even a small consistent portion.",
    ],
    benefit: "Earns ten rewards per letter, softens the heart, and brings spiritual healing (shifa') to the soul.",
    references: [
      {
        source: "Jami' at-Tirmidhi 2910",
        quote:
          "Whoever reads a letter from the Book of Allah, he will have a reward, and that reward will be multiplied by ten. I do not say that Alif Lam Mim is a letter, but Alif is a letter, Lam is a letter, and Mim is a letter.",
      },
    ],
  },
  {
    id: "deed_quran_003",
    title: "Recite Surah Al-Kahf on Friday",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 100,
    penaltyPoints: 30,
    frequencyLabel: "Weekly",
    suggestedDays: ["Fri"],
    fixedDays: ["Fri"],
    suggestedTime: "Thursday sunset to Friday sunset",
    summary: "Recite Surah Al-Kahf between Thursday sunset and Friday sunset.",
    howTo: ["Recite Surah Al-Kahf (Chapter 18) any time between Thursday sunset and Friday sunset."],
    benefit: "Casts light for the reciter between the two Fridays and shields against the tribulations of Dajjal.",
    references: [
      {
        source: "Sunan al-Kubra 5856",
        quote: "Whoever recites Surah Al-Kahf on the day of Friday, light will shine for him between the two Fridays.",
      },
      {
        source: "Al-Hakim 2/368",
        quote:
          "Whoever memorizes the first ten verses of Surah Al-Kahf will be protected from the Dajjal.",
      },
    ],
  },
  {
    id: "deed_quran_004",
    title: "Recite Surah Al-Mulk Before Sleep",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 40,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Before sleep",
    summary: "Recite Surah Al-Mulk every night before sleeping.",
    howTo: ["Recite Surah Al-Mulk (Chapter 67) every night before sleeping."],
    benefit: "Intercedes continuously for the reader until forgiven and protects against the torment of the grave.",
    references: [
      {
        source: "Jami' at-Tirmidhi 2891",
        quote:
          "There is a surah in the Qur'an of thirty verses which will intercede for its companion until he is forgiven: Blessed is He in whose hand is the dominion (Tabarak alladhi bi yadihil-mulk).",
      },
    ],
  },
  {
    id: "deed_quran_005",
    title: "Recite Ayatul Kursi After Fard Salah",
    category: "quran",
    subCategory: "Salah & Qur'an",
    points: 30,
    penaltyPoints: 10,
    frequencyLabel: "Daily, 5x",
    suggestedDays: DAILY,
    suggestedTime: "After each fard prayer",
    summary: "Recite Ayat al-Kursi once after every obligatory prayer.",
    howTo: ["Recite Ayat al-Kursi (Al-Baqarah 2:255) once immediately after each obligatory prayer."],
    benefit: "Ensures that the only barrier between the reciter and entering Paradise is physical death.",
    references: [
      {
        source: "Sunan al-Kubra 9848",
        quote:
          "Whoever recites Ayat al-Kursi immediately after every obligatory prayer, nothing stands between him and entering Paradise except death.",
      },
      {
        source: "Ibn Hibban 121",
        quote: "The greatest verse in the Book of Allah is Ayat al-Kursi.",
      },
    ],
    requiresPrayerSelection: true,
  },
  {
    id: "deed_quran_006",
    title: "Recite 3 Quls Nightly",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 25,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Before sleep",
    summary: "Recite the three Quls and wipe them over the body before sleep.",
    howTo: [
      "Cup your hands and recite Surah Al-Ikhlas, Al-Falaq, and An-Nas.",
      "Blow into your hands and wipe them across your body; repeat three times.",
    ],
    benefit: "Provides complete divine protection from magic, the evil eye, and subtle nocturnal harms.",
    references: [
      {
        source: "Sahih al-Bukhari 5017",
        quote:
          "Every night when the Prophet went to bed, he would cup his hands together and blow into them after reciting Al-Ikhlas, Al-Falaq, and An-Nas, then wipe his hands over whatever he could of his body, starting with his head and face, doing so three times.",
      },
    ],
  },
  {
    id: "deed_quran_007",
    title: "Recite Surah Al-Ikhlas (10 Times)",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 35,
    penaltyPoints: 10,
    frequencyLabel: "Daily / Custom",
    suggestedDays: DAILY,
    suggestedTime: "Anytime",
    summary: "Recite Surah Al-Ikhlas ten times in a day.",
    howTo: ["Recite Surah Al-Ikhlas (Chapter 112) ten times, in one sitting or spread through the day."],
    benefit: "Earns a palace built by Allah in Jannah and affirms core monotheism (Tawhid).",
    references: [
      {
        source: "Musnad Ahmad 15611",
        quote: "Whoever recites Qul huwa Allahu ahad ten times, Allah will build for him a palace in Paradise.",
      },
      {
        source: "Sahih al-Jami 6472",
        quote: "Surah Al-Ikhlas is equivalent to a third of the Qur'an.",
      },
    ],
  },
  {
    id: "deed_quran_008",
    title: "Recite Last 2 Ayat of Surah Al-Baqarah",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 30,
    penaltyPoints: 10,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Before sleep",
    summary: "Recite the final two verses of Al-Baqarah before sleeping.",
    howTo: ["Recite verses 285 and 286 of Surah Al-Baqarah before going to sleep."],
    benefit: "Serves as complete protection for the night and counts as spending the night in devotion.",
    references: [
      {
        source: "Sahih al-Bukhari 5009",
        quote: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him.",
      },
      {
        source: "Sahih Muslim 807",
        quote: "The last two verses of Al-Baqarah were given to the Prophet from a treasure beneath the Throne.",
      },
    ],
  },
  {
    id: "deed_quran_015",
    title: "Establish 1 Page Daily Recitation",
    category: "quran",
    subCategory: "Qur'an Recitation",
    points: 35,
    penaltyPoints: 15,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Anytime",
    summary: "Recite at least one full page of the Qur'an every day to build a steady, lasting habit.",
    howTo: [
      "Pick a fixed time each day, such as after Fajr, to recite at least one page from the Mushaf.",
      "Read with proper Tajweed and reflect on the meaning, keeping the habit small but unbroken.",
    ],
    benefit: "Builds a lasting, consistent bond with the Qur'an, since Allah loves deeds done regularly even when small.",
    references: [
      {
        source: "Sahih al-Bukhari 6465",
        quote:
          "Do good deeds properly, sincerely, and moderately, and know that the most beloved of deeds to Allah is that which is done regularly, even if it is little.",
      },
    ],
  },
  {
    id: "deed_quran_009",
    title: "Memorizing 1 New Ayah",
    category: "quran",
    subCategory: "Qur'an Memorization",
    points: 20,
    penaltyPoints: 5,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Anytime",
    summary: "Memorize one new verse of the Qur'an each day.",
    howTo: [
      "Repeat a new verse until it is fully memorized.",
      "Understand its meaning and review it during optional prayers.",
    ],
    benefit: "Elevates spiritual status in Paradise and permanently preserves divine light within.",
    references: [
      {
        source: "Sunan Abi Dawud 1464",
        quote:
          "It will be said to the companion of the Qur'an: Recite and ascend, and recite as you used to recite in the world, for your rank will be at the last verse you recite.",
      },
      {
        source: "Jami' at-Tirmidhi 2914",
        quote: "The one who is proficient in the Qur'an will be with the noble, righteous scribes.",
      },
    ],
  },
  {
    id: "deed_quran_010",
    title: "Revision / Muraja'ah of Qur'an",
    category: "quran",
    subCategory: "Qur'an Maintenance",
    points: 45,
    penaltyPoints: 15,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "Anytime",
    summary: "Review previously memorized portions to prevent forgetting.",
    howTo: [
      "Systematically review previously memorized surahs or pages.",
      "Repeat until the recall is confident, to prevent forgetfulness.",
    ],
    benefit: "Protects sacred knowledge from slipping away and keeps the mind continuously tied to revelation.",
    references: [
      {
        source: "Sahih al-Bukhari 5031",
        quote:
          "The example of the one who recites the Qur'an and memorizes it is like the owner of tied camels: if he keeps holding them, he keeps them, and if he releases them, they go away.",
      },
    ],
  },
  {
    id: "deed_quran_014",
    title: "Reciting 100 Ayat in Night Prayer",
    category: "quran",
    subCategory: "Salah & Qur'an",
    points: 60,
    penaltyPoints: 15,
    frequencyLabel: "Daily",
    suggestedDays: DAILY,
    suggestedTime: "During night prayer",
    summary: "Recite 100 or more verses during night prayer.",
    howTo: ["During Tahajjud or Qiyam al-Layl, recite verses until reaching a total of 100 or more."],
    benefit: "Protects from being recorded among the negligent and places one among the devout.",
    references: [
      {
        source: "Sunan Abi Dawud 1398",
        quote: "Whoever recites one hundred verses in a night will not be recorded among the negligent.",
      },
    ],
  },

  // ---- 3. Fasting ----
  {
    id: "deed_fasting_001",
    title: "Fasting the Month of Ramadan",
    arabicName: "Sawm Ramadan",
    category: "fasting",
    subCategory: "Obligatory Fasting",
    points: 100,
    penaltyPoints: 50,
    frequencyLabel: "Annual",
    suggestedDays: DAILY,
    fixedDays: DAILY,
    suggestedTime: "Dawn to sunset, throughout Ramadan",
    summary: "Abstain from food, drink, and relations from dawn to sunset throughout Ramadan.",
    howTo: [
      "Abstain from food, drink, and marital relations from dawn (Fajr) until sunset (Maghrib) every day of Ramadan.",
      "Renew your intention each night and maintain good conduct and worship throughout the fast.",
    ],
    benefit:
      "Fulfills the fourth pillar of Islam, expiates past minor sins, and builds sustained God-consciousness.",
    references: [
      {
        source: "Surah Al-Baqarah 2:183",
        quote:
          "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.",
      },
    ],
  },
  {
    id: "deed_fasting_002",
    title: "Fasting Mondays and Thursdays",
    category: "fasting",
    subCategory: "Sunnah Fasting",
    points: 40,
    penaltyPoints: 10,
    frequencyLabel: "Weekly (2x)",
    suggestedDays: ["Mon", "Thu"],
    restrictedDays: ["Mon", "Thu"],
    suggestedTime: "Dawn to Maghrib",
    summary: "Fast every Monday and Thursday from dawn until Maghrib.",
    howTo: [
      "Fast from dawn (Fajr) until sunset (Maghrib) every Monday and Thursday.",
      "Make the intention the night before, or any time before midday if needed.",
    ],
    benefit: "Ensures your weekly deeds are presented to Allah while you are in a state of worship.",
    references: [
      {
        source: "Jami' at-Tirmidhi 747",
        quote:
          "Deeds are presented on Monday and Thursday, and I like for my deeds to be presented while I am fasting.",
      },
    ],
  },
  {
    id: "deed_fasting_003",
    title: "Fasting the White Days (Ayyam al-Beed)",
    arabicName: "Ayyam al-Beed",
    category: "fasting",
    subCategory: "Sunnah Fasting",
    points: 50,
    penaltyPoints: 10,
    frequencyLabel: "Monthly",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "13th, 14th & 15th of the lunar month",
    summary: "Fast on the 13th, 14th, and 15th of every Islamic lunar month.",
    howTo: ["Fast on the 13th, 14th, and 15th of every Islamic lunar month."],
    benefit: "Multiplies rewards tenfold, making three days of monthly fasting equal to perpetual reward.",
    references: [
      {
        source: "Sahih al-Bukhari 1975",
        quote:
          "The Prophet said to me: O Abu Dharr, if you fast three days of the month, then fast the thirteenth, the fourteenth, and the fifteenth.",
      },
    ],
  },
  {
    id: "deed_fasting_004",
    title: "Fasting the Day of Arafah",
    arabicName: "Sawm Arafah",
    category: "fasting",
    subCategory: "Voluntary Fasting",
    points: 100,
    penaltyPoints: 20,
    frequencyLabel: "Annual (9 Dhul-Hijjah)",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "9th of Dhul-Hijjah (non-pilgrims)",
    summary: "Fast on the 9th day of Dhul-Hijjah if not performing Hajj.",
    howTo: ["Fast on the 9th day of Dhul-Hijjah, the Day of Arafah, if you are not performing Hajj."],
    benefit: "Wipes away two full years of minor sins - the past year and the upcoming year.",
    references: [
      {
        source: "Sahih Muslim 1162",
        quote: "Fasting the day of Arafah, I hope, expiates for the year before it and the year after it.",
      },
    ],
  },
  {
    id: "deed_fasting_005",
    title: "Fasting Ashura & Tasu'a",
    arabicName: "Sawm Ashura",
    category: "fasting",
    subCategory: "Sunnah Fasting",
    points: 80,
    penaltyPoints: 15,
    frequencyLabel: "Annual (9-10 Muharram)",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "9th & 10th of Muharram",
    summary: "Fast the 10th of Muharram, preferably paired with the 9th.",
    howTo: [
      "Fast the 10th of Muharram (Ashura).",
      "Pair it with a fast on the 9th (Tasu'a) to differ from other communities.",
    ],
    benefit: "Expiates the minor sins of the past year and commemorates Allah saving Prophet Musa (AS).",
    references: [
      {
        source: "Sahih Muslim 1162",
        quote:
          "Fasting the day of Ashura, I hope that Allah will accept it as expiation for the year that came before it.",
      },
    ],
  },
  {
    id: "deed_fasting_006",
    title: "Fasting 6 Days of Shawwal",
    category: "fasting",
    subCategory: "Sunnah Fasting",
    points: 75,
    penaltyPoints: 15,
    frequencyLabel: "Annual (Shawwal)",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Any 6 days in Shawwal",
    summary: "Fast any 6 days during the lunar month of Shawwal after Eid al-Fitr.",
    howTo: [
      "Fast any 6 days during the month of Shawwal, after completing Ramadan and celebrating Eid al-Fitr.",
    ],
    benefit: "Yields the continuous reward of a full year of fasting when paired with Ramadan.",
    references: [
      {
        source: "Sahih Muslim 1164",
        quote:
          "Whoever fasts Ramadan and then follows it with six days of Shawwal, it is as if he fasted for a lifetime.",
      },
    ],
  },
  {
    id: "deed_fasting_007",
    title: "Fasting in the Month of Muharram",
    category: "fasting",
    subCategory: "Voluntary Fasting",
    points: 45,
    penaltyPoints: 10,
    frequencyLabel: "Annual (Muharram)",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Throughout Muharram",
    summary: "Observe voluntary fasts throughout the sacred month of Muharram.",
    howTo: ["Observe voluntary fasts on any days throughout the sacred month of Muharram."],
    benefit: "Secures the most virtuous voluntary fasts outside of Ramadan and honors Allah's sacred month.",
    references: [
      {
        source: "Sahih Muslim 1163",
        quote: "The best fasting after Ramadan is fasting in the month of Allah, Muharram.",
      },
    ],
  },
  {
    id: "deed_fasting_008",
    title: "Fasting during Sha'ban",
    category: "fasting",
    subCategory: "Sunnah Fasting",
    points: 45,
    penaltyPoints: 10,
    frequencyLabel: "Annual (Sha'ban)",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Throughout Sha'ban",
    summary: "Fast frequently throughout the month of Sha'ban preceding Ramadan.",
    howTo: ["Fast frequently throughout the month of Sha'ban in preparation for Ramadan."],
    benefit: "Prepares the soul for Ramadan and ensures annual deeds are raised while you are in worship.",
    references: [
      {
        source: "Sunan an-Nasa'i 2357",
        quote:
          "The Messenger of Allah used to fast until we thought he would never stop, and he would leave off fasting until we thought he would never fast; and I never saw him fast a complete month except Ramadan, nor did I see him fast more in any month than in Sha'ban.",
      },
    ],
  },
  {
    id: "deed_fasting_009",
    title: "Fasting First 9 Days of Dhul-Hijjah",
    category: "fasting",
    subCategory: "Voluntary Fasting",
    points: 60,
    penaltyPoints: 10,
    frequencyLabel: "Annual (1-9 Dhul-Hijjah)",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "1st-9th of Dhul-Hijjah",
    summary: "Fast during any or all of the first nine days of Dhul-Hijjah.",
    howTo: ["Fast on any or all of the first nine days of Dhul-Hijjah, the most virtuous days of the year."],
    benefit: "Maximizes rewards during the most sacred and virtuous ten days of the Islamic calendar.",
    references: [
      {
        source: "Sahih al-Bukhari 969",
        quote: "There are no days in which righteous deeds are more beloved to Allah than these ten days.",
      },
    ],
  },
  {
    id: "deed_fasting_010",
    title: "Fasting of Dawud (Alternate Days)",
    arabicName: "Sawm Dawud",
    category: "fasting",
    subCategory: "Voluntary Fasting",
    points: 90,
    penaltyPoints: 20,
    frequencyLabel: "Custom / Ongoing",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Every other day",
    summary: "Fast every other day consistently, without neglecting health or family rights.",
    howTo: [
      "Fast every alternate day, breaking your fast the following day.",
      "Maintain the pattern consistently without neglecting your health or the rights of your family.",
    ],
    benefit: "Represents the highest level of voluntary fasting, most beloved to Allah.",
    references: [
      {
        source: "Sahih al-Bukhari 3418",
        quote: "The most beloved fasting to Allah was the fasting of Dawud; he used to fast every alternate day.",
      },
    ],
  },
  {
    id: "deed_fasting_011",
    title: "Making Up Missed Fast (Qada)",
    arabicName: "Sawm al-Qada",
    category: "fasting",
    subCategory: "Obligatory Fasting",
    points: 80,
    penaltyPoints: 30,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Before the next Ramadan",
    summary: "Fast on any permissible day before the next Ramadan to make up missed obligatory days.",
    howTo: ["Fast on any permissible day before the following Ramadan begins, to make up each day missed."],
    benefit: "Fulfills a compulsory debt owed to Allah and removes accountability for missed fasts.",
    references: [
      {
        source: "Surah Al-Baqarah 2:185",
        quote: "And whoever is ill or on a journey - then an equal number of other days.",
      },
    ],
  },
  {
    id: "deed_fasting_012",
    title: "Fasting in the Sacred Months (Al-Ashhur Al-Hurum)",
    category: "fasting",
    subCategory: "Voluntary Fasting",
    points: 50,
    penaltyPoints: 10,
    frequencyLabel: "Seasonal",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "During Dhul-Qa'dah, Dhul-Hijjah, Muharram & Rajab",
    summary: "Observe voluntary fasts during Dhul-Qa'dah, Dhul-Hijjah, Muharram, and Rajab.",
    howTo: [
      "Observe voluntary fasts on any days during the four sacred months: Dhul-Qa'dah, Dhul-Hijjah, Muharram, and Rajab.",
    ],
    benefit: "Elevates good deeds during periods specially sanctified by Allah.",
    references: [
      {
        source: "Sunan Abi Dawud 2428",
        quote: "Fast some days of the sacred month, then leave off.",
      },
    ],
  },
  {
    id: "deed_fasting_013",
    title: "Expiation Fasting (Kaffarah)",
    arabicName: "Sawm al-Kaffarah",
    category: "fasting",
    subCategory: "Obligatory Expiation",
    points: 85,
    penaltyPoints: 40,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "As prescribed (e.g. 3 consecutive days)",
    summary: "Fast consecutive required days, such as 3 days for a broken oath, as prescribed by Sharia.",
    howTo: [
      "Fast the number of consecutive days prescribed by Sharia for the specific violation, such as 3 days for a broken oath.",
    ],
    benefit: "Atones for broken solemn oaths and deliberate religious violations.",
    references: [
      {
        source: "Surah Al-Ma'idah 5:89",
        quote: "But whoever cannot find [or afford it] - then a fast of three days.",
      },
    ],
  },
  {
    id: "deed_fasting_014",
    title: "Fasting for Unmarried Youth",
    category: "fasting",
    subCategory: "Sunnah Protection",
    points: 50,
    penaltyPoints: 10,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "Whenever needed",
    summary: "Fast voluntarily when unable to marry, to control physical desires and guard chastity.",
    howTo: [
      "Fast voluntarily whenever unable to marry, to help control physical desire and guard chastity.",
    ],
    benefit: "Acts as a spiritual shield against temptation and builds self-mastery.",
    references: [
      {
        source: "Sahih al-Bukhari 5066",
        quote:
          "O young men, whoever among you can afford marriage, let him marry, for it lowers the gaze and guards chastity. And whoever cannot, let him fast, for it is a shield for him.",
      },
    ],
  },
  {
    id: "deed_fasting_015",
    title: "Fasting of a Vow (Nadhr)",
    arabicName: "Sawm an-Nadhr",
    category: "fasting",
    subCategory: "Obligatory Vow",
    points: 70,
    penaltyPoints: 30,
    frequencyLabel: "As needed",
    suggestedDays: DAILY,
    flexibleSchedule: true,
    suggestedTime: "As pledged",
    summary: "Fast the specific number of days pledged to Allah upon fulfillment of a condition.",
    howTo: [
      "Fast the exact number of days you pledged to Allah once the condition of your vow has been fulfilled.",
    ],
    benefit: "Fulfills a binding religious covenant made directly with Allah.",
    references: [
      {
        source: "Surah Al-Hajj 22:29",
        quote: "...and let them fulfill their vows.",
      },
    ],
  },
]

export function getDeedById(id: string): Deed | undefined {
  return DEEDS.find((d) => d.id === id)
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!
}
