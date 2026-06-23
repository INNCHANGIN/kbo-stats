import urllib.request
import re
import json

def get_player_data(player_id):
    url = f"https://m.sports.naver.com/player/index?from=sports&category=kbo&playerId={player_id}&tab=record"
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Referer': 'https://m.sports.naver.com/'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # Look for JSON data in script tags
            # Naver often uses window.__INITIAL_STATE__ or similar
            # Based on previous soup search, it seems it might be using Handlebars or just raw JSON in a script
            
            # Let's search for a pattern that looks like player record data
            # Typically "playerRecord" or similar
            match = re.search(r'playerRecord[:\s]+({.*?})', html, re.DOTALL)
            if not match:
                # Try searching for JSON-like block
                match = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?});', html, re.DOTALL)
            
            if match:
                return match.group(1)[:1000] # Return a snippet for now
            else:
                return "Data not found in HTML"
                
    except Exception as e:
        return f"Error: {e}"

print("Player 54730:")
print(get_player_data(54730))
print("\nPlayer 79109:")
print(get_player_data(79109))
