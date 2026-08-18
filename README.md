# Phoenix Basketball League

Public site for 鳳凰籃球聯賽 (Phoenix Basketball League): schedule, teams, standings, box scores, and league leaders.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Data lives in `src/data/league.json`. Re-import from the legacy CMS with:

```bash
python3 scripts/fetch-box-scores.py --merge-only
```
