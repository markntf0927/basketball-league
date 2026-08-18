import { TeamMark } from "@/components/match-card";
import { SectionHeading } from "@/components/chrome";
import { formatMatchWhen, youtubeId } from "@/lib/format";
import { getMatch } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();
  const video = youtubeId(match.videoUrl);
  const played = match.status === "final";
  const homeWon = played && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = played && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  const homeLines = match.boxScores
    .filter((row) => row.teamId === match.homeTeamId)
    .sort((a, b) => b.pts - a.pts || b.reb - a.reb);
  const awayLines = match.boxScores
    .filter((row) => row.teamId === match.awayTeamId)
    .sort((a, b) => b.pts - a.pts || b.reb - a.reb);

  return (
    <>
      <div className="match-stage">
        <div className="match-stage-inner">
          <p className="eyebrow">
            {match.grade.name} · {formatMatchWhen(match.playedAt)} · {match.venue ?? "場地待定"}
          </p>
          <div className="match-hero">
            <div className={homeWon ? "is-winner" : undefined}>
              <TeamMark name={match.homeTeam.name} shortName={match.homeTeam.shortName} />
              <Link href={`/teams/${match.homeTeam.id}`}>
                <h2>{match.homeTeam.name}</h2>
              </Link>
            </div>
            <p className="hero-score">
              {played ? (
                <>
                  <span className={homeWon ? "is-winner" : undefined}>{match.homeScore}</span>
                  <span className="score-sep">:</span>
                  <span className={awayWon ? "is-winner" : undefined}>{match.awayScore}</span>
                </>
              ) : (
                <span className="vs">VS</span>
              )}
            </p>
            <div className={awayWon ? "is-winner" : undefined}>
              <TeamMark name={match.awayTeam.name} shortName={match.awayTeam.shortName} />
              <Link href={`/teams/${match.awayTeam.id}`}>
                <h2>{match.awayTeam.name}</h2>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="video-panel">
        <SectionHeading en="Game Video" zh="比賽影片" />
        {video ? (
          <iframe
            title="比賽影片"
            src={`https://www.youtube.com/embed/${video}`}
            className="video-frame"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : match.videoUrl ? (
          <a className="video-slot" href={match.videoUrl} rel="noreferrer">
            開啟比賽影片
          </a>
        ) : (
          <div className="video-slot">
            尚未加入影片。可在賽事資料填入 YouTube 連結後顯示在此。
          </div>
        )}
      </section>

      {[
        { team: match.homeTeam, lines: homeLines },
        { team: match.awayTeam, lines: awayLines },
      ].map(({ team, lines }) => (
        <section key={team.id} className="grade-block">
          <SectionHeading en="Box Score" zh={team.name} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>球員</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>FG</th>
                  <th>3P</th>
                  <th>FT</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="empty">
                      尚無 box score
                    </td>
                  </tr>
                ) : (
                  lines.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/players/${row.player.id}`}>{row.player.name}</Link>
                      </td>
                      <td>{row.pts}</td>
                      <td>{row.reb}</td>
                      <td>{row.ast}</td>
                      <td>{row.stl}</td>
                      <td>{row.blk}</td>
                      <td>{row.to}</td>
                      <td>
                        {row.fgm}-{row.fga}
                      </td>
                      <td>
                        {row.tpm}-{row.tpa}
                      </td>
                      <td>
                        {row.ftm}-{row.fta}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
