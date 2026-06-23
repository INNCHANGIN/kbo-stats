import urllib.request
import json

def fetch_keys(player_type):
    sort_field = "hitterWar" if player_type == "HITTER" else "pitcherWar"
    url = f"https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/2026/players?playerType={player_type}&gameType=REGULAR_SEASON&sortField={sort_field}&sortDirection=desc&pageSize=1"
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        player = data.get('result', {}).get('seasonPlayerStats', [])[0]
        print(f"--- {player_type} Keys ---")
        for k, v in player.items():
            print(f"{k}: {v}")

fetch_keys("HITTER")
fetch_keys("PITCHER")
