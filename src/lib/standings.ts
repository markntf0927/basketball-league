export type GameResult = {
  team1Id: string;
  team2Id: string;
  team1Score: number | null;
  team2Score: number | null;
};

export type StandingRow = {
  teamId: string;
  w: number;
  l: number;
  t: number;
  gp: number;
  pf: number;
  pa: number;
  diff: number;
  pct: number;
};

function emptyRow(teamId: string): StandingRow {
  return {
    teamId,
    w: 0,
    l: 0,
    t: 0,
    gp: 0,
    pf: 0,
    pa: 0,
    diff: 0,
    pct: 0,
  };
}

export function computeStandings(
  teamIds: string[],
  games: GameResult[],
): StandingRow[] {
  const rows = new Map(teamIds.map((id) => [id, emptyRow(id)]));

  for (const game of games) {
    if (game.team1Score === null || game.team2Score === null) continue;
    const home = rows.get(game.team1Id);
    const away = rows.get(game.team2Id);
    if (!home || !away) continue;

    home.gp += 1;
    away.gp += 1;
    home.pf += game.team1Score;
    home.pa += game.team2Score;
    away.pf += game.team2Score;
    away.pa += game.team1Score;

    if (game.team1Score > game.team2Score) {
      home.w += 1;
      away.l += 1;
    } else if (game.team2Score > game.team1Score) {
      away.w += 1;
      home.l += 1;
    } else {
      home.t += 1;
      away.t += 1;
    }
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      diff: row.pf - row.pa,
      pct: row.gp === 0 ? 0 : row.w / row.gp,
    }))
    .sort((a, b) => b.w - a.w || b.diff - a.diff || b.pf - a.pf);
}
