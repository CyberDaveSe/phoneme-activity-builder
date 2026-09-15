"use client";

import { useEffect, useMemo, useState } from "react";
import { phonemeRows } from "@/data/phonemes";
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
  foundWords: string[];
  onWordFound: (wordKey: string) => void;
  gameVersion: number;
};

const directions = [
  { row: -1, column: -1 },
  { row: -1, column: 0 },
  { row: -1, column: 1 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
  { row: 1, column: -1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
];

const fillerPhonemes = phonemeRows
  .flat()
  .map((phoneme) => phoneme.symbol);

const MAX_GENERATION_ATTEMPTS = 100;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index],
    ];
  }

  return copy;
}

function getGridSize(targetWords: WordTarget[]) {
  const wordCount = targetWords.length;

  const longestWordLength = Math.max(
    ...targetWords.map(
      (target) => target.phonemes.length
    ),
    1
  );

  let baseSize = 6;

  if (wordCount >= 8) {
    baseSize = 10;
  } else if (wordCount >= 5) {
    baseSize = 8;
  }

  return Math.max(
    baseSize,
    longestWordLength + 1
  );
}

function canPlaceWord(
  grid: (string | null)[][],
  phonemes: string[],
  startRow: number,
  startColumn: number,
  rowDirection: number,
  columnDirection: number,
  gridSize: number
) {
  for (
    let index = 0;
    index < phonemes.length;
    index++
  ) {
    const row =
      startRow + rowDirection * index;

    const column =
      startColumn + columnDirection * index;

    if (
      row < 0 ||
      row >= gridSize ||
      column < 0 ||
      column >= gridSize
    ) {
      return false;
    }

    const existing = grid[row][column];

    if (
      existing !== null &&
      existing !== phonemes[index]
    ) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: (string | null)[][],
  phonemes: string[],
  startRow: number,
  startColumn: number,
  rowDirection: number,
  columnDirection: number
) {
  for (
    let index = 0;
    index < phonemes.length;
    index++
  ) {
    const row =
      startRow + rowDirection * index;

    const column =
      startColumn + columnDirection * index;

    grid[row][column] = phonemes[index];
  }
}

function tryGenerateGrid(
  targetWords: WordTarget[],
  gridSize: number
): string[][] | null {
  const grid: (string | null)[][] =
    Array.from(
      { length: gridSize },
      () =>
        Array<string | null>(
          gridSize
        ).fill(null)
    );

  /*
   * Longer words are placed first because they have
   * fewer possible positions than shorter words.
   *
   * Words of equal length are shuffled so repeated
   * generation attempts do not always follow exactly
   * the same placement order.
   */
  const wordsToPlace = [...targetWords].sort(
    (a, b) =>
      b.phonemes.length - a.phonemes.length
  );

  for (const target of wordsToPlace) {
    const possiblePlacements: {
      row: number;
      column: number;
      rowDirection: number;
      columnDirection: number;
    }[] = [];

    for (
      let row = 0;
      row < gridSize;
      row++
    ) {
      for (
        let column = 0;
        column < gridSize;
        column++
      ) {
        for (const direction of directions) {
          if (
            canPlaceWord(
              grid,
              target.phonemes,
              row,
              column,
              direction.row,
              direction.column,
              gridSize
            )
          ) {
            possiblePlacements.push({
              row,
              column,
              rowDirection:
                direction.row,
              columnDirection:
                direction.column,
            });
          }
        }
      }
    }

    /*
     * This particular board attempt has become
     * impossible. Return null so generateGrid()
     * can retry with a fresh board.
     */
    if (
      possiblePlacements.length === 0
    ) {
      return null;
    }

    const placement =
      shuffle(possiblePlacements)[0];

    placeWord(
      grid,
      target.phonemes,
      placement.row,
      placement.column,
      placement.rowDirection,
      placement.columnDirection
    );
  }

  return grid.map((row) =>
    row.map(
      (cell) =>
        cell ??
        fillerPhonemes[
          Math.floor(
            Math.random() *
              fillerPhonemes.length
          )
        ]
    )
  ) as string[][];
}

function generateGrid(
  targetWords: WordTarget[]
) {
  const gridSize =
    getGridSize(targetWords);

  for (
    let attempt = 0;
    attempt < MAX_GENERATION_ATTEMPTS;
    attempt++
  ) {
    const grid = tryGenerateGrid(
      targetWords,
      gridSize
    );

    if (grid) {
      return grid;
    }
  }

  throw new Error(
    `Unable to generate a ${gridSize}×${gridSize} Word Search after ${MAX_GENERATION_ATTEMPTS} attempts.`
  );
}

export default function WordSearchGrid({
  targetWords,
  foundWords,
  onWordFound,
  gameVersion,  
}: WordSearchGridProps) {
  const grid = useMemo(
    () => generateGrid(targetWords),
    [targetWords]
  );

  const [selectedCells, setSelectedCells] = useState<
    SelectedCell[]
  >([]);

  const [foundCells, setFoundCells] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCells([]);
    setFoundCells([]);
  }, [gameVersion]);

  const maximumSelectionLength = Math.max(
    ...targetWords.map((target) => target.phonemes.length),
    1
  );

  const validTargetLengths = new Set(
    targetWords.map((target) => target.phonemes.length)
  );

  function selectCell(
    row: number,
    column: number,
    phoneme: string
  ) {
    /*
     * Allow the player to remove the most recently selected
     * cell by clicking it again.
     */
    const lastSelected =
      selectedCells[selectedCells.length - 1];

    if (
      lastSelected &&
      lastSelected.row === row &&
      lastSelected.column === column
    ) {
      setSelectedCells((current) => current.slice(0, -1));
      return;
    }

    if (selectedCells.length >= maximumSelectionLength) {
      return;
    }

    const alreadySelected = selectedCells.some(
      (cell) =>
        cell.row === row && cell.column === column
    );

    if (alreadySelected) {
      return;
    }

    /*
     * First cell can be anywhere.
     */
    if (selectedCells.length === 0) {
      setSelectedCells([{ row, column, phoneme }]);
      return;
    }

    /*
     * The second cell must be immediately adjacent to the first.
     */
    if (selectedCells.length === 1) {
      const first = selectedCells[0];

      const rowDifference = row - first.row;
      const columnDifference = column - first.column;

      const adjacent =
        Math.abs(rowDifference) <= 1 &&
        Math.abs(columnDifference) <= 1 &&
        !(rowDifference === 0 && columnDifference === 0);

      if (!adjacent) {
        return;
      }

      setSelectedCells((current) => [
        ...current,
        { row, column, phoneme },
      ]);

      return;
    }

    /*
     * From the third cell onward, continue in exactly the
     * direction established by the first two cells.
     */
    const first = selectedCells[0];
    const second = selectedCells[1];
    const previous = selectedCells[selectedCells.length - 1];

    const rowDirection = second.row - first.row;
    const columnDirection = second.column - first.column;

    const expectedRow = previous.row + rowDirection;
    const expectedColumn = previous.column + columnDirection;

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
  }

  function clearSelection() {
    setSelectedCells([]);
  }

  const selectionCanBeChecked =
    selectedCells.length > 0 &&
    validTargetLengths.has(selectedCells.length);

  return (
    <div>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${grid.length}, 48px)`,
        }}
      >
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
                  selectCell(
                    rowIndex,
                    columnIndex,
                    phoneme
                  )
                }
                aria-label={`Phoneme ${phoneme}, row ${
                  rowIndex + 1
                }, column ${columnIndex + 1}`}
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
          disabled={selectedCells.length === 0}
        >
          Clear Selection
        </button>

        <button
          type="button"
          className={styles.controlButton}
          onClick={checkSelection}
          disabled={!selectionCanBeChecked}
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