import urllib.request
import json
import ssl

def fetch_api(player_id):
    # Try different variations of the API URL
    urls = [
        f"https://api-gw.sports.naver.com/kbo/player/{player_id}/record",
        f"https://m.sports.naver.com/ajax/player/record?playerId={player_id}&category=kbo"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Referer': f'https://m.sports.naver.com/player/index?from=sports&category=kbo&playerId={player_id}&tab=record',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://m.sports.naver.com'
    }
    
    # Bypass SSL verification if needed for testing (sometimes helps in restricted environments)
    context = ssl._create_unverified_context()
    
    results = {}
    for url in urls:
        print(f"Testing URL: {url}")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                status = response.getcode()
                data = response.read().decode('utf-8')
                print(f"Status: {status}, Length: {len(data)}")
                results[url] = data[:500]
        except Exception as e:
            print(f"Error for {url}: {e}")
            results[url] = str(e)
            
    return results

if __name__ == "__main__":
    res = fetch_api(54730)
    for url, output in res.items():
        print(f"\n--- {url} ---")
        print(output)
