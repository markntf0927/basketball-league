import { PageHeading } from "@/components/chrome";
import { getPage } from "@/lib/queries";
import { notFound } from "next/navigation";

export const metadata = { title: "球會資料" };

export default async function AboutPage() {
  const page = await getPage("about");
  if (!page) notFound();

  return (
    <>
      <PageHeading en="About" zh={page.title} />
      <article className="prose-panel">{page.body}</article>
    </>
  );
}
