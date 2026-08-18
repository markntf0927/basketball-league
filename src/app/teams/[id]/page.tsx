import { MatchCard, TeamMark } from "@/components/match-card";
import { SectionHeading } from "@/components/chrome";
import { getTeam, getTeamMatches } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const matches = (await getTeamMatches(team.id)).slice(0, 40);
  const roster = team.rosters;

  return (
    <>
      <div className="player-hero">
        <TeamMark name={team.name} shortName={team.shortName} />
        <div>
          <p className="eyebrow">
            {team.grades.map((row) => row.grade.name).join(" · ")}
          </p>
          <h1 className="page-title" style={{ margin: "0.3rem 0 0" }}>
            {team.name}
          </h1>
        </div>
      </div>

      <SectionHeading en="Roster" zh="陣容" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>球員</th>
              <th>位置</th>
              <th>身高</th>
              <th>體重</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((spot) => (
              <tr key={spot.playerId}>
                <td>{spot.number ?? "—"}</td>
                <td>
                  <Link href={`/players/${spot.player.id}`}>{spot.player.name}</Link>
                </td>
                <td>{spot.player.position ?? "—"}</td>
                <td>{spot.player.heightCm ? `${spot.player.heightCm} cm` : "—"}</td>
                <td>{spot.player.weightKg ? `${spot.player.weightKg} kg` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading en="Results" zh="比賽記錄" />
      <div className="grid-matches">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </>
  );
}
