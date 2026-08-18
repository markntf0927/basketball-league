#!/usr/bin/env python3
"""Build src/data/league.json from the public Phoenix site lists."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/data/league.json"

ABOUT = """PHOENIXBL（鳳凰籃球聯賽）：你準備好參加 PBL 比賽了嗎？

勝藝（東莞）布料加工廠贊助：各組別獎項。

比賽時間：星期六、星期日 3:00pm - 11:00pm。平日組另有場次。
比賽地點：荃灣、葵涌、屯門、天水圍康文署轄下室內運動場。
賽制：因應參賽隊數而定。
裁判：由本會指定裁判執行。

獎品：聯賽總冠、亞、季軍均獲得球員獎牌一個。每屆常規賽另設個人獎項：MVP、得分王、三分王、籃板王、助攻王、偷波王、封波王。

報名 WhatsApp：92335681
聯絡人：MR. CHAN
電郵：phoenix.basketball.league@gmail.com"""

RULES = """賽例：基本會依據籃球總會最新公布之球例執法。

請假通知：球隊請假需要在該日十五天或之前通知賽會。季後賽一律不接受請假。
球員必須最少參加一場常規賽才可以參加季後賽。

取消賽事：八號或以上颱風、場地使用權問題、球證認為場地不適宜作賽。補賽由賽會安排。"""

SEASON_RE = re.compile(r"Season\s*(\d+)", re.I)


def load_list(name: str) -> list[dict]:
    path = Path(f"/tmp/pbl-{name}.json")
    data = json.loads(path.read_text())
    return [row for row in data.get("list") or [] if not row.get("is_del")]


def season_from_name(name: str) -> tuple[str, str]:
    match = SEASON_RE.search(name or "")
    if not match:
        return "season-other", "其他賽季"
    number = match.group(1)
    return f"season-{number}", f"Season {number}"


def parse_score(value: object) -> int | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def parse_date(value: str | None) -> str:
    raw = (value or "").strip()
    if not raw:
        return datetime.now(timezone.utc).isoformat()
    if re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$", raw):
        return f"{raw}:00+08:00"
    return raw


def short_name(name: str) -> str:
    cleaned = name.strip()
    return cleaned[:2] if cleaned else "?"


def main() -> None:
    groups = load_list("team_group-checklist")
    teams_raw = load_list("team-checklist")
    players_raw = load_list("player-checklist")
    games_raw = load_list("game-checklist")

    seasons: dict[str, dict] = {}
    grades: dict[str, dict] = {}

    def ensure_grade(grade_id: str, name: str, sort_order: int) -> None:
        season_id, season_name = season_from_name(name)
        seasons[season_id] = {
            "id": season_id,
            "name": season_name,
            "slug": season_id,
            "isCurrent": season_id == "season-14",
        }
        if season_id != "season-14":
            seasons[season_id]["isCurrent"] = False
        grades[grade_id] = {
            "id": grade_id,
            "name": name.strip() or "未命名組別",
            "sortOrder": sort_order,
            "seasonId": season_id,
        }

    for index, group in enumerate(groups):
        ensure_grade(group["_id"], group.get("name") or "", index)

    extra_index = 100
    for team in teams_raw:
        grade_id = team.get("team_group_id")
        if grade_id and grade_id not in grades:
            ensure_grade(grade_id, team.get("team_group_name") or "其他組別", extra_index)
            extra_index += 1

    if "season-14" in seasons:
        for season in seasons.values():
            season["isCurrent"] = season["id"] == "season-14"
    else:
        first = next(iter(seasons.values()), None)
        if first:
            first["isCurrent"] = True

    teams = []
    team_grades = []
    seen_teams: set[str] = set()
    for team in teams_raw:
        team_id = team["_id"]
        if team_id in seen_teams:
            continue
        seen_teams.add(team_id)
        name = (team.get("name") or "").strip() or "未命名球隊"
        teams.append(
            {
                "id": team_id,
                "name": name,
                "shortName": short_name(name),
                "logoUrl": team.get("logo") or team.get("image") or None,
            }
        )
        if team.get("team_group_id"):
            team_grades.append({"teamId": team_id, "gradeId": team["team_group_id"]})

    team_ids = {team["id"] for team in teams}

    team_to_grade = {row["teamId"]: row["gradeId"] for row in team_grades}

    players = []
    rosters = []
    for player in players_raw:
        name = (player.get("name") or "").strip() or "未命名球員"
        player_id = player["_id"]
        team_id = player.get("team_id") or ""
        players.append(
            {
                "id": player_id,
                "name": name,
                "photoUrl": player.get("avatar") or player.get("image") or None,
                "heightCm": None,
                "weightKg": None,
                "position": player.get("position") or None,
                "bio": player.get("bio") or None,
            }
        )
        if team_id and team_id in team_ids:
            grade = grades.get(team_to_grade.get(team_id, ""), {})
            season_id = grade.get("seasonId") or "season-other"
            rosters.append(
                {
                    "playerId": player_id,
                    "teamId": team_id,
                    "seasonId": season_id,
                    "number": player.get("number") or None,
                }
            )

    team_by_id = {team["id"]: team for team in teams}
    matches = []
    for game in games_raw:
        home_id = game.get("team1_id") or ""
        away_id = game.get("team2_id") or ""
        if not home_id or not away_id:
            continue
        if home_id not in team_ids:
            stub = {
                "id": home_id,
                "name": (game.get("team1_name") or "未知球隊").strip(),
                "shortName": short_name(game.get("team1_name") or "?"),
                "logoUrl": None,
            }
            teams.append(stub)
            team_by_id[home_id] = stub
            team_ids.add(home_id)
        if away_id not in team_ids:
            stub = {
                "id": away_id,
                "name": (game.get("team2_name") or "未知球隊").strip(),
                "shortName": short_name(game.get("team2_name") or "?"),
                "logoUrl": None,
            }
            teams.append(stub)
            team_by_id[away_id] = stub
            team_ids.add(away_id)

        grade_id = team_to_grade.get(home_id) or next(iter(grades), "season-other")
        season_id = grades.get(grade_id, {}).get("seasonId") or "season-other"
        home_score = parse_score(game.get("team1_score"))
        away_score = parse_score(game.get("team2_score"))
        matches.append(
            {
                "id": game["_id"],
                "seasonId": season_id,
                "gradeId": grade_id,
                "homeTeamId": home_id,
                "awayTeamId": away_id,
                "playedAt": parse_date(game.get("date")),
                "venue": (game.get("venue") or "").strip() or None,
                "homeScore": home_score,
                "awayScore": away_score,
                "status": "final" if home_score is not None and away_score is not None else "scheduled",
                "videoUrl": game.get("video") or game.get("youtube") or None,
            }
        )

    matches.sort(key=lambda row: row["playedAt"], reverse=True)

    box_scores = []
    detail_cache = Path("/tmp/pbl-game-details-by-id.json")
    if detail_cache.exists():
        cache = json.loads(detail_cache.read_text())
        seen: set[str] = set()
        for rows in cache.values():
            for row in rows:
                if row.get("is_del"):
                    continue
                row_id = row.get("_id")
                if (
                    not row_id
                    or row_id in seen
                    or not row.get("game_id")
                    or not row.get("player_id")
                    or not row.get("team_id")
                ):
                    continue
                seen.add(row_id)
                box_scores.append(
                    {
                        "id": row_id,
                        "matchId": row["game_id"],
                        "playerId": row["player_id"],
                        "teamId": row["team_id"],
                        "fgm": parse_score(row.get("fgm")) or 0,
                        "fga": parse_score(row.get("fga")) or 0,
                        "tpm": parse_score(row.get("3pm")) or 0,
                        "tpa": parse_score(row.get("3pa")) or 0,
                        "ftm": parse_score(row.get("ftm")) or 0,
                        "fta": parse_score(row.get("fta")) or 0,
                        "oreb": parse_score(row.get("oreb")) or 0,
                        "dreb": parse_score(row.get("dreb")) or 0,
                        "reb": parse_score(row.get("reb")) or 0,
                        "ast": parse_score(row.get("ast")) or 0,
                        "stl": parse_score(row.get("stl")) or 0,
                        "pf": parse_score(row.get("pf")) or 0,
                        "to": parse_score(row.get("to")) or 0,
                        "blk": parse_score(row.get("blk")) or 0,
                        "pts": parse_score(row.get("pts")) or 0,
                    }
                )

    news = []
    for match in matches:
        if match["status"] != "final":
            continue
        home = team_by_id[match["homeTeamId"]]["name"]
        away = team_by_id[match["awayTeamId"]]["name"]
        grade_name = grades.get(match["gradeId"], {}).get("name", "")
        title = f"{grade_name} {home} vs {away}".strip()
        excerpt = f"{home} {match['homeScore']}–{match['awayScore']} {away}"
        news.append(
            {
                "id": f"news-{match['id']}",
                "title": title,
                "excerpt": excerpt,
                "body": f"{match['venue'] or '比賽場地'}，{excerpt}。",
                "imageUrl": None,
                "publishedAt": match["playedAt"],
                "seasonId": match["seasonId"],
                "matchId": match["id"],
            }
        )
        if len(news) >= 24:
            break

    pages = [
        {"slug": "about", "title": "球會資料", "body": ABOUT},
        {"slug": "rules", "title": "比賽規則", "body": RULES},
        {
            "slug": "contact",
            "title": "聯絡我們",
            "body": "WhatsApp：92335681\n電郵：phoenix.basketball.league@gmail.com\n地址：301 Flat C, 15/F, Tak Wing Ind Building, Tsun Wan RD3, Tuen Mun, NT",
        },
    ]

    league = {
        "seasons": sorted(seasons.values(), key=lambda row: row["name"]),
        "grades": sorted(grades.values(), key=lambda row: (row["sortOrder"], row["name"])),
        "teams": teams,
        "teamGrades": team_grades,
        "players": players,
        "rosters": rosters,
        "matches": matches,
        "boxScores": box_scores,
        "news": news,
        "pages": pages,
    }

    OUT.write_text(json.dumps(league, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"wrote {OUT} seasons={len(league['seasons'])} grades={len(league['grades'])} "
        f"teams={len(teams)} players={len(players)} matches={len(matches)} "
        f"boxScores={len(box_scores)} news={len(news)}"
    )


if __name__ == "__main__":
    main()
