# Antigravity AI Project Context & Session Resumption

> **For Antigravity AI on the laptop**: This file contains the complete architectural, design, and implementation context from the original development sessions. Read this file to seamlessly continue development without losing context.

---

## 1. Project Overview & Architecture

- **Project Location**: `scratch/roundnet-stats`
- **Purpose**: Analytics web dashboard and automated ETL pipeline for 32 friends playing competitive roundnet on Fwango.
- **Tech Stack**:
  - **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons.
  - **ETL Pipeline**: Python (`sync_roundnet.py`) querying public Fwango API endpoints.
  - **Database Integration**: Exports relational CSV files and a complete Microsoft SQL Server T-SQL script (`export/fwango_data_sqlserver.sql`).
  - **Data Payload**: Pre-aggregated `web/src/data/roundnet_data.json` loaded directly by React components for instant client-side filtering.

---

## 2. Roster & Identity Mapping

The roster is defined in `friends.txt` (currently 32 friends, 36 tournaments, 6,738 matches).
Special Fwango ID and alias mappings implemented in `sync_roundnet.py` and `PlayerProfileTab.jsx`:
- **Patrick Flynn**: Fwango ID `Phi1BtY7XgZ6V5ObV4CZE5NsSEr2` (also aliases "Pat Flynn")
- **Aiden Gill**: Fwango ID `tMCRyrGHCxZ45oV9L2wxFJYqYcz2` (also aliases "Aidan Gill")
- **Whitney Aaron**: Fwango ID `7nJkpG5foQWj8ZL05CbTF8D7rJg1` (also aliases "Whitney Graham")
- **Austin Klosterman**: Dual accounts `3Vji0DuSTjYMSbKyeZLjNTvPPAf2` & `5yEKcxJG3cOqomvxMhjaQIbtEdG3`
- Full friends list: Logan Graham, Logan Bittner, Alex Aaron, Sean Hennigan, Evan Talley, Patrick Flynn, Preston Murray, Preston Winiger, Connor Wallace, Aiden Gill, Mack Medert, Whitney Aaron, Gabby Schwaninger, Austin Klosterman, Kyle Weinberg, Grant Barnhill, Kylie Anderson, Jason Reid, Zach Smith, Bryson Stanfill, Jonas Isaacs, Patrick Butler, Joseph Berger, Hunter Smith, Will Blackburn, Braden Blackburn, Carter Capek, Ethan Watkins, Toby Zorn, Silas McDaniel, Eric Speagle.

---

## 3. Key Design Decisions & Features Implemented

1. **Dual Light & Dark Theme**:
   - Toggled via `Sun` / `Moon` icon in header, persisted in `localStorage` under `roundnet_theme`.
   - Dark theme uses neutral deep slate (`#0B0F17` / `#151D2C`), eliminating monochromatic blue fatigue.
   - Accents on dark mode: Soft Ice Blue (`#A7CEFC`) and Warm Soft Gold (`#FFE492`).
   - Accents on light mode: Crisp black, slate, and gold.
   - WCAG AAA/AA accessible contrast: Losses deepened to `#b91c1c` (light) / `#fb7185` (dark), wins to `#0f172a` (light) / `#67e8f9` cyan (dark).

2. **Typography**:
   - Google Sans variable font (`wght@400..700`, `opsz@17..18`) imported in `index.html` and configured as Tailwind's default sans font.

3. **Leaderboard Layout**:
   - Clean auto layout with natural column breathing room (`px-4`), alternating row striping (`even:bg-slate-100/75`), right-aligned tabular figures (`tabular-nums`), and sorting by any metric (Points %, Win %, Wins, Matches, Losses, Ties).

4. **Player Profiles Tournament Accordions**:
   - Matches are grouped by tournament into collapsible accordions (most recent first), with "Expand All" and "Collapse All" controls and search filtering.

5. **Teammate & Rival Profile Links**:
   - Teammates and rivals who are members of the crew display a clickable `Profile →` pill that navigates straight to their career profile.

6. **Browser History & URL Routing**:
   - Hash router in `App.jsx` using browser `window.history.pushState` and `popstate` listeners.
   - Supported routes: `#/leaderboard`, `#/profile?player=...`, `#/tournaments`, `#/tournaments?id=...`, `#/h2h?p1=...&p2=...`, `#/thrillers`.
   - Browser Back/Forward buttons navigate back through tabs and drilled-in views without exiting the website.

7. **Dynamic Header & Subtitle Counts**:
   - Header badge and leaderboard subtitle dynamically read `{roundnetData.total_tournaments}` and `{leaderboard.length}`.

8. **Norse Roundnet Logo**:
   - Viking helmet logo with background cleanly removed, saved as transparent PNG in `web/public/norse_roundnet.png` and configured as header logo and favicon.

9. **1-Click Sync & Build**:
   - `sync_roundnet.bat` runs `sync_roundnet.py` and then triggers `npm run build` in `web/`.
   - `run_web.bat` launches Vite development server (`npm run dev`) on `http://localhost:3000`.

---

## 4. How to Resume Work on the Laptop

1. Clone or pull this repository on your laptop:
   ```bash
   git clone <repo-url>
   cd roundnet-stats
   ```
2. Install frontend dependencies:
   ```bash
   cd web
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. When starting a chat with Antigravity on your laptop, prompt the agent:
   > *"I am continuing work on the Norse Roundnet Stats project. Please read `PROJECT_CONTEXT.md` for full context and architecture before making changes."*
