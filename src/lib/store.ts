import leagueJson from "@/data/league.json";

export type Season = {
  id: string;
  name: string;
  slug: string;
  isCurrent: boolean;
};

export type Grade = {
  id: string;
  name: string;
  sortOrder: number;
  seasonId: string;
};

export type Team = {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
};

export type Player = {
  id: string;
  name: string;
  photoUrl: string | null;
  heightCm: number | null;
  weightKg: number | null;
  position: string | null;
  bio: string | null;
};

export type MatchRecord = {
  id: string;
  seasonId: string;
  gradeId: string;
  homeTeamId: string;
  awayTeamId: string;
  playedAt: string;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  videoUrl: string | null;
};

export type BoxScore = {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  pf: number;
  to: number;
  blk: number;
  pts: number;
};

export type NewsPost = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  imageUrl: string | null;
  publishedAt: string;
  seasonId: string | null;
  matchId: string | null;
};

export type LeagueData = {
  seasons: Season[];
  grades: Grade[];
  teams: Team[];
  teamGrades: { teamId: string; gradeId: string }[];
  players: Player[];
  rosters: {
    playerId: string;
    teamId: string;
    seasonId: string;
    number: string | null;
  }[];
  matches: MatchRecord[];
  boxScores: BoxScore[];
  news: NewsPost[];
  pages: { slug: string; title: string; body: string }[];
};

export function loadLeague(): LeagueData {
  return leagueJson as LeagueData;
}

export function byId<T extends { id: string }>(
  rows: T[],
  id: string,
): T | undefined {
  return rows.find((row) => row.id === id);
}
