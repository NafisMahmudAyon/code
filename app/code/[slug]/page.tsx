import CodeViewer from "@/components/CodeViewer";

export default async function Page({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug;
  return (
    <div className="w-full h-screen">
      <CodeViewer slug={slug} />
    </div>
  );
}