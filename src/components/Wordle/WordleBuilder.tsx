"use client";

import { useState } from "react";
import WordleSettings from "./WordleSettings";
import WordlePreview from "./WordlePreview";
import { wordleTarget } from "@/data/wordleTarget";
import styles from "@/app/wordle/Wordle.module.css";
import { generateWordleHtml } from "@/utils/generateWordleHtml";

type GuessResult = {
  phoneme: string;
  status: "correct" | "present" | "absent";
};

export default function WordleBuilder() {
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
  
  const [guesses, setGuesses] = useState<GuessResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);

  const [difficulty, setDifficulty] = useState("medium");
  
  const [gameStatus, setGameStatus] = useState<
    "playing" | "won" | "lost"
  >("playing");

  const generateActivity = () => {
    const html = generateWordleHtml();

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "phoneme-wordle.html";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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
    if (gameStatus !== "playing") {
          return;
        }
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
    if (gameStatus !== "playing") {
      return;
    }

    if (currentGuess.length !== 3) {
      return;
    }

    if (guesses.length >= 6) {
      return;
    }
    
    const target = wordleTarget.phonemes;

    const results: GuessResult[] = currentGuess.map((phoneme) => ({
      phoneme,
      status: "absent",
    }));

    const remainingTargetPhonemes: string[] = [];

    currentGuess.forEach((phoneme, index) => {
      if (phoneme === target[index]) {
        results[index].status = "correct";
      } else {
        remainingTargetPhonemes.push(target[index]);
      }
    });

    currentGuess.forEach((phoneme, index) => {
      if (results[index].status === "correct") {
        return;
      }

      const matchingIndex = remainingTargetPhonemes.indexOf(phoneme);

      if (matchingIndex !== -1) {
        results[index].status = "present";
        remainingTargetPhonemes.splice(matchingIndex, 1);
      }
    });
    
    const isCorrect = currentGuess.every(
      (phoneme, index) => phoneme === target[index]
    );

    const nextGuessCount = guesses.length + 1;

    if (isCorrect) {
      setGameStatus("won");
    } else if (nextGuessCount >= 6) {
      setGameStatus("lost");
    }

    setGuesses((current) => [...current, results]);
    setCurrentGuess([]);
    };

    const startOver = () => {
      setGuesses([]);
      setCurrentGuess([]);
      setGameStatus("playing");
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
            gameStatus={gameStatus}
            targetWord={wordleTarget.word}
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