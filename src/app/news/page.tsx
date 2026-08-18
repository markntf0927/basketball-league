import { PageHeading } from "@/components/chrome";
import { formatDate } from "@/lib/format";
import { getNews } from "@/lib/queries";
import Link from "next/link";

export const metadata = { title: "新聞" };

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <PageHeading en="News" zh="最新消息" />
      <div className="grid-news">
        {news.map((post) => (
          <Link key={post.id} href={`/news/${post.id}`} className="news-card">
            <p className="eyebrow">{formatDate(post.publishedAt)}</p>
            <h3>{post.title}</h3>
            <p className="muted">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
