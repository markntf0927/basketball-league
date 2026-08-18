import { computeStandings } from "./standings";
import { leaders } from "./stats";
import { byId, loadLeague, type MatchRecord } from "./store";

const UNKNOWN_SEASON = {
  id: "season-other",
  name: "其他賽季",
  slug: "season-other",
  isCurrent: false,
};

function seasonOf(seasonId: string) {
  return byId(loadLeague().seasons, seasonId) ?? UNKNOWN_SEASON;
}

function teamOf(teamId: string) {
  return (
    byId(loadLeague().teams, teamId) ?? {
      id: teamId,
      name: "未知球隊",
      shortName: "?",
      logoUrl: null,
    }
  );
}

function gradeOf(gradeId: string) {
  return (
    byId(loadLeague().grades, gradeId) ?? {
      id: gradeId,
      name: "未分類",
      sortOrder: 999,
      seasonId: "season-other",
    }
  );
}

function playerOf(playerId: string) {
  return (
    byId(loadLeague().players, playerId) ?? {
      id: playerId,
      name: "未知球員",
      photoUrl: null,
      heightCm: null,
      weightKg: null,
      position: null,
      bio: null,
    }
  );
}

function withMatchRelations(match: MatchRecord) {
  return {
    ...match,
    playedAt: new Date(match.playedAt),
    homeTeam: teamOf(match.homeTeamId),
    awayTeam: teamOf(match.awayTeamId),
    grade: gradeOf(match.gradeId),
    season: seasonOf(match.seasonId),
  };
}

export async function getCurrentSeason() {
  const { seasons } = loadLeague();
  return seasons.find((season) => season.isCurrent) ?? seasons[0] ?? null;
}

export async function requireSeason() {
  const season = await getCurrentSeason();
  if (!season) throw new Error("尚未建立賽季");
  return season;
}

export async function getGrades(seasonId?: string) {
  const league = loadLeague();
  return league.grades
    .filter((grade) => !seasonId || grade.seasonId === seasonId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((grade) => ({
      ...grade,
      teams: league.teamGrades
        .filter((row) => row.gradeId === grade.id)
        .map((row) => ({ team: teamOf(row.teamId) })),
    }))
    .filter((grade) => grade.teams.length > 0);
}

export async function getTeam(id: string) {
  const league = loadLeague();
  const team = byId(league.teams, id);
  if (!team) return null;

  return {
    ...team,
    grades: league.teamGrades
      .filter((row) => row.teamId === id)
      .map((row) => {
        const grade = gradeOf(row.gradeId);
        return {
          ...row,
          grade: { ...grade, season: seasonOf(grade.seasonId) },
        };
      }),
    rosters: league.rosters
      .filter((row) => row.teamId === id)
      .map((row) => ({
        ...row,
        player: playerOf(row.playerId),
        season: seasonOf(row.seasonId),
      })),
  };
}

export async function getTeamMatches(teamId: string) {
  return loadLeague()
    .matches.filter(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
    )
    .map(withMatchRelations)
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
}

export async function getSchedule(options?: {
  seasonId?: string;
  gradeId?: string;
  gradeIds?: string[];
  take?: number;
}) {
  const { seasonId, gradeId, gradeIds, take = 80 } = options ?? {};
  const rows = loadLeague()
    .matches.filter(
      (match) =>
        (!seasonId || match.seasonId === seasonId) &&
        (!gradeId || match.gradeId === gradeId) &&
        (!gradeIds || gradeIds.includes(match.gradeId)),
    )
    .map(withMatchRelations)
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
  return take ? rows.slice(0, take) : rows;
}

export async function getMatch(id: string) {
  const league = loadLeague();
  const match = byId(league.matches, id);
  if (!match) return null;

  return {
    ...withMatchRelations(match),
    boxScores: league.boxScores
      .filter((row) => row.matchId === id)
      .map((row) => ({ ...row, player: playerOf(row.playerId) })),
  };
}

export async function getPlayer(id: string) {
  const league = loadLeague();
  const player = byId(league.players, id);
  if (!player) return null;

  return {
    ...player,
    rosters: league.rosters
      .filter((row) => row.playerId === id)
      .map((row) => ({
        ...row,
        team: teamOf(row.teamId),
        season: seasonOf(row.seasonId),
      })),
    boxScores: league.boxScores
      .filter((row) => row.playerId === id)
      .map((row) => {
        const match = byId(league.matches, row.matchId);
        if (!match) return null;
        return { ...row, match: withMatchRelations(match) };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.match.playedAt.getTime() - a.match.playedAt.getTime()),
  };
}

export async function getNews() {
  const league = loadLeague();
  return league.news
    .map((post) => ({
      ...post,
      publishedAt: new Date(post.publishedAt),
      match: post.matchId ? byId(league.matches, post.matchId) ?? null : null,
      season: post.seasonId ? seasonOf(post.seasonId) ?? null : null,
    }))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getNewsPost(id: string) {
  const league = loadLeague();
  const post = byId(league.news, id);
  if (!post) return null;
  const match = post.matchId ? byId(league.matches, post.matchId) : null;

  return {
    ...post,
    publishedAt: new Date(post.publishedAt),
    match: match
      ? {
          ...match,
          homeTeam: teamOf(match.homeTeamId),
          awayTeam: teamOf(match.awayTeamId),
        }
      : null,
  };
}

export async function getPage(slug: string) {
  return loadLeague().pages.find((page) => page.slug === slug) ?? null;
}

export async function getStandingsByGrade(seasonId?: string) {
  const league = loadLeague();
  const grades = await getGrades(seasonId);
  const matches = league.matches.filter(
    (match) =>
      match.status === "final" && (!seasonId || match.seasonId === seasonId),
  );

  return grades.map((grade) => {
    const teamIds = grade.teams.map((row) => row.team.id);
    const rows = computeStandings(
      teamIds,
      matches
        .filter((match) => match.gradeId === grade.id)
        .map((match) => ({
          team1Id: match.homeTeamId,
          team2Id: match.awayTeamId,
          team1Score: match.homeScore,
          team2Score: match.awayScore,
        })),
    ).map((row) => ({
      ...row,
      team: grade.teams.find((item) => item.team.id === row.teamId)!.team,
    }));
    return { grade, rows };
  });
}

export async function getLeagueLeaders(seasonId?: string) {
  const league = loadLeague();
  const finalMatchIds = new Set(
    league.matches
      .filter(
        (match) =>
          match.status === "final" && (!seasonId || match.seasonId === seasonId),
      )
      .map((match) => match.id),
  );
  const boxScores = league.boxScores.filter((row) =>
    finalMatchIds.has(row.matchId),
  );
  const lines = boxScores.map((row) => ({
    playerId: row.playerId,
    pts: row.pts,
    ast: row.ast,
    reb: row.reb,
    blk: row.blk,
    stl: row.stl,
    tpm: row.tpm,
  }));
  const names = Object.fromEntries(
    boxScores.map((row) => [row.playerId, playerOf(row.playerId)]),
  );

  const categories = [
    { key: "pts" as const, label: "得分" },
    { key: "ast" as const, label: "助攻" },
    { key: "reb" as const, label: "籃板" },
    { key: "blk" as const, label: "封蓋" },
    { key: "stl" as const, label: "偷波" },
    { key: "tpm" as const, label: "三分" },
  ];

  return categories.map((category) => ({
    ...category,
    rows: leaders(lines, category.key, 8).map((row) => ({
      ...row,
      player: names[row.playerId],
    })),
  }));
}

export async function getLatestMatches(take = 6) {
  return getSchedule({ take });
}
