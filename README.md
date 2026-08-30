# Norse Roundnet Crew Stats & Analytics

An analytics dashboard and tournament match tracking platform for the Norse Roundnet crew, tracking 32 friends across 36 tournaments and 6,700+ matches using data extracted directly from Fwango.

---

## Features

- **Crew Leaderboard**: Sortable rankings by Points %, Win %, Total Wins, Matches Played, and Win-Loss-Tie Records with subtle row striping and tabular numbers.
- **Career Player Profiles**: Complete match log grouped into tournament accordions, frequent teammate synergies, most frequent opponents, and quick stats.
- **Teammate & Rival Jump-to-Profile**: Direct click-to-profile navigation for fellow crew members from any player's synergy matrix.
- **Head-to-Head Showdowns**: Direct rivalry matrix comparing any two players, head-to-head match wins, and total scored points.
- **Thrillers & Overtime Records**: Filterable feed of overtime battles, closest nail-biters, and highest scoring games.
- **Tournament Directory**: Browse every tournament with direct links to Fwango brackets and match-by-match breakdowns.
- **Dual Light / Dark Theme**: Fully toggleable with WCAG-accessible contrast, soft ice blue & warm gold accents on dark, and black & gold on light mode.
- **Full Browser History & URL Routing**: Browser Back and Forward arrows work naturally (`#/leaderboard`, `#/profile?player=...`, `#/tournaments?id=...`, `#/h2h`, `#/thrillers`).
- **Norse Roundnet Branding**: Custom Viking helmet logo with transparent background and favicon.

---

## Quick Start

### 1. Launch the Web App
Double-click `run_web.bat` or run:
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Sync Future Tournaments & Friends
1. Add or remove friend names in `friends.txt`.
2. Double-click `sync_roundnet.bat` or run:
```bash
python sync_roundnet.py
```
This automatically pulls tournament brackets from Fwango, regenerates `export/` CSV and SQL files, updates `roundnet_data.json`, and rebuilds the web dashboard.
