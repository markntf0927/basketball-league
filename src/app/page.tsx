import Image from "next/image";
import Link from "next/link";
import { MatchCard, TeamMark } from "@/components/match-card";
import { SectionHeading, SectionTabs } from "@/components/chrome";
import { pctLabel } from "@/lib/format";
import {
  getGrades,
  getLatestMatches,
  getLeagueLeaders,
  getNews,
  getStandingsByGrade,
} from "@/lib/queries";

function gamesBehind(leaderW: number, leaderL: number, w: number, l: number) {
  return ((leaderW - w) + (l - leaderL)) / 2;
}

export default async function HomePage() {
  const [matches, news, grades, standingGroups, leaderCategories] =
    await Promise.all([
      getLatestMatches(6),
      getNews(),
      getGrades(),
      getStandingsByGrade(),
      getLeagueLeaders(),
    ]);

  const featuredStandings = [...standingGroups].sort(
    (a, b) =>
      b.rows.reduce((sum, row) => sum + row.gp, 0) -
      a.rows.reduce((sum, row) => sum + row.gp, 0),
  )[0];
  const leader = featuredStandings?.rows[0];
  const hasLeaders = leaderCategories.some((category) => category.rows.length > 0);

  return (
    <>
      <section className="hero">
        <div className="hero-copy-block">
          <p className="hero-kicker eyebrow">Phoenix Basketball League</p>
          <h1>
            鳳凰
            <span>聯賽</span>
          </h1>
          <p className="hero-copy">
            香港業餘籃球聯賽。組別、球隊、賽程與戰績公開查閱，結構參考職業聯盟官網的資訊層級。
          </p>
        </div>
        <figure className="hero-featured">
          <Image
            src="/featured/cai-guoting.png"
            alt="蔡國庭封蓋瞬間"
            width={720}
            height={960}
            priority
          />
          <figcaption>
            <p className="eyebrow">Featured Player</p>
            <p className="featured-title">封波之鬼</p>
            <p className="featured-name">蔡國庭</p>
          </figcaption>
        </figure>
      </section>

      {featuredStandings ? (
        <section>
          <SectionHeading
            en="Regular Season Standings"
            zh="例行賽戰績"
            href="/standings"
          />
          <p className="standings-note">{featuredStandings.grade.name}</p>
          <SectionTabs
            items={[
              { label: "戰績排行", active: true },
              { label: "完整榜表", href: "/standings" },
            ]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排序</th>
                  <th>隊伍</th>
                  <th>出賽</th>
                  <th>勝 W</th>
                  <th>敗 L</th>
                  <th>勝率 PCT</th>
                  <th>勝差 GB</th>
                </tr>
              </thead>
              <tbody>
                {featuredStandings.rows.slice(0, 10).map((row, index) => (
                  <tr key={row.teamId}>
                    <td className="rank">{String(index + 1).padStart(2, "0")}</td>
                    <td>
                      <Link href={`/teams/${row.team.id}`} className="team-cell">
                        <TeamMark
                          name={row.team.name}
                          shortName={row.team.shortName}
                        />
                        {row.team.name}
                      </Link>
                    </td>
                    <td>{row.gp}</td>
                    <td>{row.w}</td>
                    <td>{row.l}</td>
                    <td>{pctLabel(row.pct)}</td>
                    <td>
                      {index === 0 || !leader
                        ? "-"
                        : gamesBehind(leader.w, leader.l, row.w, row.l).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeading en="Schedule" zh="賽程" href="/schedule" />
        <div className="grid-matches">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading en="League Leaders" zh="排行榜" href="/leaders" />
        {hasLeaders ? (
          <div className="leaders-grid">
            {leaderCategories.slice(0, 3).map((category) => (
              <article key={category.key} className="leader-card">
                <p className="eyebrow">{category.label}</p>
                <ol>
                  {category.rows.slice(0, 5).map((row, index) => (
                    <li key={row.playerId}>
                      <span>
                        {index + 1}.{" "}
                        <Link href={`/players/${row.player.id}`}>{row.player.name}</Link>
                      </span>
                      <strong>{row[category.key]}</strong>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-panel">暫無資料</p>
        )}
      </section>

      <section>
        <SectionHeading
          en="Latest Videos"
          zh="最新影片"
          href="https://www.youtube.com/@phoenixbl2842"
        />
        <a
          className="video-banner"
          href="https://www.youtube.com/@phoenixbl2842"
          rel="noreferrer"
        >
          <span className="eyebrow">YouTube</span>
          <strong>Phoenix BL 比賽影片</strong>
          <span>前往頻道觀看最新場次</span>
        </a>
      </section>

      <section>
        <SectionHeading en="Teams" zh="球隊組別" href="/teams" />
        <div className="grid-teams">
          {grades.slice(0, 6).map((grade) => (
            <Link key={grade.id} href={`/teams?grade=${grade.id}`} className="team-card">
              <p className="eyebrow">{grade.seasonId.replace("season-", "Season ")}</p>
              <h3>{grade.name}</h3>
              <p className="muted">{grade.teams.length} 支球隊</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading en="News" zh="最新消息" href="/news" />
        <div className="grid-news">
          {news.slice(0, 3).map((post) => (
            <Link key={post.id} href={`/news/${post.id}`} className="news-card">
              <p className="eyebrow">{post.season?.name}</p>
              <h3>{post.title}</h3>
              <p className="muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
