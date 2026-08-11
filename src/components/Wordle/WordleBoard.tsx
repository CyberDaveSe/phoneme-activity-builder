import styles from "@/app/wordle/Wordle.module.css";

type WordleBoardProps = {
  selectedPhonemes: string[];
  difficulty:string;
};

export default function WordleBoard({
  selectedPhonemes,
  difficulty,
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
            const phoneme =
              rowIndex === 0
                ? selectedPhonemes[columnIndex]
                : undefined;

            return (
              <div className={styles.tile} key={columnIndex}>
                {phoneme ?? ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}