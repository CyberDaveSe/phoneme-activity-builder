import WordleBuilder from "@/components/Wordle/WordleBuilder";
import PageTimeTracker from "@/components/PageTimeTracker";

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
      <PageTimeTracker page="/wordle" />
      <WordleBuilder activityId={params.activity} />
    </div>
  );
}