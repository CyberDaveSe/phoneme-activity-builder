"use client";

import { useState } from "react";
import WordleSettings from "./WordleSettings";
import WordlePreview from "./WordlePreview";
import { wordleTarget } from "@/data/wordleTarget";
import styles from "@/app/wordle/Wordle.module.css";

export default function WordleBuilder() {
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
  
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);

  const [difficulty, setDifficulty] = useState("medium");
  
  const generateActivity = () => {
  setSelectedPhonemes(wordleTarget.phonemes);
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

  const addGuessPhoneme = (phoneme: string) => {
    setCurrentGuess((current) => {
      if (current.length >= 3) {
        return current;
    }
  
      return [...current, phoneme];
    });
  };
  
  const clearCurrentGuess = () => {
    setCurrentGuess([]);
  };

  const submitGuess = () => {
    if (currentGuess.length !== wordleTarget.phonemes.length) {
      return;
    }

    if (guesses.length >= 6) {
      return;
    }

    setGuesses((current) => [...current, currentGuess]);
    setCurrentGuess([]);
  };

  const startOver = () => {
    setGuesses([]);
    setCurrentGuess([]);
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
            guesses={guesses}
            currentGuess={currentGuess}
            onAddGuessPhoneme={addGuessPhoneme}
            onClearCurrentGuess={clearCurrentGuess}
            onSubmitGuess={submitGuess}
            onStartOver={startOver}
        />
        </div>
      </section>

      <button
        type="button"
        className={styles.generateButton}
        onClick={generateActivity}
      >
        Generate Activity
      </button>

    </main>
  );
}