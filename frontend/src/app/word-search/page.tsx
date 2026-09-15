import WordSearchBuilder from "@/components/WordSearch/WordSearchBuilder";

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
      <WordSearchBuilder
        activityId={params.activity}
        editMode={params.edit === "true"}
      />
    </div>
  );
}