import urllib.request
import json
import ssl

def check_player_history(player_id):
    url = f"https://m.sports.naver.com/ajax/player/record?playerId={player_id}&category=kbo"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://m.sports.naver.com/',
    }
    
    context = ssl._create_unverified_context()
    
    print(f"Fetching history for player {player_id}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_player_history(79215)
