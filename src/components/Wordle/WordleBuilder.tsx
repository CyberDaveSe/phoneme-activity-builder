"use client";

import { useState } from "react";
import WordleSettings from "./WordleSettings";
import WordlePreview from "./WordlePreview";
import { wordleWords } from "@/data/wordleWords";
import styles from "@/app/wordle/Wordle.module.css";

export default function WordleBuilder() {
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);

  const [difficulty, setDifficulty] = useState("medium");

  const [targetWord, setTargetWord] = useState<string | null>(null);

  const availableWords = wordleWords.filter(
    (entry) => entry.difficulty === difficulty
  );

  const generateActivity = () => {
    if (availableWords.length === 0) {
        return;
    }

  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const selectedWord = availableWords[randomIndex];

  setTargetWord(selectedWord.word);
  setSelectedPhonemes(selectedWord.phonemes);
};

  const addPhoneme = (phoneme: string) => {
   setSelectedPhonemes((current) => {
     const maximumLength =
       difficulty === "easy"
         ? 3
         : difficulty === "medium"
           ? 4
           : 5;

     if (current.length >= maximumLength) {
       return current;
     }

     return [...current, phoneme];
   });
  };

   const clearPhonemes = () => {
    setSelectedPhonemes([]);
  };

  return (
    <main className={styles.builder}>
      <header className={styles.header}>
        <h1>Wordle Activity Builder</h1>

        <p>
          Create a phoneme-based Wordle activity for classroom use.
        </p>
      </header>

      <section className={styles.workspace}>
        <div className={styles.panel}>
          <WordleSettings
            selectedPhonemes={selectedPhonemes}
            onAddPhoneme={addPhoneme}
            onClearPhonemes={clearPhonemes}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
        </div>

        <div className={styles.panel}>
          <WordlePreview 
            selectedPhonemes={selectedPhonemes}
            difficulty={difficulty} 
        />
        </div>
      </section>
    </main>
  );
}