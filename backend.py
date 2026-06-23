from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from sync_data import sync_data

app = Flask(__name__)
CORS(app)

DATA_FILE = "players_data.json"
PLAYER_CACHE = {}

def load_cache():
    global PLAYER_CACHE
    # This will trigger the daily sync if needed
    data = sync_data()
    PLAYER_CACHE = data.get("players", {})

# Initial load
load_cache()

@app.route('/api/players')
def get_all_players():
    load_cache()
    
    # Query parameters
    target_year = request.args.get('year', '2026')
    team = request.args.get('team', '')
    p_type = request.args.get('playerType', 'hitter') # Default to hitter as requested
    position = request.args.get('position', '')
    
    filtered_list = []
    
    for pid, p in PLAYER_CACHE.items():
        # Check if player has stats for the target year
        if target_year in p.get('seasons', {}):
            s_stats = p['seasons'][target_year]
            
            # Determine actual type (fix bug where pitchers are labeled as hitters)
            # If the stats dict has 'era', it means pitcher stats were saved last.
            # We can also rely on position.
            actual_type = 'pitcher' if ('era' in s_stats or p.get('position') == '투수') else 'hitter'
            
            # Filter by type (default is 'hitter')
            if p_type != 'all' and actual_type != p_type:
                continue
                
            # Filter by team
            if team and s_stats.get('team') != team:
                continue
            
            # Filter by position
            if position and p.get('position') != position:
                continue
            
            # Prepare summary for the list view
            entry = {
                'id': p['id'],
                'name': p['name'],
                'team': s_stats.get('team'),
                'position': p.get('position'),
                'playerType': actual_type,
                'stats': s_stats # Stats for the specific year
            }
            filtered_list.append(entry)
    
    # Sort by WAR descending
    def get_war(x):
        try:
            return float(x['stats'].get('war', 0))
        except:
            return 0.0
            
    filtered_list.sort(key=get_war, reverse=True)
    
    return jsonify(filtered_list)

@app.route('/api/player/<int:player_id>')
def get_player_stats(player_id):
    load_cache()
    pid_str = str(player_id)
    if pid_str in PLAYER_CACHE:
        return jsonify(PLAYER_CACHE[pid_str])
    else:
        return jsonify({'error': 'Player not found'}), 404


def _detect_type(player):
    """Best-effort player type detection across all seasons."""
    if player.get('position') == '투수':
        return 'pitcher'
    for s in player.get('seasons', {}).values():
        if 'era' in s:
            return 'pitcher'
    return 'hitter'


@app.route('/api/search')
def search_players():
    """Search players by name across all seasons.

    Returns lightweight entries including the list of available seasons so the
    frontend can let the user pick a specific year per player when comparing.
    """
    load_cache()
    query = request.args.get('q', '').strip()
    p_type = request.args.get('playerType', '')  # optional: 'hitter' | 'pitcher'

    results = []
    for pid, p in PLAYER_CACHE.items():
        name = p.get('name', '')
        if query and query not in name:
            continue

        actual_type = _detect_type(p)
        if p_type and actual_type != p_type:
            continue

        seasons = p.get('seasons', {})
        # Sort years descending (numeric)
        years = sorted(seasons.keys(), key=lambda y: int(y), reverse=True)
        if not years:
            continue

        results.append({
            'id': p['id'],
            'name': name,
            'position': p.get('position'),
            'playerType': actual_type,
            'years': years,
            'seasons': seasons,  # full per-year stats for instant compare
        })

    # Limit to keep the payload reasonable when query is empty/short
    results.sort(key=lambda x: x['name'])
    return jsonify(results[:100])

if __name__ == '__main__':
    app.run(port=5000)
