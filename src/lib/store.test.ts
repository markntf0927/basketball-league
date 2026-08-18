import { describe, expect, it } from "vitest";
import { loadLeague } from "./store";

describe("loadLeague", () => {
  it("loads the current Season 14 snapshot", () => {
    const league = loadLeague();
    const current = league.seasons.find((season) => season.isCurrent);

    expect(current?.slug).toBe("season-14");
  });

  it("includes the live site's teams, grades, players, and matches", () => {
    const league = loadLeague();

    expect(league.grades.length).toBeGreaterThan(15);
    expect(league.teams.length).toBeGreaterThan(100);
    expect(league.players.length).toBeGreaterThan(1000);
    expect(league.matches.length).toBeGreaterThan(500);
  });
});
