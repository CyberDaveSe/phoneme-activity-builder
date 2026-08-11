import styles from "./PhonemeButton.module.css";

type PhonemeButtonProps = {
  phoneme: string;
  onSelect: (phoneme: string) => void;
};

export default function PhonemeButton({
  phoneme,
  onSelect,
}: PhonemeButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => onSelect(phoneme)}
      aria-label={`${phoneme}, as in ${phoneme}`}
    >
      <span className={styles.symbol}>{phoneme}</span>

    </button>
  );
}