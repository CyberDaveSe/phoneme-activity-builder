"use client";

import { useState } from "react";
import styles from "./WordSearch.module.css";

export type WordTarget = {
  word: string;
  phonemes: string[];
};

type SelectedCell = {
  row: number;
  column: number;
  phoneme: string;
};

type WordSearchGridProps = {
  targetWords: WordTarget[];
  foundWords: string[];
  onWordFound: (wordKey: string) => void;
};

const grid = [
  ["b", "e", "d", "s", "ɐ", "k"],
  ["θ", "m", "ɹ", "ʃ", "ɪ", "p"],
  ["ɪ", "dʒ", "ɪ", "æ", "n", "t"],
  ["n", "æ", "ŋ", "m", "o", "l"],
  ["f", "m", "k", "ɪ", "v", "e"],
  ["s", "t", "ɔ", "ŋ", "p", "n"],
];

export default function WordSearchGrid({
  targetWords,
  foundWords,
  onWordFound,
}: WordSearchGridProps) {
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [foundCells, setFoundCells] = useState<string[]>([]);

  const selectCell = (
    row: number,
    column: number,
    phoneme: string
  ) => {
    if (selectedCells.length >= 3) {
      return;
    }

    const alreadySelected = selectedCells.some(
      (cell) => cell.row === row && cell.column === column
    );

    if (alreadySelected) {
      return;
    }

    setSelectedCells((current) => [
      ...current,
      { row, column, phoneme },
    ]);
  };

  const isStraightAdjacentSelection = () => {
    if (selectedCells.length < 2) {
      return true;
    }

    const rowDifference =
      selectedCells[1].row - selectedCells[0].row;

    const columnDifference =
      selectedCells[1].column - selectedCells[0].column;

    const validDirection =
      Math.abs(rowDifference) <= 1 &&
      Math.abs(columnDifference) <= 1 &&
      !(rowDifference === 0 && columnDifference === 0);

    if (!validDirection) {
      return false;
    }

    for (let index = 1; index < selectedCells.length; index++) {
      const previous = selectedCells[index - 1];
      const current = selectedCells[index];

      if (
        current.row - previous.row !== rowDifference ||
        current.column - previous.column !== columnDifference
      ) {
        return false;
      }
    }

    return true;
  };

  const checkSelection = () => {
    if (!isStraightAdjacentSelection()) {
      setSelectedCells([]);
      return;
    }

    const selection = selectedCells
      .map((cell) => cell.phoneme)
      .join("|");

    const match = targetWords.find(
      (entry) => entry.phonemes.join("|") === selection
    );

    if (match && !foundWords.includes(selection)) {
      onWordFound(selection);

      const confirmedCells = selectedCells.map(
        (cell) => `${cell.row}-${cell.column}`
      );

      setFoundCells((current) => [
        ...new Set([...current, ...confirmedCells]),
      ]);
    }

    setSelectedCells([]);
  };

  const clearSelection = () => {
    setSelectedCells([]);
  };

  return (
    <div>
      <div className={styles.grid}>
        {grid.map((row, rowIndex) =>
          row.map((phoneme, columnIndex) => {
            const cellKey = `${rowIndex}-${columnIndex}`;

            const selected = selectedCells.some(
              (cell) =>
                cell.row === rowIndex &&
                cell.column === columnIndex
            );

            const found = foundCells.includes(cellKey);

            return (
              <button
                type="button"
                className={`${styles.cell} ${
                  found
                    ? styles.found
                    : selected
                      ? styles.selected
                      : ""
                }`}
                key={cellKey}
                onClick={() =>
                  selectCell(rowIndex, columnIndex, phoneme)
                }
              >
                {phoneme}
              </button>
            );
          })
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={clearSelection}
        >
          Clear Selection
        </button>

        <button
          type="button"
          className={styles.controlButton}
          onClick={checkSelection}
          disabled={selectedCells.length !== 3}
        >
          Check Word
        </button>
      </div>

      <p>
        Words found: {foundWords.length} / {targetWords.length}
      </p>
    </div>
  );
}