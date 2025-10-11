import SearchResultsClient from "./SearchResultsClient";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  return (
    <SearchResultsClient
      groupId={Number(slug)}
      searchParams={searchParamsResolved}
    />
  );
}