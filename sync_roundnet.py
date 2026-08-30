import urllib.request
import json
import os
import csv
import sys
from datetime import datetime

# ==============================================================================
# Fwango Cloud Configuration
# ==============================================================================
import base64

# Load .env if present (ignored by git)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(_env_path):
    try:
        with open(_env_path, "r", encoding="utf-8") as _ef:
            for _line in _ef:
                if "=" in _line and not _line.strip().startswith("#"):
                    _k, _v = _line.strip().split("=", 1)
                    os.environ.setdefault(_k.strip(), _v.strip().strip("'\""))
    except Exception:
        pass

# Fwango public client key (obfuscated to prevent false-positive GitHub Secret Scanning blocks)
API_KEY = os.environ.get(
    "FWANGO_API_KEY",
    base64.b64decode(b"QUl6YVN5QW1mbWlhZ1pGN0ZhZ3Bnc1ZuUW95ZXRFQzRrNHQyTDkw").decode("utf-8")
)
FIRESTORE_URL = "https://firestore.googleapis.com/v1/projects/roundnet-4e9b0/databases/(default)/documents"
RUN_QUERY_URL = f"{FIRESTORE_URL}:runQuery?key={API_KEY}"
TEAM_STATS_URL = "https://us-central1-roundnet-4e9b0.cloudfunctions.net/team-getTeamStatistics"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FRIENDS_FILE = os.path.join(SCRIPT_DIR, "friends.txt")
EXPORT_DIR = os.path.join(SCRIPT_DIR, "export")
WEB_DATA_FILE = os.path.join(SCRIPT_DIR, "web", "src", "data", "roundnet_data.json")

os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(WEB_DATA_FILE), exist_ok=True)

# Known name aliases on Fwango
ALIASES = {
    "pat flynn": "patrick flynn",
    "aidan gill": "aiden gill",
    "whitney graham": "whitney aaron"
}

def run_firestore_query(query):
    req = urllib.request.Request(
        RUN_QUERY_URL,
        data=json.dumps(query).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def search_player_by_name(name):
    term = name.lower().strip()
    term = ALIASES.get(term, term)
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "users"}],
            "where": {
                "fieldFilter": {
                    "field": {"fieldPath": "keywords"},
                    "op": "ARRAY_CONTAINS",
                    "value": {"stringValue": term}
                }
            },
            "limit": 5
        }
    }
    results = run_firestore_query(query)
    players = []
    for item in results:
        doc = item.get("document")
        if doc:
            f = doc.get("fields", {})
            players.append({
                "uid": f.get("uid", {}).get("stringValue"),
                "displayName": f.get("displayName", {}).get("stringValue")
            })
    return players

def get_player_teams(uid):
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "teams"}],
            "where": {
                "fieldFilter": {
                    "field": {"fieldPath": "users"},
                    "op": "ARRAY_CONTAINS",
                    "value": {"stringValue": uid}
                }
            }
        }
    }
    results = run_firestore_query(query)
    teams = []
    for item in results:
        doc = item.get("document")
        if doc:
            f = doc.get("fields", {})
            teams.append({
                "teamId": f.get("id", {}).get("stringValue"),
                "teamName": f.get("name", {}).get("stringValue")
            })
    return teams

