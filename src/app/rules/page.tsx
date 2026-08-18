import { PageHeading } from "@/components/chrome";
import { getPage } from "@/lib/queries";
import { notFound } from "next/navigation";

export const metadata = { title: "比賽規則" };

export default async function RulesPage() {
  const page = await getPage("rules");
  if (!page) notFound();

  return (
    <>
      <PageHeading en="Rules" zh={page.title} />
      <article className="prose-panel">{page.body}</article>
    </>
  );
}
