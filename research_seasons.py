import urllib.request
import json

def test_api(year, player_type):
    url = f"https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/{year}/players?playerType={player_type}&gameType=REGULAR_SEASON&sortField={'hitterWar' if player_type == 'HITTER' else 'pitcherWar'}&sortDirection=desc&pageSize=5"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('success'):
                stats = data['result'].get('seasonPlayerStats', [])
                print(f"Year {year} ({player_type}): Found {len(stats)} players")
                if stats:
                    print(f"Top 1: {stats[0]['playerName']} (WAR: {stats[0].get('hitterWar', stats[0].get('pitcherWar'))})")
                return True
            else:
                print(f"Year {year} ({player_type}): API returned success=False")
                return False
    except Exception as e:
        print(f"Year {year} ({player_type}): Error - {e}")
        return False

print("Testing seasons...")
for y in [2024, 2025, 2026]:
    test_api(y, "HITTER")
    test_api(y, "PITCHER")
