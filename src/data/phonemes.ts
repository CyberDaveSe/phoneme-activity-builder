export type Phoneme = {
  symbol: string;
  label?: string;
};

export const phonemeRows: Phoneme[][] = [
  [
    { symbol: "p", label: "P" },
    { symbol: "t", label: "T" },
    { symbol: "k", label: "K" },
  ],
  [
    { symbol: "b", label: "B" },
    { symbol: "d", label: "D" },
    { symbol: "ɡ", label: "G" },
  ],
  [
    { symbol: "n", label: "N" },
    { symbol: "m", label: "M" },
    { symbol: "ŋ", label: "NG" },
  ],

  [
    { symbol: "f", label: "F" },
    { symbol: "s", label: "S" },
    { symbol: "θ", label: "TH" },
    { symbol: "ʃ", label: "SH" },
  ],
  [
    { symbol: "v", label: "V" },
    { symbol: "z", label: "Z" },
    { symbol: "ð", label: "TH" },
    { symbol: "ʒ", label: "ZH" },
  ],

  [
    { symbol: "l", label: "L" },
    { symbol: "ɹ", label: "R" },
    { symbol: "w", label: "W" },
    { symbol: "j", label: "Y" },
  ],
  [
    { symbol: "h", label: "H" },
    { symbol: "tʃ", label: "CH" },
    { symbol: "dʒ", label: "J" },
  ],

  [
    { symbol: "iː", label: "EE" },
    { symbol: "ɪ", label: "I" },
    { symbol: "e", label: "E" },
    { symbol: "eː", label: "AIR" },
  ],
  [
    { symbol: "æ", label: "A" },
    { symbol: "ɐ", label: "U" },
    { symbol: "ɐː", label: "AR" },
    { symbol: "ɜː", label: "ER" },
  ],
  [
    { symbol: "ʉː", label: "OO" },
    { symbol: "ɔ", label: "O" },
    { symbol: "oː", label: "OR" },
    { symbol: "ʊ", label: "OO" },
  ],

  [
    { symbol: "æɪ", label: "AY" },
    { symbol: "ɑe", label: "I" },
    { symbol: "oɪ", label: "OY" },
    { symbol: "əʉ", label: "OA" },
  ],
  [
    { symbol: "æɔ", label: "OW" },
    { symbol: "ɪə", label: "EAR" },
    { symbol: "ə", label: "UH" },
  ],
];