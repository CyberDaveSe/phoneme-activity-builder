"use client";

import { useState } from "react";
import WordSearchGrid, { WordTarget } from "./WordSearchGrid";
import styles from "./WordSearch.module.css";

const words: WordTarget[] = [
  { word: "bed", phonemes: ["b", "e", "d"] },
  { word: "thin", phonemes: ["θ", "ɪ", "n"] },
  { word: "ship", phonemes: ["ʃ", "ɪ", "p"] },
  { word: "jam", phonemes: ["dʒ", "æ", "m"] },
  { word: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
];

export default function WordSearchPreview() {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [resetVersion, setResetVersion] = useState(0);

  const handleWordFound = (wordKey: string) => {
    setFoundWords((current) => [...current, wordKey]);
  };

  const resetGame = () => {
    setFoundWords([]);
    setResetVersion((current) => current + 1);
  };

  return (
    <section>
      <h2>Preview</h2>

      <WordSearchGrid
        key={resetVersion}
        targetWords={words}
        foundWords={foundWords}
        onWordFound={handleWordFound}
      />

      <div className={styles.wordList}>
        <h3>Find these words</h3>

        <ul>
          {words.map((entry) => {
            const wordKey = entry.phonemes.join("|");
            const found = foundWords.includes(wordKey);

            return (
              <li
                key={entry.word}
                className={found ? styles.foundWord : ""}
              >
                {entry.phonemes.join(" ")}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        className={styles.controlButton}
        onClick={resetGame}
      >
        Reset Game
      </button>
    </section>
  );
}