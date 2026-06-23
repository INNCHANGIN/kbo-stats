import urllib.request
import json
import ssl

def check_player_history(player_id):
    url = f"https://m.sports.naver.com/ajax/player/record?playerId={player_id}&category=kbo"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
    
    context = ssl._create_unverified_context()
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode('utf-8'))
            career = data.get('result', {}).get('careerStats', [])
            print(f"Career Stats for {player_id}:")
            for season in career:
                # Summarize season data
                year = season.get('gyear')
                team = season.get('teamName')
                war = season.get('war')
                print(f"Year: {year}, Team: {team}, WAR: {war}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_player_history(79215)
