import { phonemeRows } from "@/data/phonemes";
import { wordleTarget } from "@/data/wordleTarget";

export function generateWordleHtml() {
  const phonemeButtons = phonemeRows
    .flat()
    .map(
      (phoneme) => `
        <button
          class="phoneme-button"
          data-phoneme="${phoneme.symbol}"
          title="${phoneme.label ? `/${phoneme.symbol}/ → ${phoneme.label}` : phoneme.symbol}"
        >
          ${phoneme.symbol}
        </button>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Phoneme Wordle</title>

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

    .board {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      margin-bottom: 28px;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(${wordleTarget.phonemes.length}, 52px);
      gap: 8px;
    }

    .tile {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 52px;
      height: 52px;

      border: 2px solid #c8d2cb;
      border-radius: 6px;

      background: #ffffff;

      font-size: 1.2rem;
      font-weight: 700;
    }

    .correct {
      background: #7fa889;
      border-color: #42634c;
      color: #ffffff;
    }

    .present {
      background: #f6e7a8;
      border-color: #d8bd55;
      color: #31443a;
    }

    .absent {
      background: #d9ddda;
      border-color: #aeb6b0;
      color: #31443a;
    }

    .keyboard {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;

      margin-bottom: 20px;
    }

    .phoneme-button,
    .control-button {
      border: 1px solid #c8d2cb;
      border-radius: 6px;

      background: #ffffff;
      color: #42634c;

      font-weight: 600;
      cursor: pointer;
    }

    .phoneme-button {
      width: 52px;
      height: 48px;
    }

    .phoneme-button:hover,
    .phoneme-button:focus-visible {
      background: #dfeee3;
    }

    .phoneme-button:focus-visible,
    .control-button:focus-visible {
      outline: 3px solid #8aaa93;
      outline-offset: 2px;
    }

    .controls {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;

      margin-top: 16px;
    }

    .control-button {
      padding: 10px 16px;
    }

    .message {
      min-height: 48px;
      margin: 20px 0;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .row {
        grid-template-columns: repeat(${wordleTarget.phonemes.length}, 44px);
      }

      .tile {
        width: 44px;
        height: 44px;
      }

      .phoneme-button {
        width: 44px;
        height: 42px;
      }
    }
  </style>
</head>

<body>
  <main class="game">
    <h1>Phoneme Wordle</h1>

    <p class="instructions">
      Select phonemes to build your guess. You have six attempts.
    </p>

    <div id="board" class="board"></div>

    <div id="message" class="message" aria-live="polite"></div>

    <div class="keyboard">
      ${phonemeButtons}
    </div>

    <div class="controls">
      <button id="clear" class="control-button">
        Clear Guess
      </button>

      <button id="submit" class="control-button">
        Submit Guess
      </button>

      <button id="restart" class="control-button">
        Start Over
      </button>
    </div>
  </main>

  <script>
    const target = ${JSON.stringify(wordleTarget.phonemes)};
    const englishWord = ${JSON.stringify(wordleTarget.word)};

    const maxAttempts = 6;

    let guesses = [];
    let currentGuess = [];
    let gameStatus = "playing";

    const board = document.getElementById("board");
    const message = document.getElementById("message");

    function evaluateGuess(guess) {
      const results = guess.map((phoneme) => ({
        phoneme,
        status: "absent"
      }));

      const remainingTarget = [];

      guess.forEach((phoneme, index) => {
        if (phoneme === target[index]) {
          results[index].status = "correct";
        } else {
          remainingTarget.push(target[index]);
        }
      });

      guess.forEach((phoneme, index) => {
        if (results[index].status === "correct") {
          return;
        }

        const matchIndex = remainingTarget.indexOf(phoneme);

        if (matchIndex !== -1) {
          results[index].status = "present";
          remainingTarget.splice(matchIndex, 1);
        }
      });

      return results;
    }

    function renderBoard() {
      board.innerHTML = "";

      for (let rowIndex = 0; rowIndex < maxAttempts; rowIndex++) {
        const row = document.createElement("div");
        row.className = "row";

        for (let columnIndex = 0; columnIndex < target.length; columnIndex++) {
          const tile = document.createElement("div");
          tile.className = "tile";

          const submitted = guesses[rowIndex]?.[columnIndex];

          const current =
            rowIndex === guesses.length
              ? currentGuess[columnIndex]
              : undefined;

          if (submitted) {
            tile.textContent = submitted.phoneme;
            tile.classList.add(submitted.status);
          } else if (current) {
            tile.textContent = current;
          }

          row.appendChild(tile);
        }

        board.appendChild(row);
      }
    }

    function addPhoneme(phoneme) {
      if (gameStatus !== "playing") {
        return;
      }

      if (currentGuess.length >= target.length) {
        return;
      }

      currentGuess.push(phoneme);
      renderBoard();
    }

    function clearGuess() {
      if (gameStatus !== "playing") {
        return;
      }

      currentGuess = [];
      renderBoard();
    }

    function submitGuess() {
      if (gameStatus !== "playing") {
        return;
      }

      if (currentGuess.length !== target.length) {
        message.textContent = "Complete the guess before submitting.";
        return;
      }

      const results = evaluateGuess(currentGuess);

      guesses.push(results);

      const correct = currentGuess.every(
        (phoneme, index) => phoneme === target[index]
      );

      currentGuess = [];

      if (correct) {
        gameStatus = "won";
        message.innerHTML =
          "Correct! English equivalent: <strong>" +
          englishWord.toUpperCase() +
          "</strong>";
      } else if (guesses.length >= maxAttempts) {
        gameStatus = "lost";
        message.textContent = "Game over. Try again.";
      } else {
        message.textContent = "";
      }

      renderBoard();
    }

    function startOver() {
      guesses = [];
      currentGuess = [];
      gameStatus = "playing";
      message.textContent = "";

      renderBoard();
    }

    document.querySelectorAll(".phoneme-button").forEach((button) => {
      button.addEventListener("click", () => {
        addPhoneme(button.dataset.phoneme);
      });
    });

    document
      .getElementById("clear")
      .addEventListener("click", clearGuess);

    document
      .getElementById("submit")
      .addEventListener("click", submitGuess);

    document
      .getElementById("restart")
      .addEventListener("click", startOver);

    renderBoard();
  </script>
</body>
</html>
`;
}