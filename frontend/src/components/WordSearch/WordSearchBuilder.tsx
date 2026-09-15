"use client";

import { useEffect, useMemo, useState } from "react";
import WordSearchPreview from "./WordSearchPreview";
import { WordTarget } from "./WordSearchGrid";
import styles from "./WordSearch.module.css";

type StoredPhoneme = {
  id: number;
  symbol: string;
  position: number;
};

type StoredWord = {
  id: number;
  text: string;
  hint: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  phonemes: StoredPhoneme[];
};

type ActivityWord = {
  word: StoredWord;
};

type StoredActivity = {
  id: number;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hintsEnabled: boolean;
  words: ActivityWord[];
};

type WordSearchBuilderProps = {
  activityId?: string;
};

type SelectionMode = "MANUAL" | "RANDOM";
type RandomDifficulty = "MIXED" | "EASY" | "MEDIUM" | "HARD";

const MAX_SELECTED_WORDS = 10;

function mapStoredWordToTarget(word: StoredWord): WordTarget {
  return {
    word: word.text,
    hint: word.hint,
    phonemes: [...word.phonemes]
      .sort((a, b) => a.position - b.position)
      .map((phoneme) => phoneme.symbol),
  };
}

export default function WordSearchBuilder({
  activityId,
}: WordSearchBuilderProps) {
  const [activity, setActivity] =
    useState<StoredActivity | null>(null);

  const [words, setWords] = useState<StoredWord[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(Boolean(activityId));
  const [error, setError] = useState("");

  const [selectionMode, setSelectionMode] =
    useState<SelectionMode>("MANUAL");

  const [randomDifficulty, setRandomDifficulty] =
    useState<RandomDifficulty>("MIXED");

  const [randomWordCount, setRandomWordCount] = useState(5);

  useEffect(() => {
    if (activityId) {
      const loadActivity = async () => {
        try {
          setLoading(true);
          setError("");

          const response = await fetch(
            `/api/activities/${activityId}`
          );

          if (!response.ok) {
            const data = await response.json().catch(() => null);

            throw new Error(
              data?.error ?? "Failed to load Word Search activity"
            );
          }

          const data: StoredActivity = await response.json();

          if (data.type !== "WORD_SEARCH") {
            throw new Error(
              "The selected activity is not a Word Search activity."
            );
          }

          if (!data.words || data.words.length === 0) {
            throw new Error(
              "This Word Search activity does not contain any words."
            );
          }

          setActivity(data);
        } catch (error) {
          console.error(
            "Failed to load Word Search activity:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load Word Search activity"
          );
        } finally {
          setLoading(false);
        }
      };

      loadActivity();
      return;
    }

    const loadWords = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/words");

        if (!response.ok) {
          throw new Error("Failed to load stored words.");
        }

        const data: StoredWord[] = await response.json();

        setWords(data);
      } catch (error) {
        console.error("Failed to load words:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load stored words."
        );
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [activityId]);

  const savedTargetWords: WordTarget[] =
    activity?.words.map(({ word }) =>
      mapStoredWordToTarget(word)
    ) ?? [];

  const selectedWords = useMemo(
    () =>
      selectedWordIds
        .map((id) => words.find((word) => word.id === id))
        .filter((word): word is StoredWord => Boolean(word)),
    [selectedWordIds, words]
  );

  const builderTargetWords = useMemo(
    () => selectedWords.map(mapStoredWordToTarget),
    [selectedWords]
  );

  const filteredWords = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return words
      .filter((word) =>
        word.text.toLowerCase().includes(query)
      )
      .slice(0, 12);
  }, [searchText, words]);

  function addWord(wordId: number) {
    if (selectedWordIds.includes(wordId)) {
      return;
    }

    if (selectedWordIds.length >= MAX_SELECTED_WORDS) {
      setError(
        `A Word Search can contain up to ${MAX_SELECTED_WORDS} words.`
      );
      return;
    }

    setError("");

    setSelectedWordIds((current) => [
      ...current,
      wordId,
    ]);
  }

  function removeWord(wordId: number) {
    setSelectedWordIds((current) =>
      current.filter((id) => id !== wordId)
    );
  }

  function removeAllWords() {
    setSelectedWordIds([]);
  }

  function generateRandomWords() {
    setError("");

    const candidateWords =
      randomDifficulty === "MIXED"
        ? words
        : words.filter(
            (word) => word.difficulty === randomDifficulty
          );

    if (candidateWords.length === 0) {
      setError(
        "No stored words match the selected difficulty."
      );
      return;
    }

    const count = Math.min(
      randomWordCount,
      MAX_SELECTED_WORDS,
      candidateWords.length
    );

    const shuffled = [...candidateWords].sort(
      () => Math.random() - 0.5
    );

    const chosenIds = shuffled
      .slice(0, count)
      .map((word) => word.id);

    setSelectedWordIds(chosenIds);
  }

  if (loading) {
    return (
      <main>
        <header>
          <h1>Word Search Activity Builder</h1>
        </header>

        <p>Loading...</p>
      </main>
    );
  }

  if (error && activityId) {
    return (
      <main>
        <header>
          <h1>Word Search Activity Builder</h1>
        </header>

        <p role="alert">{error}</p>
      </main>
    );
  }

  if (activity) {
    return (
      <main>
        <header>
          <h1>{activity.name}</h1>

          <p>
            Complete the saved phoneme word search activity.
          </p>
        </header>

        <WordSearchPreview
          targetWords={savedTargetWords}
          hintsEnabled={activity.hintsEnabled}
        />

        <p>
          Activity difficulty:{" "}
          <strong>{activity.difficulty}</strong>
        </p>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Word Search Activity Builder</h1>

        <p>
          Create a phoneme-based word search activity for
          classroom use.
        </p>
      </header>

        <section>
          <h2>Word Selection</h2>

          <div className={styles.selectionModes}>
            <label className={styles.modeOption}>
              <input
                type="radio"
                name="selectionMode"
                value="MANUAL"
                checked={selectionMode === "MANUAL"}
                onChange={() => {
                  setSelectionMode("MANUAL");
                  setError("");
                }}
              />
              Search and choose
            </label>

            <label className={styles.modeOption}>
              <input
                type="radio"
                name="selectionMode"
                value="RANDOM"
                checked={selectionMode === "RANDOM"}
                onChange={() => {
                  setSelectionMode("RANDOM");
                  setError("");
                }}
              />
              Random selection
            </label>
          </div>

          {selectionMode === "MANUAL" && (
            <>
              <h3>Choose Words</h3>

              <p>
                Search the stored word library and choose up to{" "}
                {MAX_SELECTED_WORDS} words.
              </p>

              <label className={styles.builderField}>
                Search library
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="Search English word..."
                />
              </label>

              {searchText.trim() && (
                <div>
                  <h3>Search Results</h3>

                  {filteredWords.length === 0 ? (
                    <p>
                      No matching stored words were found.
                    </p>
                  ) : (
                    <ul className={styles.wordResults}>
                      {filteredWords.map((word) => {
                        const selected =
                          selectedWordIds.includes(word.id);

                        return (
                          <li 
                            key={word.id}
                            className={styles.wordResult}
                          >
                            <strong>{word.text}</strong>{" "}
                            /{" "}
                            {[...word.phonemes]
                              .sort(
                                (a, b) =>
                                  a.position - b.position
                              )
                              .map(
                                (phoneme) => phoneme.symbol
                              )
                              .join(" ")}
                            /{" "}
                            <button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() => addWord(word.id)}
                              disabled={selected}
                            >
                              {selected
                                ? "Selected"
                                : "Add"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}

          {selectionMode === "RANDOM" && (
            <>
              <h3>Random Selection</h3>

              <div className={styles.builderControls}>
                <label className={styles.builderField}>

                  Difficulty
                  <select
                    value={randomDifficulty}
                    onChange={(event) =>
                      setRandomDifficulty(
                        event.target
                          .value as RandomDifficulty
                      )
                    }
                  >
                    <option value="MIXED">Mixed</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </label>

                <label className={styles.builderField}>
                  Number of words
                  <select
                    value={randomWordCount}
                    onChange={(event) =>
                      setRandomWordCount(
                        Number(event.target.value)
                      )
                    }
                  >
                    {Array.from(
                      { length: MAX_SELECTED_WORDS },
                      (_, index) => index + 1
                    ).map((count) => (
                      <option
                        key={count}
                        value={count}
                      >
                        {count}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={generateRandomWords}
                >
                  Generate Random Words
                </button>
              </div>
            </>
          )}

          <div>
            <h3>
              Selected Words ({selectedWords.length} /{" "}
              {MAX_SELECTED_WORDS})
            </h3>

            {selectedWords.length === 0 ? (
              <p>No words selected yet.</p>
            ) : (
              <>
                <div className={styles.controls}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={removeAllWords}
                  >
                    Remove All
                  </button>
                </div>
             
              <ul className={styles.selectedWords}>
                {selectedWords.map((word) => (
                  <li 
                    key={word.id}
                    className={styles.selectedWord}
                  >
                    <strong>{word.text}</strong>{" "}
                    /{" "}
                    {[...word.phonemes]
                      .sort(
                        (a, b) =>
                          a.position - b.position
                      )
                      .map(
                        (phoneme) =>
                          phoneme.symbol
                      )
                      .join(" ")}
                    /{" "}
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() =>
                        removeWord(word.id)
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
            )}
          </div>

          {error && (
            <p role="alert">{error}</p>
          )}
        </section>


      {builderTargetWords.length > 0 && (
        <WordSearchPreview
          targetWords={builderTargetWords}
          hintsEnabled={false}
        />
      )}
    </main>
  );
}