import styles from "./PhonemeButton.module.css";

type PhonemeButtonProps = {
  phoneme: string;
  label?: string;
  example?: string;
  onSelect: (phoneme: string) => void;
  status?: "correct" | "present" | "absent";
};

export default function PhonemeButton({
  phoneme,
  label,
  example,
  onSelect,
  status,
}: PhonemeButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${
        status ? styles[status] : ""
      }`}
      onClick={() => onSelect(phoneme)}
      aria-label={
        label
          ? `Select phoneme ${phoneme}, English equivalent ${label}${
              example ? `, as in ${example}` : ""
            }`
          : `Select phoneme ${phoneme}`
      }
    >
      <span className={styles.symbol}>{phoneme}</span>

      {label && (
        <span className={styles.tooltip} role="tooltip">
          /{phoneme}/ → {label}
          {example ? ` — as in ${example}` : ""}
        </span>
      )}
    </button>
  );
}