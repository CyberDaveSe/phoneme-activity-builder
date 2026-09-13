import { phonemeRows } from "@/data/phonemes";

export function generateWordSearchHtml() {
  const grid = [
    ["b", "e", "d", "s", "ɐ", "k"],
    ["θ", "m", "ɹ", "ʃ", "ɪ", "p"],
    ["ɪ", "dʒ", "ɪ", "æ", "n", "t"],
    ["n", "æ", "ŋ", "m", "o", "l"],
    ["f", "m", "k", "ɪ", "v", "e"],
    ["s", "t", "ɔ", "ŋ", "p", "n"],
  ];

  const targetWords = [
    { word: "bed", phonemes: ["b", "e", "d"] },
    { word: "thin", phonemes: ["θ", "ɪ", "n"] },
    { word: "ship", phonemes: ["ʃ", "ɪ", "p"] },
    { word: "jam", phonemes: ["dʒ", "æ", "m"] },
    { word: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
  ];
  
  const phonemeHints = Object.fromEntries(
    phonemeRows
      .flat()
      .map((phoneme) => [
        phoneme.symbol,
        {
          label: phoneme.label,
          example: phoneme.example,
        },
      ])
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Phoneme Word Search</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 32px 16px;

      background: #fdf4f6;
      color: #31443a;

      font-family: Arial, sans-serif;
    }

    .game {
      width: min(100%, 700px);
      margin: 0 auto;
      text-align: center;
    }

    h1 {
      margin-bottom: 8px;
      color: #42634c;
    }

    .instructions {
      margin-bottom: 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(6, 48px);
      gap: 6px;

      width: fit-content;
      margin: 24px auto;
      padding: 18px;

      border: 1px solid #c8d2cb;
      border-radius: 8px;

      background: #dfeee3;
    }

    .cell {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 48px;
      height: 48px;

      border: 1px solid #c8d2cb;
      border-radius: 6px;

      background: #ffffff;
      color: #42634c;

      font-size: 1rem;
      font-weight: 700;

      cursor: pointer;
    }

    .cell:hover {
      background: #f6e7a8;
    }

    .cell:focus-visible,
    button:focus-visible {
      outline: 3px solid #8aaa93;
      outline-offset: 2px;
    }

    .cell.selected {
      background: #f6e7a8;
      border-color: #d8bd55;
    }

    .cell.found {
      background: #7fa889;
      border-color: #42634c;
      color: #ffffff;
    }

    .controls {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;

      margin: 20px 0;
    }

    .control-button {
      padding: 10px 16px;

      border: 1px solid #c8d2cb;
      border-radius: 6px;

      background: #ffffff;
      color: #42634c;

      font-weight: 600;
      cursor: pointer;
    }

    .control-button:hover {
      background: #dfeee3;
    }

    .control-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .word-list {
      margin-top: 24px;
    }

    .word-list ul {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;

      padding: 0;
      list-style: none;
    }

    .word-list li {
      padding: 6px 10px;

      color: #42634c;
      font-weight: 600;
    }

    .word-list li.found-word {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .status {
      min-height: 24px;
      margin-top: 16px;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(6, 40px);
        gap: 4px;
        padding: 10px;
      }

      .cell {
        width: 40px;
        height: 40px;
        font-size: 0.9rem;
      }
    }
  </style>
</head>

<body>
  <main class="game">
    <h1>Phoneme Word Search</h1>

    <p class="instructions">
      Select the phonemes of a word in a straight line,
      then choose Check Word.
    </p>

    <div id="grid" class="grid"></div>

    <div class="controls">
      <button
        id="clear"
        class="control-button"
        type="button"
      >
        Clear Selection
      </button>

      <button
        id="check"
        class="control-button"
        type="button"
        disabled
      >
        Check Word
      </button>
    </div>

    <p id="status" class="status" aria-live="polite">
      Words found: 0 / 5
    </p>

    <div class="word-list">
      <h2>Find these words</h2>
      <ul id="word-list"></ul>
    </div>

    <div class="controls">
      <button
        id="reset"
        class="control-button"
        type="button"
      >
        Reset Game
      </button>
    </div>
  </main>

  <script>
    const grid = ${JSON.stringify(grid)};
    const targetWords = ${JSON.stringify(targetWords)};
    const phonemeHints = ${JSON.stringify(phonemeHints)};

    let selectedCells = [];
    let foundWords = [];
    let foundCells = [];

    const gridElement = document.getElementById("grid");
    const wordListElement = document.getElementById("word-list");
    const statusElement = document.getElementById("status");
    const checkButton = document.getElementById("check");

    function cellKey(row, column) {
      return row + "-" + column;
    }

    function isStraightAdjacentSelection() {
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
    }

    function selectCell(row, column, phoneme) {
      if (selectedCells.length >= 3) {
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

      selectedCells.push({
        row,
        column,
        phoneme
      });

      render();
    }

    function checkSelection() {
      if (selectedCells.length !== 3) {
        return;
      }

      if (!isStraightAdjacentSelection()) {
        selectedCells = [];
        render();
        return;
      }

      const selection = selectedCells
        .map((cell) => cell.phoneme)
        .join("|");

      const match = targetWords.find(
        (entry) =>
          entry.phonemes.join("|") === selection
      );

      if (match && !foundWords.includes(selection)) {
        foundWords.push(selection);

        selectedCells.forEach((cell) => {
          const key = cellKey(cell.row, cell.column);

          if (!foundCells.includes(key)) {
            foundCells.push(key);
          }
        });
      }

      selectedCells = [];

      render();
    }

    function clearSelection() {
      selectedCells = [];
      render();
    }

    function resetGame() {
      selectedCells = [];
      foundWords = [];
      foundCells = [];

      render();
    }

    function renderGrid() {
      gridElement.innerHTML = "";

      grid.forEach((row, rowIndex) => {
        row.forEach((phoneme, columnIndex) => {
          const button = document.createElement("button");

          button.type = "button";
          button.className = "cell";
          button.textContent = phoneme;

          const hint = phonemeHints[phoneme];

          if (hint?.label) {
            const hintText =
              "/" +
              phoneme +
              "/ → " +
              hint.label +
              (hint.example ? " — as in " + hint.example : "");

            button.title = hintText;

            button.setAttribute(
              "aria-label",
              phoneme +
              ", " +
              hint.label +
              (hint.example ? ", as in " + hint.example : "")
            );
          }

          const key = cellKey(rowIndex, columnIndex);

          const selected = selectedCells.some(
            (cell) =>
              cell.row === rowIndex &&
              cell.column === columnIndex
          );

          if (selected) {
            button.classList.add("selected");
          }

          if (foundCells.includes(key)) {
            button.classList.add("found");
          }

          button.addEventListener("click", () => {
            selectCell(
              rowIndex,
              columnIndex,
              phoneme
            );
          });

          gridElement.appendChild(button);
        });
      });
    }

    function renderWordList() {
      wordListElement.innerHTML = "";

      targetWords.forEach((entry) => {
        const item = document.createElement("li");

        const wordKey = entry.phonemes.join("|");

        item.textContent = entry.phonemes.join(" ");

        if (foundWords.includes(wordKey)) {
          item.classList.add("found-word");
        }

        wordListElement.appendChild(item);
      });
    }

    function renderStatus() {
      statusElement.textContent =
        "Words found: " +
        foundWords.length +
        " / " +
        targetWords.length;

      if (foundWords.length === targetWords.length) {
        statusElement.textContent =
          "Complete! You found all " +
          targetWords.length +
          " words.";
      }

      checkButton.disabled =
        selectedCells.length !== 3;
    }

    function render() {
      renderGrid();
      renderWordList();
      renderStatus();
    }

    document
      .getElementById("clear")
      .addEventListener("click", clearSelection);

    document
      .getElementById("check")
      .addEventListener("click", checkSelection);

    document
      .getElementById("reset")
      .addEventListener("click", resetGame);

    render();
  </script>
</body>
</html>
`;
}