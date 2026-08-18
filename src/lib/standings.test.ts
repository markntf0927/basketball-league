import { describe, expect, it } from "vitest";
import { computeStandings } from "./standings";

describe("computeStandings", () => {
  it("ranks by wins, then point difference, then points for", () => {
    const rows = computeStandings(
      ["a", "b", "c"],
      [
        { team1Id: "a", team2Id: "b", team1Score: 80, team2Score: 70 },
        { team1Id: "a", team2Id: "c", team1Score: 60, team2Score: 72 },
        { team1Id: "b", team2Id: "c", team1Score: 90, team2Score: 88 },
        { team1Id: "b", team2Id: "a", team1Score: 55, team2Score: 55 },
      ],
    );

    expect(rows.map((row) => row.teamId)).toEqual(["c", "a", "b"]);
    expect(rows[0]).toMatchObject({
      teamId: "c",
      w: 1,
      l: 1,
      t: 0,
      gp: 2,
      pf: 160,
      pa: 150,
      diff: 10,
    });
    expect(rows[0].pct).toBeCloseTo(0.5);
  });

  it("ignores unplayed games with missing scores", () => {
    const rows = computeStandings(
      ["a", "b"],
      [{ team1Id: "a", team2Id: "b", team1Score: null, team2Score: null }],
    );

    expect(rows).toEqual([
      {
        teamId: "a",
        w: 0,
        l: 0,
        t: 0,
        gp: 0,
        pf: 0,
        pa: 0,
        diff: 0,
        pct: 0,
      },
      {
        teamId: "b",
        w: 0,
        l: 0,
        t: 0,
        gp: 0,
        pf: 0,
        pa: 0,
        diff: 0,
        pct: 0,
      },
    ]);
  });
});
