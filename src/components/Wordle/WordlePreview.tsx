import WordleBoard from "./WordleBoard";
import PhonemeButton from "./PhonemeButton";
import { phonemeRows } from "@/data/phonemes";
import styles from "./WordleSettings.module.css";

type WordlePreviewProps = {
  selectedPhonemes: string[];
  difficulty: string;
  guesses: string[][];
  currentGuess: string[];
  onAddGuessPhoneme: (phoneme: string) => void;
  onClearCurrentGuess: () => void;
  onSubmitGuess: () => void;
  onStartOver: () => void;
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
}: WordlePreviewProps) {
  return (
    <section>
      <h2>Preview</h2>

      <WordleBoard
        selectedPhonemes={selectedPhonemes}
        difficulty={difficulty}
        guesses={guesses}
        currentGuess={currentGuess}
      />

      <div className={styles.phonemeKeyboard}>
        {phonemeRows.map((row, rowIndex) => (
          <div className={styles.phonemeRow} key={rowIndex}>
            {row.map((phoneme) => (
              <PhonemeButton
                key={phoneme.symbol}
                phoneme={phoneme.symbol}
                example=""
                onSelect={onAddGuessPhoneme}
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
          disabled={currentGuess.length !== 3}
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