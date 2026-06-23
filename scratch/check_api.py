import urllib.request
import json

def check_structure():
    year = 2026
    player_type = "HITTER"
    url = f"https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/{year}/players?playerType={player_type}&gameType=REGULAR_SEASON&sortField=hitterWar&sortDirection=desc&pageSize=1"
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(json.dumps(data['result']['seasonPlayerStats'][0], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    check_structure()
