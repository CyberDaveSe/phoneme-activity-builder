"use client";

import { useEffect, useState } from "react";
import styles from "./WordSearch.module.css";

export type WordTarget = {
  word: string;
  phonemes: string[];
  hint?: string | null;
};

type SelectedCell = {
  row: number;
  column: number;
  phoneme: string;
};

type WordSearchGridProps = {
  targetWords: WordTarget[];
  grid: string[][];
  foundWords: string[];
  onWordFound: (wordKey: string) => void;
  gameVersion: number;
};

export default function WordSearchGrid({
  targetWords,
  grid,
  foundWords,
  onWordFound,
  gameVersion,
}: WordSearchGridProps) {
  const [selectedCells, setSelectedCells] = useState<
    SelectedCell[]
  >([]);

  const [foundCells, setFoundCells] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCells([]);
    setFoundCells([]);
  }, [gameVersion, grid]);

  const maximumSelectionLength = Math.max(
    ...targetWords.map(
      (target) => target.phonemes.length
    ),
    1
  );

  const validTargetLengths = new Set(
    targetWords.map(
      (target) => target.phonemes.length
    )
  );

  function selectCell(
    row: number,
    column: number,
    phoneme: string
  ) {
    const lastSelected =
      selectedCells[selectedCells.length - 1];

    if (
      lastSelected &&
      lastSelected.row === row &&
      lastSelected.column === column
    ) {
      setSelectedCells((current) =>
        current.slice(0, -1)
      );
      return;
    }

    if (
      selectedCells.length >=
      maximumSelectionLength
    ) {
      return;
    }

    const alreadySelected = selectedCells.some(
      (cell) =>
        cell.row === row &&
        cell.column === column
    );

    if (alreadySelected) {
      return;
    }

    if (selectedCells.length === 0) {
      setSelectedCells([
        { row, column, phoneme },
      ]);
      return;
    }

    if (selectedCells.length === 1) {
      const first = selectedCells[0];

      const rowDifference =
        row - first.row;

      const columnDifference =
        column - first.column;

      const adjacent =
        Math.abs(rowDifference) <= 1 &&
        Math.abs(columnDifference) <= 1 &&
        !(
          rowDifference === 0 &&
          columnDifference === 0
        );

      if (!adjacent) {
        return;
      }

      setSelectedCells((current) => [
        ...current,
        { row, column, phoneme },
      ]);

      return;
    }

    const first = selectedCells[0];
    const second = selectedCells[1];

    const previous =
      selectedCells[
        selectedCells.length - 1
      ];

    const rowDirection =
      second.row - first.row;

    const columnDirection =
      second.column - first.column;

    const expectedRow =
      previous.row + rowDirection;

    const expectedColumn =
      previous.column + columnDirection;

    if (
      row !== expectedRow ||
      column !== expectedColumn
    ) {
      return;
    }

    setSelectedCells((current) => [
      ...current,
      { row, column, phoneme },
    ]);
  }

  function checkSelection() {
    const selection = selectedCells
      .map((cell) => cell.phoneme)
      .join("|");

    const match = targetWords.find(
      (entry) =>
        entry.phonemes.join("|") === selection
    );

    if (
      match &&
      !foundWords.includes(selection)
    ) {
      onWordFound(selection);

      const confirmedCells =
        selectedCells.map(
          (cell) =>
            `${cell.row}-${cell.column}`
        );

      setFoundCells((current) => [
        ...new Set([
          ...current,
          ...confirmedCells,
        ]),
      ]);
    }

    setSelectedCells([]);
  }

  function clearSelection() {
    setSelectedCells([]);
  }

  const selectionCanBeChecked =
    selectedCells.length > 0 &&
    validTargetLengths.has(
      selectedCells.length
    );

  return (
    <div>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${grid.length}, 48px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map(
            (phoneme, columnIndex) => {
              const cellKey =
                `${rowIndex}-${columnIndex}`;

              const selected =
                selectedCells.some(
                  (cell) =>
                    cell.row === rowIndex &&
                    cell.column ===
                      columnIndex
                );

              const found =
                foundCells.includes(cellKey);

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
                    selectCell(
                      rowIndex,
                      columnIndex,
                      phoneme
                    )
                  }
                  aria-label={`Phoneme ${phoneme}, row ${
                    rowIndex + 1
                  }, column ${
                    columnIndex + 1
                  }`}
                >
                  {phoneme}
                </button>
              );
            }
          )
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={clearSelection}
          disabled={
            selectedCells.length === 0
          }
        >
          Clear Selection
        </button>

        <button
          type="button"
          className={styles.controlButton}
          onClick={checkSelection}
          disabled={
            !selectionCanBeChecked
          }
        >
          Check Word
        </button>
      </div>

      <p>
        Words found: {foundWords.length} /{" "}
        {targetWords.length}
      </p>
    </div>
  );
}