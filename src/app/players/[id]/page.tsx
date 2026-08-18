import { rollupPlayerStats } from "@/lib/stats";
import { formatMatchWhen } from "@/lib/format";
import { SectionHeading } from "@/components/chrome";
import { getPlayer } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);
  if (!player) notFound();

  const totals = rollupPlayerStats(
    player.boxScores.map((row) => ({
      playerId: player.id,
      pts: row.pts,
      ast: row.ast,
      reb: row.reb,
      blk: row.blk,
      stl: row.stl,
      tpm: row.tpm,
    })),
  )[player.id];

  const team = player.rosters[0]?.team;

  return (
    <>
      <div className="player-hero">
        <div className="avatar">{player.name.slice(0, 1)}</div>
        <div>
          <p className="eyebrow">
            {player.position ?? "球員"}
            {team ? ` · ${team.name}` : ""}
          </p>
          <h1 className="page-title" style={{ margin: "0.2rem 0" }}>
            {player.name}
          </h1>
          <p className="muted">
            {player.heightCm ? `${player.heightCm} cm` : ""}{" "}
            {player.weightKg ? `· ${player.weightKg} kg` : ""}
          </p>
        </div>
      </div>
      {player.bio ? <article className="prose-panel">{player.bio}</article> : null}

      {totals ? (
        <>
          <SectionHeading en="Season Totals" zh="本季合計" />
          <div className="leaders-grid">
            {[
              ["場次", totals.gp],
              ["得分", totals.pts],
              ["助攻", totals.ast],
              ["籃板", totals.reb],
              ["封蓋", totals.blk],
              ["偷波", totals.stl],
            ].map(([label, value]) => (
              <div key={String(label)} className="leader-card">
                <p className="eyebrow">{label}</p>
                <p className="hero-score" style={{ fontSize: "2.6rem" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <SectionHeading en="Box Scores" zh="逐場數據" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>比賽</th>
              <th>PTS</th>
              <th>REB</th>
              <th>AST</th>
              <th>STL</th>
              <th>BLK</th>
              <th>3PM</th>
              <th>FG</th>
            </tr>
          </thead>
          <tbody>
            {player.boxScores.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/matches/${row.match.id}`}>
                    {row.match.homeTeam.name} vs {row.match.awayTeam.name}
                    <div className="muted">{formatMatchWhen(row.match.playedAt)}</div>
                  </Link>
                </td>
                <td>{row.pts}</td>
                <td>{row.reb}</td>
                <td>{row.ast}</td>
                <td>{row.stl}</td>
                <td>{row.blk}</td>
                <td>
                  {row.tpm}-{row.tpa}
                </td>
                <td>
                  {row.fgm}-{row.fga}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
