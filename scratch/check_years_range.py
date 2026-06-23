import urllib.request
import json
import ssl

def check_year(year):
    url = f"https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/{year}/players?playerType=HITTER&gameType=REGULAR_SEASON&sortField=hitterWar&sortDirection=desc&pageSize=1"
    headers = {'User-Agent': 'Mozilla/5.0'}
    context = ssl._create_unverified_context()
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('success'):
                players = data.get('result', {}).get('seasonPlayerStats', [])
                if players:
                    print(f"Year {year} works! Sample: {players[0]['playerName']}")
                    return True
            print(f"Year {year} exists but no players found.")
            return False
    except Exception as e:
        print(f"Year {year} failed: {e}")
        return False

if __name__ == "__main__":
    for y in [1982, 1990, 2000, 2010, 2020, 2026]:
        check_year(y)
