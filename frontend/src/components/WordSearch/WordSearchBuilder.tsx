"use client";

import WordSearchPreview from "./WordSearchPreview";
import { generateWordSearchHtml } from "@/utils/generateWordSearchHtml";
import styles from "./WordSearch.module.css";

export default function WordSearchBuilder() {
  const generateActivity = () => {
    const html = generateWordSearchHtml();

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "phoneme-word-search.html";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header>
        <h1>Word Search Activity Builder</h1>

        <p>
          Create a phoneme-based word search activity for classroom use.
        </p>
      </header>

      <WordSearchPreview />

      <button
        type="button"
        className={styles.generateButton}
        onClick={generateActivity}
      >
        Generate Activity
      </button>
    </main>
  );
}