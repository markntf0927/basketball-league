import { formatDate } from "@/lib/format";
import { getNewsPost } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getNewsPost(id);
  if (!post) notFound();

  return (
    <>
      <p className="eyebrow">{formatDate(post.publishedAt)}</p>
      <h1 className="page-title">{post.title}</h1>
      {post.match ? (
        <p>
          <Link className="text-link" href={`/matches/${post.match.id}`}>
            查看賽果 {post.match.homeTeam.name} vs {post.match.awayTeam.name}
          </Link>
        </p>
      ) : null}
      <article className="prose-panel">{post.body}</article>
    </>
  );
}
