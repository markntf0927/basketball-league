import { PageHeading } from "@/components/chrome";
import { getLeagueLeaders } from "@/lib/queries";
import Link from "next/link";

export const metadata = { title: "聯賽之星" };

export default async function LeadersPage() {
  const categories = await getLeagueLeaders();
  const hasRows = categories.some((category) => category.rows.length > 0);

  return (
    <>
      <PageHeading en="League Leaders" zh="聯賽之星" />
      {hasRows ? (
        <div className="leaders-grid">
          {categories.map((category) => (
            <section key={category.key} className="leader-card">
              <p className="eyebrow">League Leader</p>
              <h2>{category.label}</h2>
              <ol>
                {category.rows.map((row, index) => (
                  <li key={row.playerId}>
                    <span>
                      {index + 1}.{" "}
                      <Link href={`/players/${row.player.id}`}>{row.player.name}</Link>
                    </span>
                    <strong>{row[category.key]}</strong>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <article className="prose-panel">
          已匯入球隊與賽果。逐場 box
          score（得分、籃板、助攻等）尚未從舊站明細表匯入，榜上暫時沒有個人數據。
        </article>
      )}
    </>
  );
}
