#!/usr/bin/env python3
"""Fetch per-game box scores from the public Phoenix CMS and merge into league.json."""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEAGUE = ROOT / "src/data/league.json"
CACHE = Path("/tmp/pbl-game-details-by-id.json")
API = "http://www.phoenix-sports-721.com/api/admin/md/public/cpfan7866/game_detail-checklist"


def num(value: object) -> int:
    text = str(value or "").strip()
    if not text:
        return 0
    try:
        return int(float(text))
    except ValueError:
        return 0


def fetch_game(game_id: str) -> list[dict]:
    body = json.dumps({"and": {"game_id": game_id}}).encode()
    last_error: Exception | None = None
    for attempt in range(5):
        req = urllib.request.Request(
            API,
            data=body,
            headers={
                "Content-Type": "application/json",
                "Connection": "close",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                payload = json.loads(response.read())
            return [row for row in payload.get("list") or [] if not row.get("is_del")]
        except urllib.error.HTTPError as error:
            last_error = error
            time.sleep(1.5 * (attempt + 1))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            last_error = error
            time.sleep(0.8 * (attempt + 1))
    print(f"skip {game_id}: {last_error}", flush=True)
    return []


def to_box_score(row: dict) -> dict | None:
    match_id = row.get("game_id")
    player_id = row.get("player_id")
    team_id = row.get("team_id")
    row_id = row.get("_id")
    if not match_id or not player_id or not team_id or not row_id:
        return None
    return {
        "id": row_id,
        "matchId": match_id,
        "playerId": player_id,
        "teamId": team_id,
        "fgm": num(row.get("fgm")),
        "fga": num(row.get("fga")),
        "tpm": num(row.get("3pm")),
        "tpa": num(row.get("3pa")),
        "ftm": num(row.get("ftm")),
        "fta": num(row.get("fta")),
        "oreb": num(row.get("oreb")),
        "dreb": num(row.get("dreb")),
        "reb": num(row.get("reb")),
        "ast": num(row.get("ast")),
        "stl": num(row.get("stl")),
        "pf": num(row.get("pf")),
        "to": num(row.get("to")),
        "blk": num(row.get("blk")),
        "pts": num(row.get("pts")),
    }


def merge(cache: dict[str, list]) -> int:
    league = json.loads(LEAGUE.read_text())
    box_scores = []
    seen: set[str] = set()
    names: dict[str, str] = {}
    teams: dict[str, str] = {}
    for rows in cache.values():
        for row in rows:
            mapped = to_box_score(row)
            if not mapped or mapped["id"] in seen:
                continue
            seen.add(mapped["id"])
            box_scores.append(mapped)
            player_id = mapped["playerId"]
            name = str(row.get("player_name") or "").strip() or player_id
            names.setdefault(player_id, name)
            if row.get("team_id"):
                teams[player_id] = row["team_id"]

    known_players = {player["id"] for player in league["players"]}
    added = 0
    for player_id, name in names.items():
        if player_id in known_players:
            continue
        league["players"].append(
            {
                "id": player_id,
                "name": name,
                "photoUrl": None,
                "heightCm": None,
                "weightKg": None,
                "position": None,
                "bio": None,
            }
        )
        known_players.add(player_id)
        added += 1

    grade_by_id = {grade["id"]: grade for grade in league["grades"]}
    team_season = {
        row["teamId"]: grade_by_id[row["gradeId"]]["seasonId"]
        for row in league["teamGrades"]
        if row["gradeId"] in grade_by_id
    }
    known_teams = {team["id"] for team in league["teams"]}
    known_rosters = {
        (row["playerId"], row["teamId"], row["seasonId"]) for row in league["rosters"]
    }
    for player_id, team_id in teams.items():
        if team_id not in known_teams:
            continue
        season_id = team_season.get(team_id, "season-other")
        key = (player_id, team_id, season_id)
        if key in known_rosters:
            continue
        league["rosters"].append(
            {
                "playerId": player_id,
                "teamId": team_id,
                "seasonId": season_id,
                "number": None,
            }
        )
        known_rosters.add(key)

    league["boxScores"] = box_scores
    LEAGUE.write_text(json.dumps(league, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"players +{added} total={len(league['players'])}", flush=True)
    return len(box_scores)


def main() -> None:
    if "--merge-only" in sys.argv:
        cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
        count = merge(cache)
        print(f"merged boxScores={count}", flush=True)
        return

    league = json.loads(LEAGUE.read_text())
    current = [match for match in league["matches"] if match["seasonId"] == "season-14"]
    rest = [match for match in league["matches"] if match["seasonId"] != "season-14"]
    current.sort(key=lambda row: row["playedAt"], reverse=True)
    rest.sort(key=lambda row: row["playedAt"], reverse=True)
    game_ids = [match["id"] for match in current + rest]
    cache: dict[str, list] = {}
    if CACHE.exists():
        cache = json.loads(CACHE.read_text())
        print(f"resume cache {len(cache)} games", flush=True)

    pending = [game_id for game_id in game_ids if game_id not in cache]
    print(f"fetch {len(pending)} / {len(game_ids)} games", flush=True)
    for index, game_id in enumerate(pending, start=1):
        cache[game_id] = fetch_game(game_id)
        time.sleep(0.12)
        if index % 20 == 0 or index == len(pending):
            CACHE.write_text(json.dumps(cache))
            nonempty = sum(1 for rows in cache.values() if rows)
            print(
                f"  {index}/{len(pending)} cached={len(cache)} with_stats={nonempty}",
                flush=True,
            )
            merge(cache)

    CACHE.write_text(json.dumps(cache))
    count = merge(cache)
    nonempty = sum(1 for rows in cache.values() if rows)
    print(
        f"wrote {LEAGUE} boxScores={count} games_with_stats={nonempty}/{len(game_ids)}",
        flush=True,
    )


if __name__ == "__main__":
    sys.exit(main())
