import urllib.request
import json
import ssl

def check_url(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://m.sports.naver.com/',
        'Accept': 'application/json, text/plain, */*'
    }
    context = ssl._create_unverified_context()
    print(f"Checking URL: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            print("Success!")
            # print(json.dumps(data, indent=2, ensure_ascii=False))
            career_stats = data.get('result', {}).get('playerSeasonStats', [])
            print(f"Number of seasons found: {len(career_stats)}")
            if career_stats:
                print("Sample year:", career_stats[0].get('year'))
            return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

if __name__ == "__main__":
    player_id = "79215" # 박건우
    test_urls = [
        f"https://api-gw.sports.naver.com/statistics/categories/kbo/players/{player_id}/seasonStats?gameType=REGULAR_SEASON",
    ]
    for url in test_urls:
        check_url(url)
