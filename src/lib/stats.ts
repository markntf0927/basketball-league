export type BoxLine = {
  playerId: string;
  pts: number;
  ast: number;
  reb: number;
  blk: number;
  stl: number;
  tpm: number;
};

export type PlayerTotals = BoxLine & { gp: number };

export type LeaderStat = Exclude<keyof BoxLine, "playerId">;

export function rollupPlayerStats(
  lines: BoxLine[],
): Record<string, PlayerTotals> {
  const totals: Record<string, PlayerTotals> = {};

  for (const line of lines) {
    const current = totals[line.playerId] ?? {
      playerId: line.playerId,
      gp: 0,
      pts: 0,
      ast: 0,
      reb: 0,
      blk: 0,
      stl: 0,
      tpm: 0,
    };
    current.gp += 1;
    current.pts += line.pts;
    current.ast += line.ast;
    current.reb += line.reb;
    current.blk += line.blk;
    current.stl += line.stl;
    current.tpm += line.tpm;
    totals[line.playerId] = current;
  }

  return totals;
}

export function leaders(
  lines: BoxLine[],
  stat: LeaderStat,
  limit = 10,
): PlayerTotals[] {
  return Object.values(rollupPlayerStats(lines))
    .sort((a, b) => b[stat] - a[stat])
    .slice(0, limit);
}
