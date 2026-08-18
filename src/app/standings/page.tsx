import { PageHeading } from "@/components/chrome";
import { TeamMark } from "@/components/match-card";
import { pctLabel } from "@/lib/format";
import { getStandingsByGrade } from "@/lib/queries";
import Link from "next/link";

export const metadata = { title: "排行榜" };

export default async function StandingsPage() {
  const groups = await getStandingsByGrade();

  return (
    <>
      <PageHeading en="Standings" zh="排行榜" />
      {groups.map(({ grade, rows }) => (
        <section key={grade.id} className="grade-block">
          <div className="section-head">
            <h2 className="section-en">{grade.name}</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排序</th>
                  <th>隊伍</th>
                  <th>W</th>
                  <th>L</th>
                  <th>T</th>
                  <th>PCT</th>
                  <th>GP</th>
                  <th>PF</th>
                  <th>PA</th>
                  <th>DIFF</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.teamId}>
                    <td className="rank">{String(index + 1).padStart(2, "0")}</td>
                    <td>
                      <Link href={`/teams/${row.team.id}`} className="team-cell">
                        <TeamMark name={row.team.name} shortName={row.team.shortName} />
                        {row.team.name}
                      </Link>
                    </td>
                    <td>{row.w}</td>
                    <td>{row.l}</td>
                    <td>{row.t}</td>
                    <td>{pctLabel(row.pct)}</td>
                    <td>{row.gp}</td>
                    <td>{row.pf}</td>
                    <td>{row.pa}</td>
                    <td>
                      {row.diff > 0 ? "+" : ""}
                      {row.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
