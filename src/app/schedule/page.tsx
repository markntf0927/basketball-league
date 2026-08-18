import { GradeFilter } from "@/components/grade-filter";
import { PageHeading } from "@/components/chrome";
import { MatchCard } from "@/components/match-card";
import { gradesInRegion, labeledGrades, parseRegion } from "@/lib/grades";
import { getGrades, getSchedule } from "@/lib/queries";

export const metadata = { title: "比賽時間表" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; region?: string }>;
}) {
  const params = await searchParams;
  const grades = labeledGrades(await getGrades());
  const selectedGrade = grades.find((grade) => grade.id === params.grade);
  const gradeId = selectedGrade?.id;
  const region = selectedGrade?.region ?? parseRegion(params.region);
  const scoped = gradesInRegion(grades, region);
  const matches = await getSchedule({
    gradeId,
    gradeIds:
      !gradeId && region ? scoped.map((grade) => grade.id) : undefined,
    take: 80,
  });

  return (
    <>
      <PageHeading en="Schedule" zh="比賽時間表" />
      <p className="muted">先選地區，再選組別。未篩選時顯示最近 80 場。</p>
      <GradeFilter
        basePath="/schedule"
        region={region}
        gradeId={gradeId}
        grades={grades}
      />
      {matches.length > 0 ? (
        <div className="grid-matches">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <p className="empty-panel">此篩選沒有賽程。</p>
      )}
    </>
  );
}
