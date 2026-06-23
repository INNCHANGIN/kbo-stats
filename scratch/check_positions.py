import json

def check_data():
    with open('players_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    players = data.get('players', {})
    unknown_pos = [p['name'] for p in players.values() if p.get('position') == 'Unknown']
    
    print(f"Total players: {len(players)}")
    print(f"Players with Unknown position: {len(unknown_pos)}")
    if unknown_pos:
        print(f"Sample: {unknown_pos[:10]}")

if __name__ == "__main__":
    check_data()
