import WordSearchBuilder from "@/components/WordSearch/WordSearchBuilder";

type WordSearchPageProps = {
  searchParams: Promise<{
    activity?: string;
  }>;
};

export default async function WordSearchPage({
  searchParams,
}: WordSearchPageProps) {
  const params = await searchParams;

  return (
    <div className="pageContainer">
      <WordSearchBuilder activityId={params.activity} />
    </div>
  );
}