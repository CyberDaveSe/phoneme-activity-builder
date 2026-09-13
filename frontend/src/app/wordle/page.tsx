import WordleBuilder from "@/components/Wordle/WordleBuilder";

type WordlePageProps = {
  searchParams: Promise<{
    activity?: string;
  }>;
};

export default async function WordlePage({
  searchParams,
}: WordlePageProps) {
  const params = await searchParams;

  return (
    <div className="pageContainer">
      <WordleBuilder activityId={params.activity} />
    </div>
  );
}