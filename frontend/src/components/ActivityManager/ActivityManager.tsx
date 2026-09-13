"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./ActivityManager.module.css";
import Link from "next/link";

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

export default function ActivityManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState<"WORDLE" | "WORD_SEARCH">("WORDLE");
  const [difficulty, setDifficulty] =
    useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);

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

      const [wordsResponse, activitiesResponse] = await Promise.all([
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
      const activitiesData: Activity[] = await activitiesResponse.json();

      setWords(wordsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error(err);
      setError("Unable to load activity data.");
    } finally {
      setLoading(false);
    }
  }

  function handleTypeChange(newType: "WORDLE" | "WORD_SEARCH") {
    setType(newType);

    // Wordle uses one target word.
    // If several Word Search words were already selected,
    // retain only the first when switching to Wordle.
    if (newType === "WORDLE" && selectedWordIds.length > 1) {
      setSelectedWordIds([selectedWordIds[0]]);
    }
  }

  function handleWordSelection(wordId: number) {
    if (type === "WORDLE") {
      setSelectedWordIds([wordId]);
      return;
    }

    setSelectedWordIds((current) =>
      current.includes(wordId)
        ? current.filter((id) => id !== wordId)
        : [...current, wordId]
    );
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    if (type === "WORDLE") {
      const selectedWord = words.find(
        (word) => word.id === selectedWordIds[0]
      );

    if (
      selectedWord &&
      selectedWord.phonemes.length !== requiredPhonemeCount()
    ) {
      setError(
        `${difficulty.charAt(0) + difficulty.slice(1).toLowerCase()} Wordle activities require ${requiredPhonemeCount()} phonemes. "${selectedWord.text}" contains ${selectedWord.phonemes.length}.`
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
        throw new Error(data.error || "Unable to create activity");
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

  function formatActivityType(activityType: Activity["type"]) {
    return activityType === "WORD_SEARCH" ? "Word Search" : "Wordle";
  }

  function formatDifficulty(value: Activity["difficulty"]) {
    return value.charAt(0) + value.slice(1).toLowerCase();
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
          Create activity configurations using words stored in the phoneme
          database.
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

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <label className={styles.label} htmlFor="activity-name">
            Activity name
          </label>

          <input
            id="activity-name"
            className={styles.input}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Week 3 Wordle"
          />
        </div>

        <fieldset className={styles.formSection}>
          <legend className={styles.label}>Activity type</legend>

          <div className={styles.optionRow}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="activity-type"
                value="WORDLE"
                checked={type === "WORDLE"}
                onChange={() => handleTypeChange("WORDLE")}
              />
              <span>Wordle</span>
            </label>

            <label className={styles.radioOption}>
              <input
                type="radio"
                name="activity-type"
                value="WORD_SEARCH"
                checked={type === "WORD_SEARCH"}
                onChange={() => handleTypeChange("WORD_SEARCH")}
              />
              <span>Word Search</span>
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.formSection}>
          <legend className={styles.label}>Difficulty</legend>

          <div className={styles.optionRow}>
            {(["EASY", "MEDIUM", "HARD"] as const).map((level) => (
              <label className={styles.radioOption} key={level}>
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() => setDifficulty(level)}
                />
                <span>{formatDifficulty(level)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.formSection}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={hintsEnabled}
              onChange={(event) => setHintsEnabled(event.target.checked)}
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
              ? "Choose one stored word for this Wordle activity."
              : "Choose one or more stored words for this Word Search activity."}
          </p>

          {words.length === 0 ? (
            <p className={styles.empty}>
              No words are currently stored. Add words in the Word Manager
              first.
            </p>
          ) : (
            <div className={styles.wordGrid}>
              {words.map((word) => {
                const selected = selectedWordIds.includes(word.id);

                return (
                  <label
                    className={`${styles.wordOption} ${
                      selected ? styles.wordOptionSelected : ""
                    }`}
                    key={word.id}
                  >
                    <input
                      type={type === "WORDLE" ? "radio" : "checkbox"}
                      name={
                        type === "WORDLE"
                          ? "selected-word"
                          : `selected-word-${word.id}`
                      }
                      checked={selected}
                      onChange={() => handleWordSelection(word.id)}
                    />

                    <span className={styles.wordDetails}>
                      <strong>{word.text}</strong>

                      <span className={styles.phonemes}>
                        /{word.phonemes.map((phoneme) => phoneme.symbol).join(" ")}/
                      </span>

                      <span className={styles.wordDifficulty}>
                        {formatDifficulty(word.difficulty)}
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
          disabled={saving || words.length === 0}
        >
          {saving ? "Saving..." : "Create Activity"}
        </button>
      </form>

      <div className={styles.activitySection}>
        <h2>Saved Activities</h2>

        {activities.length === 0 ? (
          <p className={styles.empty}>No activities have been saved yet.</p>
        ) : (
          <div className={styles.activityGrid}>
            {activities.map((activity) => (
              <article className={styles.activityCard} key={activity.id}>
                <div className={styles.activityHeader}>
                  <div>
                    <h3>{activity.name}</h3>
                    <p className={styles.activityType}>
                      {formatActivityType(activity.type)}
                    </p>
                  </div>

                  <span className={styles.difficultyBadge}>
                    {formatDifficulty(activity.difficulty)}
                  </span>
                </div>

                <dl className={styles.details}>
                  <div>
                    <dt>Hints</dt>
                    <dd>{activity.hintsEnabled ? "Enabled" : "Disabled"}</dd>
                  </div>

                  <div>
                    <dt>Words</dt>
                    <dd>
                      {activity.words
                        .map((activityWord) => activityWord.word.text)
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
                </div>

              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}