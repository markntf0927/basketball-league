import { describe, expect, it } from "vitest";
import { mergeFromLegacy } from "./sync-merge";

describe("mergeFromLegacy", () => {
  it("updates scores and stats from the old site without overwriting editorial fields", () => {
    const merged = mergeFromLegacy(
      {
        sourceId: "game-1",
        stats: { team1Score: 70, team2Score: 64, pts: 12 },
        editorial: {
          photoUrl: "/local/player.jpg",
          videoUrl: "https://youtube.com/watch?v=abc",
          bio: "本地簡介",
        },
      },
      {
        sourceId: "game-1",
        stats: { team1Score: 88, team2Score: 81, pts: 24 },
        editorial: {
          photoUrl: "https://old.example/photo.jpg",
          videoUrl: "https://old.example/video",
          bio: "舊站簡介",
        },
      },
    );

    expect(merged.stats).toEqual({ team1Score: 88, team2Score: 81, pts: 24 });
    expect(merged.editorial).toEqual({
      photoUrl: "/local/player.jpg",
      videoUrl: "https://youtube.com/watch?v=abc",
      bio: "本地簡介",
    });
  });

  it("fills empty editorial fields from the old site", () => {
    const merged = mergeFromLegacy(
      {
        sourceId: "p1",
        stats: { pts: 10 },
        editorial: { photoUrl: null, videoUrl: null, bio: "" },
      },
      {
        sourceId: "p1",
        stats: { pts: 10 },
        editorial: {
          photoUrl: "https://old.example/p1.jpg",
          videoUrl: null,
          bio: "來自舊站",
        },
      },
    );

    expect(merged.editorial.photoUrl).toBe("https://old.example/p1.jpg");
    expect(merged.editorial.bio).toBe("來自舊站");
  });
});
