import ActivityCard from "@/components/ActivityCard";
import cardStyles from "@/components/ActivityCard.module.css"
import styles from "./Home.module.css";

export default function HomePage() {
  return (
    <div className="pageContainer">
      <section className={styles.hero}>
        <h1 className={styles.title}>Phoneme Activity Builder</h1>

        <p className={styles.subtitle}>
          Create engaging phoneme-based classroom activities for Speech
          Pathology teaching and learning.
        </p>
      </section>

      <section className={styles.activities} aria-label="Activity options">
        <ActivityCard
          title="Wordle"
          description="Create a Wordle-style activity using phoneme-based words and phonetic hints."
          href="/wordle"
          preview={
            <div className={cardStyles.wordlePreview}>
               <div className={`${cardStyles.wordleTile} ${styles.correct}`}>θ</div>
               <div className={`${cardStyles.wordleTile} ${styles.correct}`}>ɪ</div>
               <div className={`${cardStyles.wordleTile} ${styles.partial}`}>ŋ</div>
               <div className={cardStyles.wordleTile}>k</div>

               <div className={cardStyles.wordleTile}>ʃ</div>
               <div className={cardStyles.wordleTile}>æ</div>
               <div className={cardStyles.wordleTile}>p</div>
               <div className={cardStyles.wordleTile}>t</div>

               <div className={cardStyles.wordleTile}>θ</div>
               <div className={cardStyles.wordleTile}>ɪ</div>
               <div className={cardStyles.wordleTile}>ŋ</div>
               <div className={cardStyles.wordleTile}>k</div>
            </div>
          }
        />

        <ActivityCard
          title="Word Search"
          description="Create a phoneme-based word search activity using a set of classroom words."
          href="/word-search"
          preview={
            <div className={cardStyles.wordSearchPreview}>
              <div className={cardStyles.wordSearchTile}>θ</div>
              <div className={cardStyles.wordSearchTile}>ɪ</div>
              <div className={cardStyles.wordSearchTile}>ŋ</div>
              <div className={cardStyles.wordSearchTile}>k</div>
              <div className={cardStyles.wordSearchTile}>s</div>

              <div className={cardStyles.wordSearchTile}>ʃ</div>
              <div
                className={`${cardStyles.wordSearchTile} ${cardStyles.highlighted}`}
              >
                  æ
              </div>
              <div
                className={`${cardStyles.wordSearchTile} ${cardStyles.highlighted}`}
              >
                p
              </div>
              <div
                className={`${cardStyles.wordSearchTile} ${cardStyles.highlighted}`}
              >
                l
              </div>
              <div className={cardStyles.wordSearchTile}>m</div>

              <div className={cardStyles.wordSearchTile}>k</div>
              <div className={cardStyles.wordSearchTile}>r</div>
              <div className={cardStyles.wordSearchTile}>θ</div>
              <div className={cardStyles.wordSearchTile}>ɪ</div>
              <div className={cardStyles.wordSearchTile}>ŋ</div>

              <div className={cardStyles.wordSearchTile}>s</div>
              <div className={cardStyles.wordSearchTile}>t</div>
              <div className={cardStyles.wordSearchTile}>r</div>
              <div className={cardStyles.wordSearchTile}>æ</div>
              <div className={cardStyles.wordSearchTile}>p</div>
            </div>
          }
        />
      </section>

      <section className={styles.introduction}>
        <p>
          Designed as a classroom authoring tool for teachers and Speech
          Pathology education.
        </p>
      </section>
    </div>
  );
}