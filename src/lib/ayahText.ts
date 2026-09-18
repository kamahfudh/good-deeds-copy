// A curated subset of verse text + translation for the tadabbur (reflection)
// preview card — not a full Mushaf. Only well-known, verified verses are
// included; anything outside this set intentionally shows no fabricated
// Arabic text (see TadabburCompose.tsx's fallback state) rather than risk an
// inaccurate rendering of the Qur'an.
export interface AyahText {
  arabic: string
  translation: string
}

const AYAH_TEXT: Record<string, AyahText> = {
  "1:1": { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
  "1:2": { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds." },
  "1:3": { arabic: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful." },
  "1:4": { arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
  "1:5": { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
  "1:6": { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path." },
  "1:7": {
    arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
  },
  "2:255": {
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
  },
  "73:1": { arabic: "يَا أَيُّهَا الْمُزَّمِّلُ", translation: "O you who wraps himself [in clothing]," },
  "73:2": { arabic: "قُمِ اللَّيْلَ إِلَّا قَلِيلًا", translation: "Stand (to pray) all night, except a little" },
  "94:5": { arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship [will be] ease." },
  "94:6": { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship [will be] ease." },
  "103:1": { arabic: "وَالْعَصْرِ", translation: "By time," },
  "103:2": { arabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", translation: "Indeed, mankind is in loss," },
  "103:3": {
    arabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    translation: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
  },
  "112:1": { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, He is Allah, [who is] One," },
  "112:2": { arabic: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
  "112:3": { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
  "112:4": { arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent." },
  "113:1": { arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, I seek refuge in the Lord of daybreak" },
  "113:2": { arabic: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
  "113:3": { arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
  "113:4": { arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots" },
  "113:5": { arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies." },
  "114:1": { arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, I seek refuge in the Lord of mankind," },
  "114:2": { arabic: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind," },
  "114:3": { arabic: "إِلَٰهِ النَّاسِ", translation: "The God of mankind," },
  "114:4": { arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the retreating whisperer -" },
  "114:5": { arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers [evil] into the breasts of mankind -" },
  "114:6": { arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among the jinn and mankind." },
}

export function getAyahText(surahNumber: number, ayah: number): AyahText | undefined {
  return AYAH_TEXT[`${surahNumber}:${ayah}`]
}
