import Link from "next/link";
import { formatMatchWhen } from "@/lib/format";
import { shortGradeLabel } from "@/lib/grades";

type Team = { id: string; name: string; shortName: string | null };
type MatchCardMatch = {
  id: string;
  playedAt: Date;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  grade: { name: string };
};

export function TeamMark({
  name,
  shortName,
}: {
  name: string;
  shortName?: string | null;
}) {
  const mark = (shortName ?? name).slice(0, 2);
  return (
    <span className="team-mark" title={name}>
      {mark}
    </span>
  );
}

export function MatchCard({ match }: { match: MatchCardMatch }) {
  const played = match.status === "final";
  const homeWon = played && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = played && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  return (
    <Link href={`/matches/${match.id}`} className="match-card">
      <div className="match-card-meta">
        <span title={match.grade.name}>{shortGradeLabel(match.grade.name)}</span>
        <span>{formatMatchWhen(match.playedAt)}</span>
      </div>
      <div className="match-card-teams">
        <div className={homeWon ? "is-winner" : undefined}>
          <TeamMark name={match.homeTeam.name} shortName={match.homeTeam.shortName} />
          <strong>{match.homeTeam.name}</strong>
        </div>
        <p className="scoreboard">
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
          <strong>{match.awayTeam.name}</strong>
        </div>
      </div>
      <p className="match-card-venue">{match.venue ?? "場地待定"}</p>
    </Link>
  );
}
