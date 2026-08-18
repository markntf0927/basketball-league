import { GradeFilter } from "@/components/grade-filter";
import { PageHeading } from "@/components/chrome";
import { TeamMark } from "@/components/match-card";
import { gradesInRegion, labeledGrades, parseRegion, REGIONS } from "@/lib/grades";
import { getGrades } from "@/lib/queries";
import Link from "next/link";

export const metadata = { title: "球隊" };

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; region?: string }>;
}) {
  const params = await searchParams;
  const grades = labeledGrades(await getGrades());
  const selectedGrade = grades.find((grade) => grade.id === params.grade);
  const gradeId = selectedGrade?.id;
  const region = selectedGrade?.region ?? parseRegion(params.region);
  const visible = gradeId
    ? grades.filter((grade) => grade.id === gradeId)
    : gradesInRegion(grades, region);
  const regionKeys = region
    ? [region]
    : REGIONS.map((item) => item.key).filter((key) =>
        visible.some((grade) => grade.region === key),
      );

  return (
    <>
      <PageHeading en="Teams" zh="球隊" />
      <GradeFilter
        basePath="/teams"
        region={region}
        gradeId={gradeId}
        grades={grades}
      />
      {regionKeys.map((key) => {
        const regionGrades = visible.filter((grade) => grade.region === key);
        if (regionGrades.length === 0) return null;
        const heading = REGIONS.find((item) => item.key === key)?.label;
        return (
          <section key={key} className="grade-block">
            {!region && heading ? (
              <div className="section-head">
                <h2 className="section-en">{heading}</h2>
              </div>
            ) : null}
            {regionGrades.map((grade) => (
              <div key={grade.id} className="grade-block">
                <div className="section-head">
                  <h2 className="section-en">{grade.shortLabel}</h2>
                  <p className="section-zh">{grade.seasonLabel}</p>
                </div>
                <div className="grid-teams">
                  {grade.teams.map(({ team }) => (
                    <Link
                      key={`${grade.id}-${team.id}`}
                      href={`/teams/${team.id}`}
                      className="team-card"
                    >
                      <TeamMark name={team.name} shortName={team.shortName} />
                      <h3>{team.name}</h3>
                      <p className="muted">查看陣容與賽績</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}
