"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { formatBarDate } from "@/lib/format";
import { REGIONS, regionOfGrade, type RegionKey } from "@/lib/grades";

export type MatchBarItem = {
  id: string;
  playedAt: string;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  homeName: string;
  awayName: string;
  gradeName: string;
};

export function MatchBar({ matches }: { matches: MatchBarItem[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<RegionKey | "all">("all");

  const available = useMemo(() => {
    const keys = new Set(matches.map((match) => regionOfGrade(match.gradeName)));
    return REGIONS.filter((item) => keys.has(item.key));
  }, [matches]);

  const visible = matches.filter(
    (match) => region === "all" || regionOfGrade(match.gradeName) === region,
  );

  function scrollBy(direction: number) {
    scroller.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  }

  return (
    <section className="match-bar" aria-label="最新賽果">
      <div className="match-bar-tabs" role="tablist">
        <button
          type="button"
          className={region === "all" ? "is-active" : undefined}
          onClick={() => setRegion("all")}
        >
          ALL
        </button>
        {available.map((item) => (
          <button
            key={item.key}
            type="button"
            className={region === item.key ? "is-active" : undefined}
            onClick={() => setRegion(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="match-bar-row">
        <button
          type="button"
          className="match-bar-arrow"
          aria-label="較早賽事"
          onClick={() => scrollBy(-1)}
        >
          ‹
        </button>
        <div className="match-bar-track" ref={scroller}>
          {visible.map((match) => {
            const played = match.status === "final";
            return (
              <Link key={match.id} href={`/matches/${match.id}`} className="match-bar-card">
                <p className="match-bar-date">
                  {formatBarDate(new Date(match.playedAt))}
                </p>
                <div className="match-bar-teams">
                  <p className={played && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? "is-winner" : undefined}>
                    <span>{match.homeName}</span>
                    <strong>{played ? match.homeScore : "-"}</strong>
                  </p>
                  <p className={played && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? "is-winner" : undefined}>
                    <span>{match.awayName}</span>
                    <strong>{played ? match.awayScore : "-"}</strong>
                  </p>
                </div>
                <p className="match-bar-venue">{match.venue ?? "場地待定"}</p>
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className="match-bar-arrow"
          aria-label="較新賽事"
          onClick={() => scrollBy(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
