import CodeViewer from "@/components/CodeViewer";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug;


  return (
    <div className="flex w-full h-screen bg-primary-600">
      <CodeViewer slug={slug} />
    </div>
  );
}