import urllib.request
import json
import os
from datetime import datetime

DATA_FILE = "players_data.json"

def fetch_list(player_type, year):
    # Fetching up to 500 players to cover all active players in KBO
    sort_field = "hitterWar" if player_type == "HITTER" else "pitcherWar"
    url = f"https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/{year}/players?playerType={player_type}&gameType=REGULAR_SEASON&sortField={sort_field}&sortDirection=desc&pageSize=500"
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    print(f"Fetching {year} {player_type} list...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('result', {}).get('seasonPlayerStats', [])
    except Exception as e:
        print(f"Error fetching {year} {player_type}: {e}")
        return []

def sync_data(force=False, full=False):
    """Sync KBO player data from the Naver API.

    Default (incremental) behaviour only refreshes the current season to keep
    the daily sync cheap. Pass ``full=True`` to re-crawl every season from 2010
    to now and overwrite each stored season with the complete current field set
    — use this to backfill past seasons that were saved by an older crawler with
    fewer stat fields.
    """
    today = datetime.now().strftime("%Y-%m-%d")

    all_players = {}
    current_year = datetime.now().year
    years = list(range(2010, current_year + 1))

    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if not force and not full and existing_data.get("last_updated") == today:
                    print(f"Data is already up to date ({today}). Skipping sync.")
                    return existing_data

                print("Existing data found. Loading players to preserve existing data...")
                all_players = existing_data.get("players", {})
                # Incremental sync only refreshes the current season. A full
                # re-crawl keeps the entire year range so past seasons get the
                # complete, up-to-date field set re-written.
                if not full:
                    years = [current_year]
        except:
            pass

    print(f"Starting data sync for {today} (Years: {years})...")
    
    for year in reversed(years):
        hitters = fetch_list("HITTER", year)
        pitchers = fetch_list("PITCHER", year)
        
        for p in hitters:
            pid = p['playerId']
            if pid not in all_players:
                profile_raw = p.get('profile', '{}')
                try:
                    profile = json.loads(profile_raw)
                except:
                    profile = {}
                
                all_players[pid] = {
                    'id': pid,
                    'name': p['playerName'],
                    'team': p['teamName'],
                    'position': profile.get('position', 'Unknown'),
                    'playerType': 'hitter',
                    'seasons': {}
                }
            else:
                all_players[pid]['name'] = p['playerName']
                all_players[pid]['team'] = p['teamName']
            
            all_players[pid]['seasons'][str(year)] = {
                'team': p['teamName'],
                'hra': f"{p.get('hitterHra', 0):.3f}" if p.get('hitterHra') is not None else "0.000",
                'g': p.get('hitterGameCount', 0),
                'ab': p.get('hitterAb', 0),
                'hit': p.get('hitterHit', 0),
                '2b': p.get('hitterH2', 0),
                '3b': p.get('hitterH3', 0),
                'hr': p.get('hitterHr', 0),
                'rbi': p.get('hitterRbi', 0),
                'run': p.get('hitterRun', 0),
                'sb': p.get('hitterSb', 0),
                'bb': p.get('hitterBb', 0),
                'kk': p.get('hitterKk', 0),
                'obp': f"{p.get('hitterObp', 0):.3f}" if p.get('hitterObp') is not None else "0.000",
                'slg': f"{p.get('hitterSlg', 0):.3f}" if p.get('hitterSlg') is not None else "0.000",
                'ops': f"{p.get('hitterOps', 0):.3f}" if p.get('hitterOps') is not None else "0.000",
                'isop': f"{p.get('hitterIsop', 0):.3f}" if p.get('hitterIsop') is not None else "0.000",
                'babip': f"{p.get('hitterBabip', 0):.3f}" if p.get('hitterBabip') is not None else "0.000",
                'woba': f"{p.get('hitterWoba', 0):.3f}" if p.get('hitterWoba') is not None else "0.000",
                'wrc_plus': f"{p.get('hitterWrcPlus', 0):.1f}" if p.get('hitterWrcPlus') is not None else "0.0",
                'wpa': f"{p.get('hitterWpa', 0):.3f}" if p.get('hitterWpa') is not None else "0.000",
                'war': f"{p.get('hitterWar', 0):.2f}" if p.get('hitterWar') is not None else "0.00"
            }
            
        for p in pitchers:
            pid = p['playerId']
            if pid not in all_players:
                profile_raw = p.get('profile', '{}')
                try:
                    profile = json.loads(profile_raw)
                except:
                    profile = {}

                all_players[pid] = {
                    'id': pid,
                    'name': p['playerName'],
                    'team': p['teamName'],
                    'position': profile.get('position', 'Unknown'),
                    'playerType': 'pitcher',
                    'seasons': {}
                }
            else:
                all_players[pid]['name'] = p['playerName']
                all_players[pid]['team'] = p['teamName']
            
            all_players[pid]['seasons'][str(year)] = {
                'team': p['teamName'],
                'era': f"{p.get('pitcherEra', 0):.2f}" if p.get('pitcherEra') is not None else "0.00",
                'g': p.get('pitcherGameCount', 0),
                'inn': p.get('pitcherInning', '0'),
                'w': p.get('pitcherWin', 0),
                'l': p.get('pitcherLose', 0),
                'sv': p.get('pitcherSave', 0),
                'hld': p.get('pitcherHold', 0),
                'kk': p.get('pitcherKk', 0),
                'hit': p.get('pitcherHit', 0),
                'hr': p.get('pitcherHr', 0),
                'r': p.get('pitcherR', 0),
                'bb': p.get('pitcherBb', 0),
                'hbp': p.get('pitcherHp', 0),
                'wpct': f"{p.get('pitcherWra', 0):.3f}" if p.get('pitcherWra') is not None else "0.000",
                'whip': f"{p.get('pitcherWhip', 0):.2f}" if p.get('pitcherWhip') is not None else "0.00",
                'k_per_9': f"{p.get('pitcherInningKk', 0):.2f}" if p.get('pitcherInningKk') is not None else "0.00",
                'bb_per_9': f"{p.get('pitcherInningBb', 0):.2f}" if p.get('pitcherInningBb') is not None else "0.00",
                'k_percent': f"{p.get('pitcherPaKkRate', 0):.1f}" if p.get('pitcherPaKkRate') is not None else "0.0",
                'bb_percent': f"{p.get('pitcherPaBbRate', 0):.1f}" if p.get('pitcherPaBbRate') is not None else "0.0",
                'wpa': f"{p.get('pitcherWpa', 0):.3f}" if p.get('pitcherWpa') is not None else "0.000",
                'war': f"{p.get('pitcherWar', 0):.2f}" if p.get('pitcherWar') is not None else "0.00"
            }

    final_data = {
        "last_updated": today,
        "players": all_players
    }
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
    
    print(f"Sync complete. {len(all_players)} players saved across {len(years)} seasons.")
    return final_data

if __name__ == "__main__":
    sync_data()