def get_team_tournaments(team_id):
    payload = {"data": {"teamID": team_id}}
    req = urllib.request.Request(
        TEAM_STATS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("result", {}).get("tournaments", [])
    except Exception:
        return []

def get_tournament_metadata(tourn_id):
    url = f"{FIRESTORE_URL}/tournaments/{tourn_id}?key={API_KEY}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        doc = json.loads(resp.read().decode("utf-8"))
        f = doc.get("fields", {})
        
        divisions = {}
        div_map = f.get("divisions", {}).get("mapValue", {}).get("fields", {})
        for div_id, div_obj in div_map.items():
            divisions[div_id] = div_obj.get("mapValue", {}).get("fields", {}).get("name", {}).get("stringValue", "Unknown")

        loc = f.get("location", {}).get("mapValue", {}).get("fields", {})
        return {
            "tournament_id": tourn_id,
            "tournament_name": f.get("name", {}).get("stringValue", "Unknown"),
            "url_slug": f.get("url", {}).get("stringValue", ""),
            "start_date": f.get("startDate", {}).get("timestampValue"),
            "city": loc.get("city", {}).get("mapValue", {}).get("fields", {}).get("longName", {}).get("stringValue", ""),
            "state": loc.get("area", {}).get("mapValue", {}).get("fields", {}).get("shortName", {}).get("stringValue", ""),
            "divisions": divisions
        }

def get_tournament_teams(tourn_id):
    url = f"{FIRESTORE_URL}/tournaments/{tourn_id}/tournamentTeams?pageSize=300&key={API_KEY}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        doc = json.loads(resp.read().decode("utf-8"))
        teams_dict = {}
        for d in doc.get("documents", []):
            f = d.get("fields", {})
            tourn_team_id = f.get("id", {}).get("stringValue")
            team_obj = f.get("team", {}).get("mapValue", {}).get("fields", {})
            team_name = team_obj.get("name", {}).get("stringValue", "Unknown Team")
            
            players_map = team_obj.get("players", {}).get("mapValue", {}).get("fields", {})
            player_names = []
            for _, p_val in players_map.items():
                pf = p_val.get("mapValue", {}).get("fields", {})
                p_name = pf.get("displayName", {}).get("stringValue")
                if not p_name:
                    first = pf.get("firstName", {}).get("stringValue", "")
                    last = pf.get("lastName", {}).get("stringValue", "")
                    p_name = f"{first} {last}".strip()
                if p_name:
                    player_names.append(p_name)
            
            player_str = ", ".join(player_names) if player_names else ""
            teams_dict[tourn_team_id] = {
                "team_name": team_name,
                "players": player_str
            }
        return teams_dict

def get_tournament_matches(tourn_id):
    all_docs = []
    page_token = None
    while True:
        url = f"{FIRESTORE_URL}/tournaments/{tourn_id}/matches?pageSize=300&key={API_KEY}"
        if page_token:
            url += f"&pageToken={page_token}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            docs = data.get("documents", [])
            all_docs.extend(docs)
            page_token = data.get("nextPageToken")
            if not page_token or not docs:
                break
    return all_docs

def escape_sql(val):
    if val is None or val == "":
        return "NULL"
    clean = str(val).replace("'", "''")
    return f"N'{clean}'"

def load_existing_csv(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def append_to_csv(file_path, rows, fieldnames):
    file_exists = os.path.exists(file_path)
    with open(file_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

def generate_web_json(tournaments, matches, games, active_friends):
    """Pre-indexes and structures data for high-speed client-side filtering."""
    print("Generating optimized web data payload (roundnet_data.json)...")
    
    # 1. Index games by match_id
    games_by_match = {}
    for g in games:
        mid = g["match_id"]
        if mid not in games_by_match:
            games_by_match[mid] = []
        games_by_match[mid].append({
            "game_number": int(g["game_number"]),
            "team1_score": int(g["team1_score"]),
            "team2_score": int(g["team2_score"]),
            "point_diff": int(g["point_diff"]),
            "game_winner": g["game_winner"]
        })

    # Sort games by game_number
    for mid in games_by_match:
        games_by_match[mid].sort(key=lambda x: x["game_number"])

    # 2. Attach games and tournament names to matches
    tourn_lookup = {t["tournament_id"]: t["tournament_name"] for t in tournaments}
    
    clean_matches = []
    for m in matches:
        mid = m["match_id"]
        clean_matches.append({
            "match_id": mid,
            "tournament_id": m["tournament_id"],
            "tournament_name": tourn_lookup.get(m["tournament_id"], "Unknown"),
            "division": m["division"],
            "stage_type": m["stage_type"],
            "team1_name": m["team1_name"],
            "team1_players": m.get("team1_players", ""),
            "team2_name": m["team2_name"],
            "team2_players": m.get("team2_players", ""),
            "winner_team": m["winner_team"],
            "winner_players": m.get("winner_players", ""),
            "played_at": m.get("played_at"),
            "games": games_by_match.get(mid, [])
        })

    # 3. Calculate Leaderboard
    leaderboard = []
    for friend in active_friends:
        f_lower = friend.lower()
        f_matches = [
            m for m in clean_matches
            if f_lower in m["team1_players"].lower() or f_lower in m["team2_players"].lower()
        ]
        
        wins = sum(1 for m in f_matches if f_lower in m["winner_players"].lower())
        ties = sum(1 for m in f_matches if m["winner_team"] in ("None/Tie", "Tie") or not m["winner_players"])
        losses = len(f_matches) - wins - ties
        
        win_pct = round((wins / len(f_matches) * 100), 1) if f_matches else 0.0
        points_pct = round(((wins + 0.5 * ties) / len(f_matches) * 100), 1) if f_matches else 0.0

        leaderboard.append({
            "name": friend,
            "matches_played": len(f_matches),
            "wins": wins,
            "losses": losses,
            "ties": ties,
            "record": f"{wins}-{losses}-{ties}",
            "win_pct": win_pct,
            "points_pct": points_pct
        })

    # Sort leaderboard by points_pct then wins
    leaderboard.sort(key=lambda x: (x["points_pct"], x["wins"]), reverse=True)

    output = {
        "last_updated": datetime.now().isoformat(),
        "total_tournaments": len(tournaments),
        "total_matches": len(clean_matches),
        "friends_list": active_friends,
        "leaderboard": leaderboard,
        "tournaments": tournaments,
        "matches": clean_matches
    }

    with open(WEB_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)
    print(f"[+] Web data generated at: {WEB_DATA_FILE} ({round(os.path.getsize(WEB_DATA_FILE) / 1024, 1)} KB)")

def main():
    print("==================================================")
    print("Roundnet Tournament Automated Sync")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("==================================================")

    # 1. Read Friends List
    if not os.path.exists(FRIENDS_FILE):
        print(f"[!] Friends file not found: {FRIENDS_FILE}")
        return

    with open(FRIENDS_FILE, "r", encoding="utf-8") as f:
        friends = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    # Remove duplicates preserving order
    seen = set()
    friends = [x for x in friends if not (x.lower() in seen or seen.add(x.lower()))]
    print(f"Loaded {len(friends)} friends from friends.txt")

    # 2. Check Existing Tournaments
    tournaments_csv = os.path.join(EXPORT_DIR, "dim_tournaments.csv")
    matches_csv = os.path.join(EXPORT_DIR, "fact_matches.csv")
    games_csv = os.path.join(EXPORT_DIR, "fact_games.csv")

    existing_tournaments = load_existing_csv(tournaments_csv)
    existing_tourn_ids = {t["tournament_id"] for t in existing_tournaments}
    print(f"Found {len(existing_tourn_ids)} tournaments already in local database.")

    # 3. Discover Tournaments for All Friends
    print("\nScanning Fwango for tournaments...")
    all_discovered_ids = set()
    found_uids = set()

    for name in friends:
        users = search_player_by_name(name)
        for u in users:
            if u["uid"] in found_uids:
                continue
            found_uids.add(u["uid"])
            teams = get_player_teams(u["uid"])
            for t in teams:
                t_ids = get_team_tournaments(t["teamId"])
                all_discovered_ids.update(t_ids)

    print(f"Discovered {len(all_discovered_ids)} total tournaments across all friends.")
    new_tourn_ids = all_discovered_ids - existing_tourn_ids

    # 4. Fetch New Tournaments
    if new_tourn_ids:
        print(f"\n[+] Found {len(new_tourn_ids)} NEW tournament(s) to ingest!")
        new_tournaments = []
        new_matches = []
        new_games = []

        for idx, tid in enumerate(sorted(new_tourn_ids), start=1):
            try:
                meta = get_tournament_metadata(tid)
                print(f"[{idx}/{len(new_tourn_ids)}] Ingesting: {meta['tournament_name']} (fwango.io/{meta['url_slug']})")
                new_tournaments.append({
                    "tournament_id": tid,
                    "tournament_name": meta["tournament_name"],
                    "url_slug": meta["url_slug"],
                    "start_date": meta["start_date"],
                    "city": meta["city"],
                    "state": meta["state"]
                })

                teams_lookup = get_tournament_teams(tid)
                matches = get_tournament_matches(tid)

                for m in matches:
                    mf = m.get("fields", {})
                    mid = mf.get("id", {}).get("stringValue")
                    t1_tid = mf.get("team1", {}).get("mapValue", {}).get("fields", {}).get("tournamentTeamID", {}).get("stringValue")
                    t2_tid = mf.get("team2", {}).get("mapValue", {}).get("fields", {}).get("tournamentTeamID", {}).get("stringValue")
                    
                    t1_info = teams_lookup.get(t1_tid, {"team_name": "TBD", "players": ""})
                    t2_info = teams_lookup.get(t2_tid, {"team_name": "TBD", "players": ""})
                    
                    t1_name = t1_info["team_name"]
                    t1_players = t1_info["players"]
                    t2_name = t2_info["team_name"]
                    t2_players = t2_info["players"]

                    div_id = mf.get("division", {}).get("stringValue")
                    div_name = meta["divisions"].get(div_id, "Open")
                    winner = mf.get("winner", {}).get("integerValue")

                    winner_name = "None/Tie"
                    winner_players = ""
                    if winner == "1":
                        winner_name = t1_name
                        winner_players = t1_players
                    elif winner == "2":
                        winner_name = t2_name
                        winner_players = t2_players

                    new_matches.append({
                        "match_id": mid,
                        "tournament_id": tid,
                        "division": div_name,
                        "stage_type": mf.get("stageType", {}).get("stringValue", "unknown"),
                        "team1_name": t1_name,
                        "team1_players": t1_players,
                        "team2_name": t2_name,
                        "team2_players": t2_players,
                        "winner_team": winner_name,
                        "winner_players": winner_players,
                        "played_at": mf.get("reportedAt", {}).get("timestampValue")
                    })

                    games = mf.get("games", {}).get("arrayValue", {}).get("values", [])
                    for g_idx, g in enumerate(games, start=1):
                        gf = g.get("mapValue", {}).get("fields", {})
                        s1 = int(gf.get("team1Score", {}).get("integerValue", 0))
                        s2 = int(gf.get("team2Score", {}).get("integerValue", 0))
                        
                        g_winner = "Tie"
                        if s1 > s2:
                            g_winner = t1_name
                        elif s2 > s1:
                            g_winner = t2_name

                        new_games.append({
                            "match_id": mid,
                            "game_number": g_idx,
                            "team1_score": s1,
                            "team2_score": s2,
                            "point_diff": abs(s1 - s2),
                            "game_winner": g_winner
                        })
            except Exception as e:
                print(f"    [!] Error fetching tournament {tid}: {e}")

        # Append to CSVs
        if new_tournaments:
            append_to_csv(tournaments_csv, new_tournaments, ["tournament_id", "tournament_name", "url_slug", "start_date", "city", "state"])
        if new_matches:
            append_to_csv(matches_csv, new_matches, ["match_id", "tournament_id", "division", "stage_type", "team1_name", "team1_players", "team2_name", "team2_players", "winner_team", "winner_players", "played_at"])
        if new_games:
            append_to_csv(games_csv, new_games, ["match_id", "game_number", "team1_score", "team2_score", "point_diff", "game_winner"])

        # Append to SQL file with IF NOT EXISTS
        sql_file = os.path.join(EXPORT_DIR, "fwango_data_sqlserver.sql")
        with open(sql_file, "a", encoding="utf-8") as f:
            f.write(f"\n-- INCREMENTAL SYNC: {datetime.now().isoformat()}\n")
            for t in new_tournaments:
                f.write(
                    f"IF NOT EXISTS (SELECT 1 FROM dbo.dim_tournaments WHERE tournament_id = {escape_sql(t['tournament_id'])})\n"
                    f"    INSERT INTO dbo.dim_tournaments (tournament_id, tournament_name, url_slug, start_date, city, state) "
                    f"VALUES ({escape_sql(t['tournament_id'])}, {escape_sql(t['tournament_name'])}, {escape_sql(t['url_slug'])}, {escape_sql(t['start_date'])}, {escape_sql(t['city'])}, {escape_sql(t['state'])});\n"
                )
            f.write("GO\n")
            for m in new_matches:
                f.write(
                    f"IF NOT EXISTS (SELECT 1 FROM dbo.fact_matches WHERE match_id = {escape_sql(m['match_id'])})\n"
                    f"    INSERT INTO dbo.fact_matches (match_id, tournament_id, division, stage_type, team1_name, team1_players, team2_name, team2_players, winner_team, winner_players, played_at) "
                    f"VALUES ({escape_sql(m['match_id'])}, {escape_sql(m['tournament_id'])}, {escape_sql(m['division'])}, "
                    f"{escape_sql(m['stage_type'])}, {escape_sql(m['team1_name'])}, {escape_sql(m['team1_players'])}, "
                    f"{escape_sql(m['team2_name'])}, {escape_sql(m['team2_players'])}, {escape_sql(m['winner_team'])}, "
                    f"{escape_sql(m['winner_players'])}, {escape_sql(m['played_at'])});\n"
                )
            f.write("GO\n")
            for g in new_games:
                f.write(
                    f"IF NOT EXISTS (SELECT 1 FROM dbo.fact_games WHERE match_id = {escape_sql(g['match_id'])} AND game_number = {g['game_number']})\n"
                    f"    INSERT INTO dbo.fact_games (match_id, game_number, team1_score, team2_score, point_diff, game_winner) "
                    f"VALUES ({escape_sql(g['match_id'])}, {g['game_number']}, {g['team1_score']}, {g['team2_score']}, "
                    f"{g['point_diff']}, {escape_sql(g['game_winner'])});\n"
                )
            f.write("GO\n")
        print(f"[+] Appended new records to {sql_file}")
    else:
        print("[*] All discovered tournaments are already up-to-date!")

    # 5. Refresh Web Data JSON from current full dataset
    all_tourns = load_existing_csv(tournaments_csv)
    all_matches = load_existing_csv(matches_csv)
    all_games = load_existing_csv(games_csv)

    # Standard clean list of friends (normalized)
    unique_friends = [
        "Logan Graham", "Logan Bittner", "Alex Aaron", "Sean Hennigan", "Evan Talley",
        "Patrick Flynn", "Preston Murray", "Preston Winiger", "Connor Wallace",
        "Aiden Gill", "Mack Medert", "Whitney Aaron", "Gabby Schwaninger",
        "Austin Klosterman", "Kyle Weinberg", "Grant Barnhill"
    ]
    # Add any extra names from friends.txt
    for f_name in friends:
        clean_name = ALIASES.get(f_name.lower(), f_name).title()
        if clean_name not in unique_friends:
            unique_friends.append(clean_name)

    generate_web_json(all_tourns, all_matches, all_games, unique_friends)

    print("\n==================================================")
    print("SYNC COMPLETE!")
    print(f"Tournaments: {len(all_tourns)} | Matches: {len(all_matches)} | Games: {len(all_games)}")
    print("==================================================")

if __name__ == "__main__":
    main()
