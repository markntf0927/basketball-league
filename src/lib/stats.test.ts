import { describe, expect, it } from "vitest";
import { leaders, rollupPlayerStats } from "./stats";

const lines = [
  {
    playerId: "p1",
    pts: 22,
    ast: 4,
    reb: 8,
    blk: 1,
    stl: 2,
    tpm: 3,
  },
  {
    playerId: "p1",
    pts: 18,
    ast: 6,
    reb: 5,
    blk: 0,
    stl: 1,
    tpm: 2,
  },
  {
    playerId: "p2",
    pts: 30,
    ast: 2,
    reb: 11,
    blk: 3,
    stl: 0,
    tpm: 1,
  },
];

describe("rollupPlayerStats", () => {
  it("sums per-match box scores onto the player", () => {
    expect(rollupPlayerStats(lines).p1).toEqual({
      playerId: "p1",
      gp: 2,
      pts: 40,
      ast: 10,
      reb: 13,
      blk: 1,
      stl: 3,
      tpm: 5,
    });
  });
});

describe("leaders", () => {
  it("orders players by season totals of the requested stat", () => {
    const pts = leaders(lines, "pts", 2);
    expect(pts.map((row) => row.playerId)).toEqual(["p1", "p2"]);
    expect(pts[0].pts).toBe(40);
  });
});
