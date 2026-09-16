"use client";

import { useState } from "react";
import PhonemeButton from "@/components/Wordle/PhonemeButton";
import { phonemeRows } from "@/data/phonemes";
import styles from "./WordleSettings.module.css";

type DatabasePhoneme = {
  id: number;
  symbol: string;
  position: number;
  wordId: number;
};

export type DatabaseWord = {
  id: number;
  text: string;
  hint: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  phonemes: DatabasePhoneme[];
};

type WordleSettingsProps = {
  words: DatabaseWord[];
  selectedWordId: number | null;
  onWordSelect: (word: DatabaseWord) => void;
  onCreateWord: (
    text: string,
    hint: string,
    phonemes: string[]
  ) => Promise<DatabaseWord>;
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  loadingWords: boolean;
  wordError: string;
};

function getDifficultyFromPhonemeCount(
  count: number
): "EASY" | "MEDIUM" | "HARD" | null {
  if (count === 3) return "EASY";
  if (count === 4) return "MEDIUM";
  if (count === 5) return "HARD";

  return null;
}

export default function WordleSettings({
  words,
  selectedWordId,
  onWordSelect,
  onCreateWord,
  difficulty,
  onDifficultyChange,
  loadingWords,
  wordError,
}: WordleSettingsProps) {
  const [showAddWordModal, setShowAddWordModal] =
    useState(false);

  const [newWordText, setNewWordText] = useState("");
  const [newWordHint, setNewWordHint] = useState("");
  const [newWordPhonemes, setNewWordPhonemes] =
    useState<string[]>([]);

  const [savingWord, setSavingWord] = useState(false);
  const [formError, setFormError] = useState("");

  const filteredWords = words.filter(
    (word) =>
      word.difficulty.toLowerCase() === difficulty
  );

  const openAddWordModal = () => {
    setNewWordText("");
    setNewWordHint("");
    setNewWordPhonemes([]);
    setFormError("");
    setShowAddWordModal(true);
  };

  const closeAddWordModal = () => {
    if (savingWord) {
      return;
    }

    setShowAddWordModal(false);
    setNewWordText("");
    setNewWordHint("");
    setNewWordPhonemes([]);
    setFormError("");
  };

  const addNewWordPhoneme = (symbol: string) => {
    if (newWordPhonemes.length >= 5) {
      setFormError(
        "Words can contain a maximum of 5 phonemes."
      );
      return;
    }

    setFormError("");
    setNewWordPhonemes((current) => [
      ...current,
      symbol,
    ]);
  };

  const removeNewWordPhoneme = (index: number) => {
    setFormError("");

    setNewWordPhonemes((current) =>
      current.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  };

  const saveNewWord = async () => {
    const trimmedWord = newWordText.trim();

    if (!trimmedWord) {
      setFormError("Enter a word.");
      return;
    }

    if (
      !getDifficultyFromPhonemeCount(
        newWordPhonemes.length
      )
    ) {
      setFormError(
        "Select between 3 and 5 phonemes."
      );
      return;
    }

    try {
      setSavingWord(true);
      setFormError("");

      await onCreateWord(
        trimmedWord,
        newWordHint,
        newWordPhonemes
      );

      setShowAddWordModal(false);
      setNewWordText("");
      setNewWordHint("");
      setNewWordPhonemes([]);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create word."
      );
    } finally {
      setSavingWord(false);
    }
  };

  const newWordDifficulty =
    getDifficultyFromPhonemeCount(
      newWordPhonemes.length
    );

  return (
    <section>
      <h2>Activity Settings</h2>

      <div className={styles.difficultySection}>
        <h3>Difficulty</h3>

        {["easy", "medium", "hard"].map((level) => (
          <label key={level}>
            <input
              type="radio"
              name="difficulty"
              value={level}
              checked={difficulty === level}
              onChange={(event) =>
                onDifficultyChange(event.target.value)
              }
            />

            {level.charAt(0).toUpperCase() +
              level.slice(1)}
          </label>
        ))}
      </div>

      <div className={styles.wordSelection}>
        <h3>Select Target Word</h3>

        <p>
          Choose a stored word to use as the Wordle
          target.
        </p>

        {loadingWords && <p>Loading words...</p>}

        {wordError && (
          <p role="alert">{wordError}</p>
        )}

        {!loadingWords && !wordError && (
          <>
            <select
              className={styles.wordSelect}
              value={selectedWordId ?? ""}
              onChange={(event) => {
                const id = Number(event.target.value);

                const word = words.find(
                  (item) => item.id === id
                );

                if (word) {
                  onWordSelect(word);
                }
              }}
            >
              <option value="">
                Select a word...
              </option>

              {filteredWords.map((word) => {
                const phonemes = word.phonemes
                  .slice()
                  .sort(
                    (a, b) =>
                      a.position - b.position
                  )
                  .map(
                    (phoneme) =>
                      `/${phoneme.symbol}/`
                  )
                  .join(" ");

                return (
                  <option
                    key={word.id}
                    value={word.id}
                  >
                    {word.text} — {phonemes}
                  </option>
                );
              })}
            </select>

            {filteredWords.length === 0 && (
              <p>
                No {difficulty} words are currently
                stored.
              </p>
            )}

            <button
              type="button"
              className={styles.addWordButton}
              onClick={openAddWordModal}
            >
              + Add New Word
            </button>
          </>
        )}
      </div>

      {showAddWordModal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeAddWordModal();
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wordle-add-word-title"
          >
            <div className={styles.modalHeader}>
              <h2 id="wordle-add-word-title">
                Add New Word
              </h2>

              <button
                type="button"
                className={styles.closeButton}
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
                Select each phoneme in the order it
                occurs in the word.
              </p>

              <p>
                {newWordPhonemes.length} / 5 phonemes
                selected
                {newWordDifficulty
                  ? ` — ${newWordDifficulty
                      .toLowerCase()
                      .replace(/^./, (letter) =>
                        letter.toUpperCase()
                      )}`
                  : ""}
              </p>

              <div
                className={styles.selectedPhonemes}
              >
                {newWordPhonemes.length === 0 ? (
                  <p>No phonemes selected yet.</p>
                ) : (
                  newWordPhonemes.map(
                    (phoneme, index) => (
                      <button
                        key={`${phoneme}-${index}`}
                        type="button"
                        className={
                          styles.selectedPhoneme
                        }
                        onClick={() =>
                          removeNewWordPhoneme(index)
                        }
                        disabled={savingWord}
                        title="Remove phoneme"
                      >
                        /{phoneme}/ ×
                      </button>
                    )
                  )
                )}
              </div>

              <div
                className={styles.phonemeKeyboard}
              >
                {phonemeRows.map(
                  (row, rowIndex) => (
                    <div
                      className={styles.phonemeRow}
                      key={rowIndex}
                    >
                      {row.map((phoneme) => (
                        <PhonemeButton
                          key={phoneme.symbol}
                          phoneme={phoneme.symbol}
                          label={phoneme.label}
                          example={phoneme.example}
                          onSelect={
                            addNewWordPhoneme
                          }
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {formError && (
              <p role="alert">{formError}</p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeAddWordModal}
                disabled={savingWord}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.addWordButton}
                onClick={saveNewWord}
                disabled={savingWord}
              >
                {savingWord
                  ? "Saving..."
                  : "Save Word"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}