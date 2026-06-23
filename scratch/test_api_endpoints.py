import urllib.request
import json
import ssl

def check_url(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    context = ssl._create_unverified_context()
    print(f"Checking URL: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            print("Success! Keys in response:", list(data.keys()))
            if 'result' in data:
                 print("Keys in result:", list(data['result'].keys()) if isinstance(data['result'], dict) else "List result")
                 if isinstance(data['result'], list):
                     print("Result is a list of length:", len(data['result']))
                     if len(data['result']) > 0:
                         print("First item:", data['result'][0])
                 elif isinstance(data['result'], dict):
                      for k, v in data['result'].items():
                          if isinstance(v, list):
                              print(f"Key '{k}' is list of length {len(v)}")
            return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

if __name__ == "__main__":
    player_id = "79215"
    test_urls = [
        f"https://api-gw.sports.naver.com/statistics/categories/kbo/players/{player_id}/records?gameType=REGULAR_SEASON",
        f"https://api-gw.sports.naver.com/statistics/categories/kbo/players/{player_id}/career",
        f"https://api-gw.sports.naver.com/kbaseball/player/{player_id}/record",
    ]
    for url in test_urls:
        check_url(url)
        print("-" * 30)
