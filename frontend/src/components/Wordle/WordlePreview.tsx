import WordleBoard from "./WordleBoard";
import PhonemeButton from "./PhonemeButton";
import { phonemeRows } from "@/data/phonemes";
import styles from "./WordleSettings.module.css";

type GuessResult = {
  phoneme: string;
  status: "correct" | "present" | "absent";
};

type WordlePreviewProps = {
  selectedPhonemes: string[];
  difficulty: string;
  guesses: GuessResult[][];
  currentGuess: string[];
  onAddGuessPhoneme: (phoneme: string) => void;
  onClearCurrentGuess: () => void;
  onSubmitGuess: () => void;
  onStartOver: () => void;
  gameStatus: "playing" | "won" | "lost";
  targetWord: string;
  targetLength: number;
};

export default function WordlePreview({
  selectedPhonemes,
  difficulty,
  guesses,
  currentGuess,
  onAddGuessPhoneme,
  onClearCurrentGuess,
  onSubmitGuess,
  onStartOver,
  gameStatus,
  targetWord,
  targetLength,
}: WordlePreviewProps) {
  const getKeyboardStatus = (
    phoneme: string
  ): "correct" | "present" | "absent" | undefined => {
    let status: "correct" | "present" | "absent" | undefined;

    for (const guess of guesses) {
      for (const result of guess) {
        if (result.phoneme !== phoneme) {
          continue;
        }

        if (result.status === "correct") {
          return "correct";
        }

        if (result.status === "present") {
          status = "present";
        } else if (
          result.status === "absent" &&
          !status
        ) {
          status = "absent";
        }
      }
    }

    return status;
  };
  return (
    <section>
      <h2>Preview</h2>

      <WordleBoard
        selectedPhonemes={selectedPhonemes}
        difficulty={difficulty}
        guesses={guesses}
        currentGuess={currentGuess}
      />

      {gameStatus === "won" && (
        <div>
          <p>Correct! You solved the word.</p>
          <p>
            English equivalent: <strong>{targetWord.toUpperCase()}</strong>
          </p>
        </div>
      )}

      {gameStatus === "lost" && (
        <p>Game over. Try again.</p>
      )}

      <div className={styles.phonemeKeyboard}>
        {phonemeRows.map((row, rowIndex) => (
          <div className={styles.phonemeRow} key={rowIndex}>
            {row.map((phoneme) => (
              <PhonemeButton
                key={phoneme.symbol}
                phoneme={phoneme.symbol}
                label={phoneme.label}
                example={phoneme.example}
                onSelect={onAddGuessPhoneme}
                status={getKeyboardStatus(phoneme.symbol)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.gameControls}>
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClearCurrentGuess}
        >
          Clear Guess
        </button>

        <button
          type="button"
          className={styles.clearButton}
          onClick={onSubmitGuess}
          disabled={
            targetLength === 0 ||
            currentGuess.length !== targetLength ||
            gameStatus !== "playing"
          }
        >
          Submit Guess
        </button>

        <button
          type="button"
          className={styles.clearButton}
          onClick={onStartOver}
        >
          Start Over
        </button>
      </div>
    </section>
  );
}