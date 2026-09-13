"use client";

import { useEffect, useState } from "react";
import WordleSettings from "./WordleSettings";
import WordlePreview from "./WordlePreview";
import styles from "@/app/wordle/Wordle.module.css";

type GuessResult = {
  phoneme: string;
  status: "correct" | "present" | "absent";
};

type GameStatus = "playing" | "won" | "lost";

type ActivityPhoneme = {
  id: number;
  symbol: string;
  position: number;
  wordId: number;
};

type ActivityWord = {
  activityId: number;
  wordId: number;
  word: {
    id: number;
    text: string;
    hint: string | null;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    phonemes: ActivityPhoneme[];
  };
};

type Activity = {
  id: number;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hintsEnabled: boolean;
  words: ActivityWord[];
};

type WordleBuilderProps = {
  activityId?: string;
};

export default function WordleBuilder({
  activityId,
}: WordleBuilderProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(Boolean(activityId));
  const [activityError, setActivityError] = useState("");

  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<GuessResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("medium");
  
  const [gameStatus, setGameStatus] =
    useState<GameStatus>("playing");

  useEffect(() => {
    if (!activityId) {
      return;
    }

    async function loadActivity() {
      try {
        setLoadingActivity(true);
        setActivityError("");

        const response = await fetch(`/api/activities/${activityId}`);

        if (!response.ok) {
          throw new Error("Unable to load activity");
        }

        const data: Activity = await response.json();

        if (data.type !== "WORDLE") {
          throw new Error("The selected activity is not a Wordle activity");
        }

        if (data.words.length === 0) {
          throw new Error("This activity does not contain a target word");
        }

        const targetWord = data.words[0].word;
        const targetPhonemes = targetWord.phonemes
          .sort((a, b) => a.position - b.position)
          .map((phoneme) => phoneme.symbol);

        setActivity(data);
        setSelectedPhonemes(targetPhonemes);
        setDifficulty(data.difficulty.toLowerCase());
        setGuesses([]);
        setCurrentGuess([]);
        setGameStatus("playing");
      } catch (error) {
        console.error(error);

        setActivityError(
          error instanceof Error
            ? error.message
            : "Unable to load activity"
        );
      } finally {
        setLoadingActivity(false);
      }
    }

    loadActivity();
  }, [activityId]);

  const targetPhonemes =
    activity?.words[0]?.word.phonemes
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((phoneme) => phoneme.symbol) ?? selectedPhonemes;

  const targetLength = targetPhonemes.length;

  const gameplayDifficulty =
  targetLength === 3
    ? "easy"
    : targetLength === 4
      ? "medium"
      : targetLength === 5
        ? "hard"
        : difficulty;

  const addPhoneme = (phoneme: string) => {
    if (activityId) {
      return;
    }

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
      if (
        targetLength === 0 ||
        current.length >= targetLength
      ) {
        return current;
      }

      return [...current, phoneme];
    });
  };

  const clearCurrentGuess = () => {
    setCurrentGuess([]);
  };

  const submitGuess = () => {
    if (
      gameStatus !== "playing" ||
      targetLength === 0 ||
      currentGuess.length !== targetLength
    ) {
      return;
    }

    if (guesses.length >= 6) {
      return;
    }

    const remainingTarget = [...targetPhonemes];

    const results: GuessResult[] = currentGuess.map(
      (phoneme, index) => {
        if (phoneme === targetPhonemes[index]) {
          remainingTarget[index] = "";

          return {
            phoneme,
            status: "correct",
          };
        }

        return {
          phoneme,
          status: "absent",
        };
      }
    );

    results.forEach((result, index) => {
      if (result.status === "correct") {
        return;
      }

      const targetIndex = remainingTarget.indexOf(
        currentGuess[index]
      );

      if (targetIndex !== -1) {
        result.status = "present";
        remainingTarget[targetIndex] = "";
      }
    });

    const isCorrect = currentGuess.every(
      (phoneme, index) =>
        phoneme === targetPhonemes[index]
    );

    const nextGuessCount = guesses.length + 1;

    setGuesses((current) => [...current, results]);
    setCurrentGuess([]);

    if (isCorrect) {
      setGameStatus("won");
    } else if (nextGuessCount >= 6) {
      setGameStatus("lost");
    }
  };

  const startOver = () => {
    setGuesses([]);
    setCurrentGuess([]);
    setGameStatus("playing");
  };

  const clearPhonemes = () => {
    if (!activityId) {
      setSelectedPhonemes([]);
    }
  };

  if (loadingActivity) {
    return (
      <main className={styles.builder}>
        <p>Loading saved Wordle activity...</p>
      </main>
    );
  }

  if (activityError) {
    return (
      <main className={styles.builder}>
        <h1>Unable to open activity</h1>
        <p>{activityError}</p>
      </main>
    );
  }

  return (
    <main className={styles.builder}>
      <header className={styles.header}>
        <h1>
          {activity
            ? activity.name
            : "Wordle Activity Builder"}
        </h1>

        <p>
          {activity
            ? `Target word: ${activity.words[0].word.text}`
            : "Create a phoneme-based Wordle activity for classroom use."}
        </p>

        {activity?.hintsEnabled &&
          activity.words[0].word.hint && (
            <p>
              <strong>Hint:</strong>{" "}
              {activity.words[0].word.hint}
            </p>
          )}
      </header>

      <section className={styles.workspace}>
        {!activityId && (
          <div className={styles.panel}>
            <WordleSettings
              selectedPhonemes={selectedPhonemes}
              onAddPhoneme={addPhoneme}
              onClearPhonemes={clearPhonemes}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
            />
          </div>
        )}

        <div className={styles.panel}>
          <WordlePreview
            selectedPhonemes={selectedPhonemes}
            difficulty={activity ? gameplayDifficulty : difficulty}
            guesses={guesses}
            currentGuess={currentGuess}
            onAddGuessPhoneme={addGuessPhoneme}
            onClearCurrentGuess={clearCurrentGuess}
            onSubmitGuess={submitGuess}
            onStartOver={startOver}
            gameStatus={gameStatus}
            targetWord={
              activity
                ? activity.words[0].word.text
                : ""
            }
          />
        </div>
      </section>
    </main>
  );
}