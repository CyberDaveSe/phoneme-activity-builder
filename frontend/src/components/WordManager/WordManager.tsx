"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./WordManager.module.css";
import PhonemeButton from "@/components/Wordle/PhonemeButton";
import { phonemeRows } from "@/data/phonemes";

type Phoneme = {
  id: number;
  symbol: string;
  position: number;
  wordId: number;
};

type Word = {
  id: number;
  text: string;
  hint: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  phonemes: Phoneme[];
};

function getDifficultyFromPhonemeCount(
  count: number
): Word["difficulty"] | null {
  if (count === 3) return "EASY";
  if (count === 4) return "MEDIUM";
  if (count === 5) return "HARD";

  return null;
}

export default function WordManager() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [text, setText] = useState("");
  const [hint, setHint] = useState("");
  const [phonemes, setPhonemes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadWords() {
    try {
      setError("");

      const response = await fetch("/api/words");

      if (!response.ok) {
        throw new Error("Failed to load words");
      }

      const data: Word[] = await response.json();
      setWords(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load stored words.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWords();
  }, []);

  function addPhoneme(symbol: string) {
    setPhonemes((current) => [...current, symbol]);
  }

  function removePhoneme(index: number) {
    setPhonemes((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function resetForm() {
    setText("");
    setHint("");
    setPhonemes([]);
    setEditingId(null);
    setError("");
  }

  function startEditing(word: Word) {
    setEditingId(word.id);
    setText(word.text);
    setHint(word.hint ?? "");
    setPhonemes(
      [...word.phonemes]
        .sort((a, b) => a.position - b.position)
        .map((phoneme) => phoneme.symbol)
    );
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim() || phonemes.length === 0) {
      setError("Enter a word and at least one phoneme.");
      return;
    }

    const derivedDifficulty =
      getDifficultyFromPhonemeCount(phonemes.length);

    if (!derivedDifficulty) {
      setError(
        "Wordle-compatible words must contain between 3 and 5 phonemes."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `/api/words/${editingId}` : "/api/words",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            hint: hint.trim(),
            difficulty: derivedDifficulty,
            phonemes,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json();

        throw new Error(
          result.error ||
            (isEditing
              ? "Failed to update word"
              : "Failed to create word")
        );
      }

      resetForm();
      await loadWords();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : editingId !== null
            ? "Unable to update word."
            : "Unable to create word."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(word: Word) {
    const confirmed = window.confirm(
      `Delete "${word.text}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(word.id);
      setError("");

      const response = await fetch(`/api/words/${word.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete word");
      }

      if (editingId === word.id) {
        resetForm();
      }

      await loadWords();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete word."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className={styles.wordManager}>
      <div className={styles.heading}>
        <h1>Word Manager</h1>
        <p>
          Add and manage the words and phonemes available for classroom
          activities.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeading}>
          <h2>{editingId !== null ? "Edit Word" : "Add New Word"}</h2>

          {editingId !== null && (
            <span className={styles.editingStatus}>
              Editing stored word
            </span>
          )}
        </div>

        <div className={styles.formGrid}>
          <label>
            Word
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              required
            />
          </label>

          <label>
            Hint
            <input
              type="text"
              value={hint}
              onChange={(event) => setHint(event.target.value)}
            />
          </label>
        </div>

        <div className={styles.phonemeSelector}>
          <h3>Phonemes</h3>

          <p className={styles.phonemeInstructions}>
            Select each phoneme in the order it occurs in the word.
          </p>

          {phonemes.length > 0 && (
           <p className={styles.phonemeInstructions}>
              {phonemes.length} phoneme
              {phonemes.length !== 1 ? "s" : ""} selected
              {getDifficultyFromPhonemeCount(phonemes.length)
              ? ` — ${getDifficultyFromPhonemeCount(
                  phonemes.length
                  )!.toLowerCase()} difficulty`
              : " — not compatible with Wordle"}
           </p>
          )}

          {phonemes.length > 0 && (
            <div className={styles.selectedPhonemes}>
              <span className={styles.selectedLabel}>Selected:</span>

              {phonemes.map((symbol, index) => (
                <button
                  key={`${symbol}-${index}`}
                  type="button"
                  className={styles.selectedPhoneme}
                  onClick={() => removePhoneme(index)}
                  aria-label={`Remove phoneme ${symbol}`}
                  title="Click to remove"
                >
                  {symbol} ×
                </button>
              ))}
            </div>
          )}

          <div className={styles.phonemeKeyboard}>
            {phonemeRows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.phonemeRow}>
                {row.map((phoneme) => (
                  <PhonemeButton
                    key={phoneme.symbol}
                    phoneme={phoneme.symbol}
                    label={phoneme.label}
                    example={phoneme.example}
                    onSelect={addPhoneme}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formActions}>
          {editingId !== null && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={resetForm}
              disabled={saving}
            >
              Cancel Edit
            </button>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={saving}
          >
            {saving
              ? editingId !== null
                ? "Updating..."
                : "Saving..."
              : editingId !== null
                ? "Update Word"
                : "Save Word"}
          </button>
        </div>
      </form>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div>
        <h2>Stored Words</h2>

        {loading && <p>Loading words...</p>}

        {!loading && !error && words.length === 0 && (
          <p>No words have been added yet.</p>
        )}

        {!loading && words.length > 0 && (
          <div className={styles.wordList}>
            {words.map((word) => (
              <article key={word.id} className={styles.wordCard}>
                <div className={styles.wordDetails}>
                  <h2>{word.text}</h2>

                  <div className={styles.phonemes}>
                    {word.phonemes.map((phoneme) => (
                      <span
                        key={phoneme.id}
                        className={styles.phonemeDisplay}
                      >
                        {phoneme.symbol}
                      </span>
                    ))}
                  </div>

                  {word.hint && (
                    <p className={styles.hint}>
                      <strong>Hint:</strong> {word.hint}
                    </p>
                  )}
                </div>

                <div className={styles.wordControls}>
                  <span className={styles.difficulty}>
                    {word.difficulty}
                  </span>

                  <div className={styles.wordActions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => startEditing(word)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDelete(word)}
                      disabled={deletingId === word.id}
                    >
                      {deletingId === word.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}