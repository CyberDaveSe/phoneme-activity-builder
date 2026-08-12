export type Phoneme = {
  symbol: string;
  label?: string;
  example?: string;
};

export const phonemeRows: Phoneme[][] = [
  [
    { symbol: "p", label: "P", example: "plug" },
    { symbol: "t", label: "T", example: "tent" },
    { symbol: "k", label: "K", example: "crab" },
  ],
  [
    { symbol: "b", label: "B", example: "bark" },
    { symbol: "d", label: "D", example: "desk" },
    { symbol: "ɡ", label: "G", example: "gum" },
  ],
  [
    { symbol: "n", label: "N", example: "sun" },
    { symbol: "m", label: "M", example: "milk" },
    { symbol: "ŋ", label: "NG", example: "bank" },
  ],

  [
    { symbol: "f", label: "F", example: "fan" },
    { symbol: "s", label: "S", example: "sun" },
    { symbol: "θ", label: "TH", example: "thrust" },
    { symbol: "ʃ", label: "SH", example: "shrimp" },
  ],
  [
    { symbol: "v", label: "V", example: "van" },
    { symbol: "z", label: "Z", example: "zip" },
    { symbol: "ð", label: "TH", example: "then" },
    { symbol: "ʒ", label: "ZH", example: "measure" },
  ],

  [
    { symbol: "l", label: "L", example: "lamp" },
    { symbol: "ɹ", label: "R", example: "crab" },
    { symbol: "w", label: "W", example: "win" },
    { symbol: "j", label: "Y", example: "yes" },
  ],
  [
    { symbol: "h", label: "H", example: "hat" },
    { symbol: "tʃ", label: "CH", example: "chin" },
    { symbol: "dʒ", label: "J", example: "jump" },
  ],

  [
    { symbol: "iː", label: "EE", example: "street" },
    { symbol: "ɪ", label: "I", example: "milk" },
    { symbol: "e", label: "E", example: "desk" },
    { symbol: "eː", label: "AIR" },
  ],
  [
    { symbol: "æ", label: "A", example: "bad" },
    { symbol: "ɐ", label: "U", example: "sun" },
    { symbol: "ɐː", label: "AR", example: "bark" },
    { symbol: "ɜː", label: "ER", example: "bird" },
  ],
  [
    { symbol: "ʉː", label: "OO", example: "boot" },
    { symbol: "ɔ", label: "O", example: "stop" },
    { symbol: "oː", label: "OR", example: "fork" },
    { symbol: "ʊ", label: "OO", example: "book" },
  ],

  [
    { symbol: "æɪ", label: "AY", example: "train" },
    { symbol: "ɑe", label: "I", example: "bike" },
    { symbol: "oɪ", label: "OY", example: "choice" },
    { symbol: "əʉ", label: "OA", example: "boat" },
  ],
  [
    { symbol: "æɔ", label: "OW", example: "cloud" },
    { symbol: "ɪə", label: "EAR", example: "beard" },
    { symbol: "ə", label: "UH" },
  ],
];