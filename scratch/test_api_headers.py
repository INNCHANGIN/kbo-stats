import urllib.request
import json
import ssl

def check_url(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Referer': 'https://m.sports.naver.com/',
        'Origin': 'https://m.sports.naver.com',
        'Accept': 'application/json, text/plain, */*'
    }
    context = ssl._create_unverified_context()
    print(f"Checking URL: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            print("Success!")
            # Save a sample to inspect
            with open(f"sample_{url.split('/')[-2 if '?' in url else -1].split('?')[0]}.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

if __name__ == "__main__":
    player_id = "79215"
    test_urls = [
        f"https://api-gw.sports.naver.com/statistics/categories/kbo/players/{player_id}/records?gameType=REGULAR_SEASON",
        f"https://api-gw.sports.naver.com/kbaseball/player/{player_id}/record",
    ]
    for url in test_urls:
        check_url(url)
        print("-" * 30)
