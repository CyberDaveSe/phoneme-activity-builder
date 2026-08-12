import styles from "@/app/wordle/Wordle.module.css";

type GuessResult = {
  phoneme: string;
  status: "correct" | "present" | "absent";
};

type WordleBoardProps = {
  selectedPhonemes: string[];
  difficulty: string;
  guesses: GuessResult[][];
  currentGuess: string[];
};

export default function WordleBoard({
  selectedPhonemes,
  difficulty,
  guesses,
  currentGuess,
}: WordleBoardProps) {
  const rows = 6;

  const columns =
    difficulty === "easy"
      ? 3
      : difficulty === "medium"
        ? 4
        : 5;

  return (
    <div className={styles.board}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          className={styles.row}
          key={rowIndex}
          style={{ gridTemplateColumns: `repeat(${columns}, 52px)` }}
        >
          {Array.from({ length: columns }).map((_, columnIndex) => {
            const submittedPhoneme =
              guesses[rowIndex]?.[columnIndex];

            const currentPhoneme =
              rowIndex === guesses.length
                ? currentGuess[columnIndex]
                : undefined;

            return (
              <div
                className={`${styles.tile} ${
                  submittedPhoneme
                    ? styles[submittedPhoneme.status]
                    : ""
                }`}
                key={columnIndex}
              >
                {submittedPhoneme?.phoneme ??
                  currentPhoneme ??
                  ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}