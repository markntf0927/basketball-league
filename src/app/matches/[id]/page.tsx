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

  const homeLines = match.boxScores
    .filter((row) => row.teamId === match.homeTeamId)
    .sort((a, b) => b.pts - a.pts || b.reb - a.reb);
  const awayLines = match.boxScores
    .filter((row) => row.teamId === match.awayTeamId)
    .sort((a, b) => b.pts - a.pts || b.reb - a.reb);

  return (
    <>
      <p className="eyebrow">
        {match.grade.name} · {formatMatchWhen(match.playedAt)} · {match.venue}
      </p>
      <div className="match-hero">
        <div>
          <TeamMark name={match.homeTeam.name} shortName={match.homeTeam.shortName} />
          <Link href={`/teams/${match.homeTeam.id}`}>
            <h2>{match.homeTeam.name}</h2>
          </Link>
        </div>
        <p className="hero-score">
          {played ? `${match.homeScore} : ${match.awayScore}` : "VS"}
        </p>
        <div>
          <TeamMark name={match.awayTeam.name} shortName={match.awayTeam.shortName} />
          <Link href={`/teams/${match.awayTeam.id}`}>
            <h2>{match.awayTeam.name}</h2>
          </Link>
        </div>
      </div>

      {video ? (
        <iframe
          title="比賽影片"
          src={`https://www.youtube.com/embed/${video}`}
          style={{ width: "100%", aspectRatio: "16/9", border: 0, marginBottom: "1.5rem" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : match.videoUrl ? (
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          影片頻道：
          <a href={match.videoUrl} rel="noreferrer">
            {match.videoUrl}
          </a>
        </p>
      ) : null}

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
