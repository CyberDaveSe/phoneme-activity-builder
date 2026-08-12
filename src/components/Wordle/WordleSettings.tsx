import PhonemeButton from "./PhonemeButton";
import styles from "./WordleSettings.module.css";
import { phonemeRows } from "@/data/phonemes";

type WordleSettingsProps = {
  selectedPhonemes: string[];
  onAddPhoneme: (phoneme: string) => void;
  onClearPhonemes: () => void;
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
};

export default function WordleSettings({
  selectedPhonemes,
  onAddPhoneme,
  onClearPhonemes,
  difficulty,
  onDifficultyChange,
}: WordleSettingsProps) {
  const maximumLength =
    difficulty === "easy"
      ? 3
      : difficulty === "medium"
        ? 4
        : 5;

  return (
    <section>
      <h2>Activity Settings</h2>

      <div>
        <h3>Phoneme Word</h3>

        <p>Select phonemes to build the target word.</p>
      </div>

        <div className={styles.phonemeKeyboard}>
          {phonemeRows.map((row, rowIndex) => (
           <div className={styles.phonemeRow} key={rowIndex}>
              {row.map((phoneme) => (
               <PhonemeButton
                 key={phoneme.symbol}
                 phoneme={phoneme.symbol}
                 label={phoneme.label}
                 example={phoneme.example}
                 onSelect={onAddPhoneme}
               />
              ))}
           </div>
          ))}
        </div>

      <div>
        <h3 className={styles.selectedSection}>Selected Phonemes</h3>

         <div className={styles.selectedArea}>
              {selectedPhonemes.length > 0 ? (
                 <div className={styles.selectedPhonemes}>
                   {selectedPhonemes.map((phoneme, index) => (
                     <span
                        className={styles.selectedPhoneme}
                        key={`${phoneme}-${index}`}
                     >
                        {phoneme}
                     </span>
                   ))}
                 </div>
              ) : (
                 <p className={styles.emptyMessage}>
                   No phonemes selected.
                 </p>
              )}

             <p className={styles.counter}>
                {selectedPhonemes.length} / {maximumLength} phonemes
             </p>

             <button
                type="button"
                className={styles.clearButton}
                onClick={onClearPhonemes}
             >
                Clear
             </button>
         </div>
       
      </div>

      <div className={styles.difficultySection}>
        <h3>Difficulty</h3>

        <label>
         <input
           type="radio"
           name="difficulty"
           value="easy"
           checked={difficulty === "easy"}
           onChange={(event) => onDifficultyChange(event.target.value)}
        />
        Easy
        </label>

        <label>
         <input
           type="radio"
           name="difficulty"
           value="medium"
           checked={difficulty === "medium"}
           onChange={(event) => onDifficultyChange(event.target.value)}
        />
        Medium
        </label>

        <label>
         <input
           type="radio"
           name="difficulty"
           value="hard"
           checked={difficulty === "hard"}
           onChange={(event) => onDifficultyChange(event.target.value)}
        />
        Hard
        </label>
      </div>
    </section>
  );
}