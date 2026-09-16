"use client";

import { useEffect, useState } from "react";
import WordleSettings, {
  DatabaseWord,
} from "./WordleSettings";
import WordlePreview from "./WordlePreview";
import { generateWordleHtml } from "@/utils/generateWordleHtml";
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
  const [words, setWords] = useState<DatabaseWord[]>([]);
  const [selectedWord, setSelectedWord] =
    useState<DatabaseWord | null>(null);
  const [loadingWords, setLoadingWords] = useState(!activityId);
  const [wordError, setWordError] = useState("");
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
          throw new Error(
            "The selected activity is not a Wordle activity"
          );
        }

        if (data.words.length === 0) {
          throw new Error(
            "This activity does not contain a target word"
          );
        }

        const targetWord = data.words[0].word;

        const targetPhonemes = targetWord.phonemes
          .slice()
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

  useEffect(() => {
    if (activityId) {
      return;
    }

    async function loadWords() {
      try {
        setLoadingWords(true);
        setWordError("");

        const response = await fetch("/api/words");

        if (!response.ok) {
          throw new Error(
            "Unable to load words from the database"
          );
        }

        const data: DatabaseWord[] = await response.json();
        setWords(data);
      } catch (error) {
        console.error(error);

        setWordError(
          error instanceof Error
            ? error.message
            : "Unable to load words from the database"
        );
      } finally {
        setLoadingWords(false);
      }
    }

    loadWords();
  }, [activityId]);

  const selectDatabaseWord = (word: DatabaseWord) => {
    const phonemes = word.phonemes
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((phoneme) => phoneme.symbol);

    setSelectedWord(word);
    setSelectedPhonemes(phonemes);
    setDifficulty(word.difficulty.toLowerCase());
    setGuesses([]);
    setCurrentGuess([]);
    setGameStatus("playing");
  };

  const createDatabaseWord = async (
    text: string,
    hint: string,
    phonemes: string[]
  ) => {
    const difficulty =
      phonemes.length === 3
        ? "EASY"
        : phonemes.length === 4
          ? "MEDIUM"
          : phonemes.length === 5
            ? "HARD"
            : null;

    if (!difficulty) {
      throw new Error(
        "A Wordle target must contain between 3 and 5 phonemes."
      );
    }

    const response = await fetch("/api/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        hint: hint.trim(),
        difficulty,
        phonemes,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ?? "Unable to create word."
      );
    }

    const createdWord = result as DatabaseWord;

    setWords((current) => [...current, createdWord]);

    selectDatabaseWord(createdWord);

    return createdWord;
  };

  const changeDifficulty = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    setSelectedWord(null);
    setSelectedPhonemes([]);
    setGuesses([]);
    setCurrentGuess([]);
    setGameStatus("playing");
  };

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

  const downloadSavedActivity = () => {
    if (!activity) {
      return;
    }

    const targetWord = activity.words[0]?.word;

    if (!targetWord) {
      return;
    }

    const phonemes = targetWord.phonemes
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((phoneme) => phoneme.symbol);

    const html = generateWordleHtml({
      name: activity.name,
      word: targetWord.text,
      phonemes,
    });

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeName =
      activity.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "wordle";

    link.href = url;
    link.download = `${safeName}.html`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
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
        
        {activity && (
          <button
            type="button"
            className={styles.downloadButton}
            onClick={downloadSavedActivity}
          >
            Download HTML
          </button>
        )}

      </header>

      <section className={styles.workspace}>
        {!activityId && (
          <div className={styles.panel}>
            <WordleSettings
              words={words}
              selectedWordId={selectedWord?.id ?? null}
              onWordSelect={selectDatabaseWord}
              onCreateWord={createDatabaseWord}
              difficulty={difficulty}
              onDifficultyChange={changeDifficulty}
              loadingWords={loadingWords}
              wordError={wordError}
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
            targetLength={targetLength}
            targetWord={
              activity
                ? activity.words[0].word.text
                : selectedWord?.text ?? ""
            }
          />
        </div>
      </section>
    </main>
  );
}