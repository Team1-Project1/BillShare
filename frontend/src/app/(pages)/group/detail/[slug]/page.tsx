import GroupDetailClient from "./GroupDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ phải await params
  const { slug } = await params;

  return <GroupDetailClient slug={slug} />;
}
