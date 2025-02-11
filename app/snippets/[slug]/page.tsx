import Editor from "@/components/Editor";




export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug;


  return (
    <div className="flex w-full h-screen bg-primary-600">
      <Editor slug={slug} />
    </div>
  );
}
