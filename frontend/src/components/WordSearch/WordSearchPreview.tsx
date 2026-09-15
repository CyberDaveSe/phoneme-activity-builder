"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import WordSearchGrid, {
  WordTarget,
} from "./WordSearchGrid";
import { generateWordSearchGrid } from "@/utils/wordSearchGenerator";
import styles from "./WordSearch.module.css";

const defaultWords: WordTarget[] = [
  {
    word: "bed",
    phonemes: ["b", "e", "d"],
  },
  {
    word: "thin",
    phonemes: ["θ", "ɪ", "n"],
  },
  {
    word: "ship",
    phonemes: ["ʃ", "ɪ", "p"],
  },
  {
    word: "jam",
    phonemes: ["dʒ", "æ", "m"],
  },
  {
    word: "ring",
    phonemes: ["ɹ", "ɪ", "ŋ"],
  },
];

type WordSearchPreviewProps = {
  targetWords?: WordTarget[];
  hintsEnabled?: boolean;
  onBoardChange?: (board: string[][]) => void;
  initialBoard?: string[][];
  allowRecreate?: boolean;
};

export default function WordSearchPreview({
  targetWords = defaultWords,
  hintsEnabled = false,
  onBoardChange,
  initialBoard,
  allowRecreate = true,
}: WordSearchPreviewProps) {
  const [foundWords, setFoundWords] =
    useState<string[]>([]);

  const [gameVersion, setGameVersion] =
    useState(0);

  const targetSignature = useMemo(
    () =>
      targetWords
        .map(
          (target) =>
            `${target.word}:${target.phonemes.join("|")}`
        )
        .join("::"),
    [targetWords]
  );

  const [grid, setGrid] = useState<string[][]>(() =>
    initialBoard ?? generateWordSearchGrid(targetWords)
  );

  const handleWordFound = (
    wordKey: string
  ) => {
    setFoundWords((current) => {
      if (current.includes(wordKey)) {
        return current;
      }

      return [...current, wordKey];
    });
  };

  const resetGame = () => {
    setFoundWords([]);
    setGameVersion(
      (current) => current + 1
    );
  };

  const recreateBoard = () => {
    setFoundWords([]);
    setGrid(
      generateWordSearchGrid(targetWords)
    );
    setGameVersion(
      (current) => current + 1
    );
  };

  useEffect(() => {
    setFoundWords([]);

    if (initialBoard) {
      setGrid(initialBoard);
    } else {
      setGrid(
        generateWordSearchGrid(targetWords)
      );
    }

    setGameVersion(
      (current) => current + 1
    );
  }, [targetSignature, initialBoard]);

  useEffect(() => {
    onBoardChange?.(grid);
  }, [grid, onBoardChange]);

  return (
    <section>
      <h2>Preview</h2>

      <WordSearchGrid
        targetWords={targetWords}
        grid={grid}
        foundWords={foundWords}
        onWordFound={handleWordFound}
        gameVersion={gameVersion}
      />

      <div className={styles.wordList}>
        <h3>Find these words</h3>

        <ul>
          {targetWords.map((entry) => {
            const wordKey =
              entry.phonemes.join("|");

            const found =
              foundWords.includes(wordKey);

            return (
              <li
                key={`${entry.word}-${wordKey}`}
                className={
                  found
                    ? styles.foundWord
                    : ""
                }
              >
                <div>
                  {entry.phonemes.join(" ")}
                </div>

                {hintsEnabled &&
                  entry.hint && (
                    <small>
                      {entry.hint}
                    </small>
                  )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={resetGame}
        >
          Reset Game
        </button>

        {allowRecreate && (
          <button
            type="button"
            className={styles.controlButton}
            onClick={recreateBoard}
          >
            Recreate Board
          </button>
        )}
      </div>
    </section>
  );
}