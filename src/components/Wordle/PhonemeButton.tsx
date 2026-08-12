import styles from "./PhonemeButton.module.css";

type PhonemeButtonProps = {
  phoneme: string;
  label?: string;
  onSelect: (phoneme: string) => void;
};

export default function PhonemeButton({
  phoneme,
  label,
  onSelect,
}: PhonemeButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => onSelect(phoneme)}
      aria-label={
        label
          ? `Select phoneme ${phoneme}, English equivalent ${label}`
          : `Select phoneme ${phoneme}`
      }
    >
      <span className={styles.symbol}>{phoneme}</span>

      {label && (
        <span className={styles.tooltip} role="tooltip">
          /{phoneme}/ → {label}
        </span>
      )}
    </button>
  );
}