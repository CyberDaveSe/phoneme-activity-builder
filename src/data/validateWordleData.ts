import { phonemeRows } from "./phonemes";
import { wordleWords } from "./wordleWords";

const keyboardPhonemes = new Set(
  phonemeRows.flat().map((phoneme) => phoneme.symbol)
);

const expectedLengths = {
  easy: 3,
  medium: 4,
  hard: 5,
};

const difficultyCounts = {
  easy: 0,
  medium: 0,
  hard: 0,
};

let errors = 0;

for (const entry of wordleWords) {
  difficultyCounts[entry.difficulty]++;

  const expectedLength = expectedLengths[entry.difficulty];

  if (entry.phonemes.length !== expectedLength) {
    console.error(
      `${entry.word}: expected ${expectedLength} phonemes, found ${entry.phonemes.length}`
    );

    errors++;
  }

  for (const phoneme of entry.phonemes) {
    if (!keyboardPhonemes.has(phoneme)) {
      console.error(
        `${entry.word}: phoneme "${phoneme}" is not in the keyboard`
      );

      errors++;
    }
  }
}

for (const difficulty of ["easy", "medium", "hard"] as const) {
  if (difficultyCounts[difficulty] !== 30) {
    console.error(
      `${difficulty}: expected 30 words, found ${difficultyCounts[difficulty]}`
    );

    errors++;
  }
}

if (errors === 0) {
  console.log("Wordle data validation passed.");
  console.log(`Easy: ${difficultyCounts.easy}`);
  console.log(`Medium: ${difficultyCounts.medium}`);
  console.log(`Hard: ${difficultyCounts.hard}`);
  console.log(`Total: ${wordleWords.length}`);
} else {
  console.error(`Wordle data validation failed with ${errors} error(s).`);
}