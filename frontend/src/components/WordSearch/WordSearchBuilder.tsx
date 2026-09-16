"use client";

import { useEffect, useMemo, useState } from "react";
import WordSearchPreview from "./WordSearchPreview";
import { WordTarget } from "./WordSearchGrid";
import PhonemeButton from "@/components/Wordle/PhonemeButton";
import { phonemeRows } from "@/data/phonemes";
import { generateWordSearchHtml } from "@/utils/generateWordSearchHtml";
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
  board: string[][] | null;
  words: ActivityWord[];
};

type WordSearchBuilderProps = {
  activityId?: string;
  editMode?: boolean;
};

type SelectionMode = "MANUAL" | "RANDOM";
type RandomDifficulty = "MIXED" | "EASY" | "MEDIUM" | "HARD";

const MAX_SELECTED_WORDS = 10;

function getDifficultyFromPhonemeCount(
  count: number
): StoredWord["difficulty"] | null {
  if (count === 3) return "EASY";
  if (count === 4) return "MEDIUM";
  if (count === 5) return "HARD";

  return null;
}

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
  editMode = false,
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
  const [activityName, setActivityName] = useState("");
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [activityMessage, setActivityMessage] = useState("");
  const [currentBoard, setCurrentBoard] =
    useState<string[][] | null>(null);

  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [newWordText, setNewWordText] = useState("");
  const [newWordHint, setNewWordHint] = useState("");
  const [newWordPhonemes, setNewWordPhonemes] = useState<string[]>([]);
  const [savingWord, setSavingWord] = useState(false);
  const [wordFormError, setWordFormError] = useState("");

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

          if (
            !Array.isArray(data.board) ||
            data.board.length === 0
          ) {
            throw new Error(
              "This saved Word Search activity does not contain a persisted board."
            );
          }

          if (editMode) {
            setActivity(null);
            setActivityName(data.name);
            setHintsEnabled(data.hintsEnabled);
            setSelectedWordIds(
              data.words.map(({ word }) => word.id)
            );
            setCurrentBoard(data.board);

            const wordsResponse = await fetch("/api/words");

            if (!wordsResponse.ok) {
              throw new Error(
                "Failed to load the word library for editing."
              );
            }

            const allWords: StoredWord[] =
              await wordsResponse.json();

            setWords(allWords);
          } else {
            setActivity(data);
          }

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

    setActivity(null);
    setCurrentBoard(null);
    setSelectedWordIds([]);
    setActivityName("");
    setHintsEnabled(false);
    setActivityMessage("");
    setError("");

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
  }, [activityId, editMode]);

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

  function openAddWordModal() {
    const proposedWord = searchText.trim();

    if (!proposedWord) {
      return;
    }

    setNewWordText(proposedWord);
    setNewWordHint("");
    setNewWordPhonemes([]);
    setWordFormError("");
    setShowAddWordModal(true);
  }

  function closeAddWordModal() {
    if (savingWord) {
      return;
    }

    setShowAddWordModal(false);
    setNewWordText("");
    setNewWordHint("");
    setNewWordPhonemes([]);
    setWordFormError("");
  }

  function addNewWordPhoneme(symbol: string) {
    if (newWordPhonemes.length >= 5) {
      setWordFormError(
        "Words can contain a maximum of 5 phonemes."
      );
      return;
    }

    setWordFormError("This activity builder supports a maximum of 5 phonemes per word.");
    setNewWordPhonemes((current) => [...current, symbol]);
  }

  function removeNewWordPhoneme(index: number) {
    setWordFormError("");

    setNewWordPhonemes((current) =>
      current.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  }

  async function saveNewWord() {
    const trimmedWord = newWordText.trim();

    if (!trimmedWord) {
      setWordFormError("Enter a word.");
      return;
    }

    const difficulty = getDifficultyFromPhonemeCount(
      newWordPhonemes.length
    );

    if (!difficulty) {
      setWordFormError(
        "Select between 3 and 5 phonemes."
      );
      return;
    }

    if (selectedWordIds.length >= MAX_SELECTED_WORDS) {
      setWordFormError(
        `A Word Search can contain up to ${MAX_SELECTED_WORDS} words.`
      );
      return;
    }

    try {
      setSavingWord(true);
      setWordFormError("");

      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedWord,
          hint: newWordHint.trim(),
          difficulty,
          phonemes: newWordPhonemes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Failed to create word."
        );
      }

      const createdWord = result as StoredWord;

      setWords((current) => [
        ...current,
        createdWord,
      ]);

      setSelectedWordIds((current) => [
        ...current,
        createdWord.id,
      ]);

      setSearchText("");
      setShowAddWordModal(false);
      setNewWordText("");
      setNewWordHint("");
      setNewWordPhonemes([]);
    } catch (error) {
      console.error("Failed to create word:", error);

      setWordFormError(
        error instanceof Error
          ? error.message
          : "Unable to create word."
      );
    } finally {
      setSavingWord(false);
    }
  }  

  function getWordSearchDifficulty():
    "EASY" | "MEDIUM" | "HARD" {
    if (
      selectionMode === "RANDOM" &&
      randomDifficulty !== "MIXED"
    ) {
      return randomDifficulty;
    }

    if (
      selectedWords.some(
        (word) => word.difficulty === "HARD"
      )
    ) {
      return "HARD";
    }

    if (
      selectedWords.some(
        (word) => word.difficulty === "MEDIUM"
      )
    ) {
      return "MEDIUM";
    }

    return "EASY";
  }

  async function saveActivity() {
    if (!activityName.trim()) {
      setError("Enter an activity name.");
      return;
    }

    if (selectedWordIds.length === 0) {
      setError("Select at least one word.");
      return;
    }

    if (!currentBoard) {
      setError(
        "The Word Search board has not been generated yet."
      );
      return;
    }

    try {
      setSavingActivity(true);
      setError("");
      setActivityMessage("");

      const endpoint =
        editMode && activityId
          ? `/api/activities/${activityId}`
          : "/api/activities";

      const response = await fetch(endpoint, {
        method: editMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: activityName.trim(),
          type: "WORD_SEARCH",
          difficulty: getWordSearchDifficulty(),
          hintsEnabled,
          wordIds: selectedWordIds,
          board: currentBoard,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Failed to save activity."
        );
      }

      setActivityMessage(
        editMode
          ? `Activity "${result.name}" updated successfully.`
          : `Activity "${result.name}" saved successfully.`
      );
    } catch (error) {
      console.error("Failed to save activity:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save activity."
      );
    } finally {
      setSavingActivity(false);
    }
  }

  function downloadSavedActivity() {
    if (!activity || !activity.board) {
      return;
    }

    const html = generateWordSearchHtml({
      name: activity.name,
      board: activity.board,
      hintsEnabled: activity.hintsEnabled,
      words: savedTargetWords.map((target) => ({
        word: target.word,
        phonemes: target.phonemes,
      })),
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
        .replace(/^-|-$/g, "") || "word-search";

    link.href = url;
    link.download = `${safeName}.html`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
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
          initialBoard={activity.board ?? undefined}
          allowRecreate={false}
        />

        <p>
          Activity difficulty:{" "}
          <strong>{activity.difficulty}</strong>
        </p>

        <button
          type="button"
          className={styles.actionButton}
          onClick={downloadSavedActivity}
        >
          Download HTML
        </button>

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
                    <div>
                      <p>
                        No matching stored words were found.
                      </p>

                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={openAddWordModal}
                      >
                        + Add &quot;{searchText.trim()}&quot; to library
                      </button>
                    </div>
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

          <div className={styles.activitySettings}>
            <h3>Activity Settings</h3>

            <label className={styles.builderField}>
              Activity name
              <input
                type="text"
                value={activityName}
                onChange={(event) =>
                  setActivityName(event.target.value)
                }
                placeholder="e.g. Week 3 Word Search"
              />
            </label>

            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={hintsEnabled}
                onChange={(event) =>
                  setHintsEnabled(event.target.checked)
                }
              />
              Enable hints
            </label>

            <p>
              Saved difficulty:{" "}
              <strong>
                {getWordSearchDifficulty()
                  .toLowerCase()
                  .replace(/^./, (letter) =>
                    letter.toUpperCase()
                  )}
              </strong>
            </p>

            <button
              type="button"
              className={styles.actionButton}
              onClick={saveActivity}
              disabled={
                savingActivity ||
                selectedWordIds.length === 0
              }
            >
              {savingActivity
                ? editMode
                  ? "Updating..."
                  : "Saving..."
                : editMode
                  ? "Update Activity"
                  : "Save Activity"}
            </button>
          </div>

          {activityMessage && (
            <p role="status">{activityMessage}</p>
          )}

          {error && (
            <p role="alert">{error}</p>
          )}
        </section>


      {builderTargetWords.length > 0 && (
        <WordSearchPreview
          targetWords={builderTargetWords}
          hintsEnabled={hintsEnabled}
          initialBoard={
            editMode && currentBoard
              ? currentBoard
              : undefined
          }
          onBoardChange={setCurrentBoard}
        />
      )}

      {showAddWordModal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddWordModal();
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-word-title"
          >
            <div className={styles.modalHeader}>
              <h2 id="add-word-title">Add New Word</h2>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeAddWordModal}
                disabled={savingWord}
                aria-label="Close add word dialog"
              >
                ×
              </button>
            </div>

            <label className={styles.builderField}>
              Word
              <input
                type="text"
                value={newWordText}
                onChange={(event) =>
                  setNewWordText(event.target.value)
                }
                disabled={savingWord}
              />
            </label>

            <label className={styles.builderField}>
              Hint (optional)
              <input
                type="text"
                value={newWordHint}
                onChange={(event) =>
                  setNewWordHint(event.target.value)
                }
                disabled={savingWord}
              />
            </label>

            <div className={styles.modalPhonemes}>
              <h3>Phonemes</h3>

              <p>
                Select each phoneme in the order it occurs
                in the word.
              </p>

              <p>
                {newWordPhonemes.length} / 5 phonemes selected
                {getDifficultyFromPhonemeCount(newWordPhonemes.length)
                  ? ` — ${getDifficultyFromPhonemeCount(
                      newWordPhonemes.length
                    )!.toLowerCase()} difficulty`
                  : newWordPhonemes.length > 0
                    ? " — select 3 to 5 phonemes"
                    : ""}
              </p>

              {newWordPhonemes.length > 0 && (
                <div className={styles.selectedPhonemes}>
                  {newWordPhonemes.map((symbol, index) => (
                    <button
                      key={`${symbol}-${index}`}
                      type="button"
                      className={styles.selectedPhoneme}
                      onClick={() =>
                        removeNewWordPhoneme(index)
                      }
                      disabled={savingWord}
                      aria-label={`Remove phoneme ${symbol}`}
                    >
                      {symbol} ×
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.phonemeKeyboard}>
                {phonemeRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={styles.phonemeRow}
                  >
                    {row.map((phoneme) => (
                      <PhonemeButton
                        key={phoneme.symbol}
                        phoneme={phoneme.symbol}
                        label={phoneme.label}
                        example={phoneme.example}
                        onSelect={addNewWordPhoneme}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {wordFormError && (
              <p role="alert">{wordFormError}</p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeAddWordModal}
                disabled={savingWord}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={saveNewWord}
                disabled={savingWord}
              >
                {savingWord
                  ? "Saving..."
                  : "Save & Select"}
              </button>
            </div>
          </section>
        </div>
      )}

    </main>
  );
}