import { describe, expect, it } from "vitest";
import {
  labeledGrades,
  regionOfGrade,
  seasonLabelOf,
  shortGradeLabel,
} from "./grades";

describe("grade display labels", () => {
  it("maps names to regions", () => {
    expect(regionOfGrade("荃葵九平日鳳凰盃 Season 14")).toBe("tky");
    expect(regionOfGrade("屯天元假日鳳凰盃D1 Season21")).toBe("tty");
    expect(regionOfGrade("九龍區平日 Season 1")).toBe("kln");
    expect(
      regionOfGrade(
        "Phoenix Basketball League x WonderKids Youths League Group A",
      ),
    ).toBe("youth");
    expect(regionOfGrade("BLT PET PET 籃球聯賽盃2026")).toBe("other");
  });

  it("shortens repetitive prefixes", () => {
    expect(shortGradeLabel("荃葵九平日鳳凰盃 Season 14")).toBe("平日鳳凰盃 S14");
    expect(shortGradeLabel("屯天元平日鳳凰盃D5 Season 14")).toBe(
      "平日鳳凰盃 D5 S14",
    );
    expect(
      shortGradeLabel(
        "Phoenix Basketball League x WonderKids Youths League Group A",
      ),
    ).toBe("Group A");
  });

  it("reads season labels from the name", () => {
    expect(seasonLabelOf("荃葵九假日 Season25", "season-25")).toBe("Season 25");
    expect(seasonLabelOf("BLT騎馬蛇戰籃球聯賽盃", "season-other")).toBe(
      "其他賽季",
    );
  });

  it("letters duplicate grades that share a name", () => {
    const labeled = labeledGrades([
      {
        id: "a",
        name: "荃葵九平日鳳凰盃 Season 14",
        seasonId: "season-14",
        sortOrder: 2,
      },
      {
        id: "b",
        name: "荃葵九平日鳳凰盃 Season 14",
        seasonId: "season-14",
        sortOrder: 3,
      },
    ]);
    expect(labeled.map((row) => row.shortLabel)).toEqual([
      "平日鳳凰盃 S14 · 組A",
      "平日鳳凰盃 S14 · 組B",
    ]);
  });
});
