import { phonemeRows } from "@/data/phonemes";

export type WordSearchTarget = {
  word: string;
  phonemes: string[];
  hint?: string | null;
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

function getGridSize(targetWords: WordSearchTarget[]) {
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
  targetWords: WordSearchTarget[],
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

    if (possiblePlacements.length === 0) {
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

export function generateWordSearchGrid(
  targetWords: WordSearchTarget[]
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