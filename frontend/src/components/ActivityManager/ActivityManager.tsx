"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ActivityManager.module.css";

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

type ActivityWord = {
  activityId: number;
  wordId: number;
  word: Word;
};

type Activity = {
  id: number;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hintsEnabled: boolean;
  words: ActivityWord[];
  createdAt: string;
  updatedAt: string;
};

const MAX_WORD_SEARCH_WORDS = 5;

export default function ActivityManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  const [name, setName] = useState("");
  const [type, setType] =
    useState<"WORDLE" | "WORD_SEARCH">("WORDLE");
  const [difficulty, setDifficulty] =
    useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [selectedWordIds, setSelectedWordIds] =
    useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [wordsResponse, activitiesResponse] =
        await Promise.all([
          fetch("/api/words"),
          fetch("/api/activities"),
        ]);

      if (!wordsResponse.ok) {
        throw new Error("Unable to load words");
      }

      if (!activitiesResponse.ok) {
        throw new Error("Unable to load activities");
      }

      const wordsData: Word[] = await wordsResponse.json();
      const activitiesData: Activity[] =
        await activitiesResponse.json();

      setWords(wordsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error(err);
      setError("Unable to load activity data.");
    } finally {
      setLoading(false);
    }
  }

  function handleTypeChange(
    newType: "WORDLE" | "WORD_SEARCH"
  ) {
    setType(newType);
    setSelectedWordIds([]);
    setMessage("");
    setError("");
  }

  function handleDifficultyChange(
    newDifficulty: "EASY" | "MEDIUM" | "HARD"
  ) {
    setDifficulty(newDifficulty);

    if (type === "WORDLE") {
      setSelectedWordIds([]);
    }
  }

  function handleWordSelection(wordId: number) {
    setMessage("");
    setError("");

    if (type === "WORDLE") {
      setSelectedWordIds([wordId]);
      return;
    }

    setSelectedWordIds((current) => {
      if (current.includes(wordId)) {
        return current.filter((id) => id !== wordId);
      }

      if (current.length >= MAX_WORD_SEARCH_WORDS) {
        setError(
          `Word Search activities can contain up to ${MAX_WORD_SEARCH_WORDS} words.`
        );
        return current;
      }

      return [...current, wordId];
    });
  }

  function resetForm() {
    setName("");
    setType("WORDLE");
    setDifficulty("EASY");
    setHintsEnabled(false);
    setSelectedWordIds([]);
  }

  function requiredPhonemeCount() {
    if (difficulty === "EASY") return 3;
    if (difficulty === "MEDIUM") return 4;
    return 5;
  }

  const availableWords =
    type === "WORDLE"
      ? words.filter((word) => word.difficulty === difficulty)
      : words;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Enter an activity name.");
      return;
    }

    if (selectedWordIds.length === 0) {
      setError("Select at least one word.");
      return;
    }

    if (type === "WORDLE" && selectedWordIds.length !== 1) {
      setError("A Wordle activity requires one target word.");
      return;
    }

    if (
      type === "WORD_SEARCH" &&
      selectedWordIds.length > MAX_WORD_SEARCH_WORDS
    ) {
      setError(
        `Word Search activities can contain up to ${MAX_WORD_SEARCH_WORDS} words.`
      );
      return;
    }

    if (type === "WORDLE") {
      const selectedWord = words.find(
        (word) => word.id === selectedWordIds[0]
      );

      if (
        selectedWord &&
        selectedWord.phonemes.length !==
          requiredPhonemeCount()
      ) {
        setError(
          `${formatDifficulty(difficulty)} Wordle activities require ${requiredPhonemeCount()} phonemes. "${selectedWord.text}" contains ${selectedWord.phonemes.length}.`
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          difficulty,
          hintsEnabled,
          wordIds: selectedWordIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create activity"
        );
      }

      resetForm();
      setMessage("Activity created successfully.");

      await loadData();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create activity.");
      }
    } finally {
      setSaving(false);
    }
  }

  function formatActivityType(
    activityType: Activity["type"]
  ) {
    return activityType === "WORD_SEARCH"
      ? "Word Search"
      : "Wordle";
  }

  function formatDifficulty(
    value: Activity["difficulty"]
  ) {
    return (
      value.charAt(0) + value.slice(1).toLowerCase()
    );
  }

    async function deleteActivity(
    activityId: number,
    activityName: string
    ) {
    const confirmed = window.confirm(
        `Delete "${activityName}"? This cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    try {
        setError("");

        const response = await fetch(
        `/api/activities/${activityId}`,
        {
            method: "DELETE",
        }
        );

        const result = await response.json();

        if (!response.ok) {
        throw new Error(
            result.error ?? "Failed to delete activity."
        );
        }

        setActivities((current) =>
        current.filter(
            (activity) => activity.id !== activityId
        )
        );
    } catch (error) {
        console.error(
        "Failed to delete activity:",
        error
        );

        setError(
        error instanceof Error
            ? error.message
            : "Unable to delete activity."
        );
    }
    }

  if (loading) {
    return (
      <section className={styles.manager}>
        <h1>Activity Manager</h1>
        <p>Loading activities...</p>
      </section>
    );
  }

  return (
    <section className={styles.manager}>
      <div className={styles.heading}>
        <h1>Activity Manager</h1>
        <p>
          Create activity configurations using words stored
          in the phoneme database.
        </p>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className={styles.success} role="status">
          {message}
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.formSection}>
          <label
            className={styles.label}
            htmlFor="activity-name"
          >
            Activity name
          </label>

          <input
            id="activity-name"
            className={styles.input}
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder={
              type === "WORDLE"
                ? "e.g. Week 3 Wordle"
                : "e.g. Week 3 Word Search"
            }
          />
        </div>

        <fieldset className={styles.formSection}>
          <legend className={styles.label}>
            Activity type
          </legend>

          <div className={styles.optionRow}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="activity-type"
                value="WORDLE"
                checked={type === "WORDLE"}
                onChange={() =>
                  handleTypeChange("WORDLE")
                }
              />
              <span>Wordle</span>
            </label>

            <label className={styles.radioOption}>
              <input
                type="radio"
                name="activity-type"
                value="WORD_SEARCH"
                checked={type === "WORD_SEARCH"}
                onChange={() =>
                  handleTypeChange("WORD_SEARCH")
                }
              />
              <span>Word Search</span>
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.formSection}>
          <legend className={styles.label}>
            Difficulty
          </legend>

          <div className={styles.optionRow}>
            {(
              ["EASY", "MEDIUM", "HARD"] as const
            ).map((level) => (
              <label
                className={styles.radioOption}
                key={level}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() =>
                    handleDifficultyChange(level)
                  }
                />
                <span>
                  {formatDifficulty(level)}
                </span>
              </label>
            ))}
          </div>

          <p className={styles.helpText}>
            {type === "WORDLE"
              ? `${formatDifficulty(difficulty)} Wordle activities use ${requiredPhonemeCount()}-phoneme words.`
              : "Difficulty is saved with the Word Search configuration. Words of different phoneme lengths can be combined."}
          </p>
        </fieldset>

        <div className={styles.formSection}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={hintsEnabled}
              onChange={(event) =>
                setHintsEnabled(event.target.checked)
              }
            />
            <span>Enable hints</span>
          </label>
        </div>

        <fieldset className={styles.formSection}>
          <legend className={styles.label}>
            {type === "WORDLE"
              ? "Select target word"
              : "Select words for the word search"}
          </legend>

          <p className={styles.helpText}>
            {type === "WORDLE"
              ? `Choose one ${formatDifficulty(difficulty).toLowerCase()} word from the database.`
              : `Choose up to ${MAX_WORD_SEARCH_WORDS} stored words. ${selectedWordIds.length} / ${MAX_WORD_SEARCH_WORDS} selected.`}
          </p>

          {availableWords.length === 0 ? (
            <p className={styles.empty}>
              No compatible words are currently stored.
              Add words in the Word Manager first.
            </p>
          ) : (
            <div className={styles.wordGrid}>
              {availableWords.map((word) => {
                const selected =
                  selectedWordIds.includes(word.id);

                const selectionLimitReached =
                  type === "WORD_SEARCH" &&
                  selectedWordIds.length >=
                    MAX_WORD_SEARCH_WORDS &&
                  !selected;

                return (
                  <label
                    className={`${styles.wordOption} ${
                      selected
                        ? styles.wordOptionSelected
                        : ""
                    }`}
                    key={word.id}
                  >
                    <input
                      type={
                        type === "WORDLE"
                          ? "radio"
                          : "checkbox"
                      }
                      name={
                        type === "WORDLE"
                          ? "selected-word"
                          : `selected-word-${word.id}`
                      }
                      checked={selected}
                      disabled={selectionLimitReached}
                      onChange={() =>
                        handleWordSelection(word.id)
                      }
                    />

                    <span
                      className={styles.wordDetails}
                    >
                      <strong>{word.text}</strong>

                      <span className={styles.phonemes}>
                        /
                        {word.phonemes
                          .map(
                            (phoneme) =>
                              phoneme.symbol
                          )
                          .join(" ")}
                        /
                      </span>

                      <span
                        className={
                          styles.wordDifficulty
                        }
                      >
                        {formatDifficulty(
                          word.difficulty
                        )}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={
            saving || availableWords.length === 0
          }
        >
          {saving
            ? "Saving..."
            : "Create Activity"}
        </button>
      </form>

      <div className={styles.activitySection}>
        <h2>Saved Activities</h2>

        {activities.length === 0 ? (
          <p className={styles.empty}>
            No activities have been saved yet.
          </p>
        ) : (
          <div className={styles.activityGrid}>
            {activities.map((activity) => (
              <article
                className={styles.activityCard}
                key={activity.id}
              >
                <div className={styles.activityHeader}>
                  <div>
                    <h3>{activity.name}</h3>
                    <p
                      className={styles.activityType}
                    >
                      {formatActivityType(
                        activity.type
                      )}
                    </p>
                  </div>

                  <span
                    className={
                      styles.difficultyBadge
                    }
                  >
                    {formatDifficulty(
                      activity.difficulty
                    )}
                  </span>
                </div>

                <dl className={styles.details}>
                  <div>
                    <dt>Hints</dt>
                    <dd>
                      {activity.hintsEnabled
                        ? "Enabled"
                        : "Disabled"}
                    </dd>
                  </div>

                  <div>
                    <dt>Words</dt>
                    <dd>
                      {activity.words
                        .map(
                          (activityWord) =>
                            activityWord.word.text
                        )
                        .join(", ")}
                    </dd>
                  </div>
                </dl>

                <div className={styles.cardActions}>
                  <Link
                    className={styles.openButton}
                    href={
                      activity.type === "WORDLE"
                        ? `/wordle?activity=${activity.id}`
                        : `/word-search?activity=${activity.id}`
                    }
                  >
                    Open Activity
                  </Link>

                  {activity.type === "WORD_SEARCH" && (
                    <Link
                       href={`/word-search?activity=${activity.id}&edit=true`}
                       className={styles.editButton}
                    >
                       Edit
                    </Link>
                  )}

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() =>
                      deleteActivity(
                      activity.id,
                      activity.name
                    )
                  }
                  >
                    Delete
                  </button>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}