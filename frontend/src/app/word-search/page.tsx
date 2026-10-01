import WordSearchBuilder from "@/components/WordSearch/WordSearchBuilder";
import PageTimeTracker from "@/components/PageTimeTracker";

type WordSearchPageProps = {
  searchParams: Promise<{
    activity?: string;
    edit?: string;
  }>;
};

export default async function WordSearchPage({
  searchParams,
}: WordSearchPageProps) {
  const params = await searchParams;

  return (
    <div className="pageContainer">
      <PageTimeTracker page="/word-search" />
      <WordSearchBuilder
        activityId={params.activity}
        editMode={params.edit === "true"}
      />
    </div>
  );
}