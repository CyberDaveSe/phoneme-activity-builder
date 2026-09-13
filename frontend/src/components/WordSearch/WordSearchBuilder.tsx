"use client";

import { useEffect, useState } from "react";
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

export default function WordSearchBuilder({
  activityId,
}: WordSearchBuilderProps) {
  const [activity, setActivity] =
    useState<StoredActivity | null>(null);

  const [loading, setLoading] = useState(Boolean(activityId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activityId) {
      setLoading(false);
      return;
    }

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
        console.error("Failed to load Word Search activity:", error);

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
  }, [activityId]);

  const targetWords: WordTarget[] =
    activity?.words.map(({ word }) => ({
      word: word.text,
      hint: word.hint,
      phonemes: [...word.phonemes]
        .sort((a, b) => a.position - b.position)
        .map((phoneme) => phoneme.symbol),
    })) ?? [];

  if (loading) {
    return (
      <main>
        <header>
          <h1>Word Search Activity Builder</h1>
        </header>

        <p>Loading saved activity...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <header>
          <h1>Word Search Activity Builder</h1>
        </header>

        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>
          {activity
            ? activity.name
            : "Word Search Activity Builder"}
        </h1>

        <p>
          {activity
            ? "Complete the saved phoneme word search activity."
            : "Create a phoneme-based word search activity for classroom use."}
        </p>
      </header>

      <WordSearchPreview
        targetWords={
          activity ? targetWords : undefined
        }
        hintsEnabled={activity?.hintsEnabled ?? false}
      />

      {activity && (
        <p>
          Activity difficulty:{" "}
          <strong>{activity.difficulty}</strong>
        </p>
      )}

      {!activity && (
        <p>
          Open a saved Word Search activity from the activity
          manager to load database words.
        </p>
      )}
    </main>
  );
}