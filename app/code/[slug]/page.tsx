import CodeViewer from "@/components/CodeViewer";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug;
  return (
    <div className="w-full h-screen">
      <CodeViewer slug={slug} />
    </div>
  );
}