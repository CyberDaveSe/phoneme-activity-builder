import WordleBoard from "./WordleBoard";

type WordlePreviewProps = {
  selectedPhonemes: string[];
  difficulty: string;
};

export default function WordlePreview({
  selectedPhonemes,
  difficulty,
}: WordlePreviewProps) {
  return (
    <section>
      <h2>Preview</h2>

      <WordleBoard 
        selectedPhonemes={selectedPhonemes}
        difficulty={difficulty} 
      />
    </section>
  );
}