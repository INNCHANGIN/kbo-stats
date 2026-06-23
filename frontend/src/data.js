// Static data layer — replaces the Flask backend.
//
// The entire player dataset (players_data.json) is a small (~565KB gzipped)
// static file that updates daily. We load it once in the browser and run all
// filtering / search / lookups client-side, so the app can be hosted as a pure
// static site (GitHub Pages) with no server.

// Resolve the JSON relative to the deployed base path (works under a GitHub
// Pages project subpath, e.g. /kbo-stats/).
const DATA_URL = `${import.meta.env.BASE_URL}players_data.json`;

let _cache = null;
let _pending = null;

// Load and memoize the dataset. Concurrent callers share one fetch.
export async function loadData() {
  if (_cache) return _cache;
  if (!_pending) {
    _pending = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        _cache = json.players || {};
        return _cache;
      })
      .finally(() => { _pending = null; });
  }
  return _pending;
}

// Best-effort player type detection across all seasons (mirrors backend).
function detectType(player) {
  if (player.position === '투수') return 'pitcher';
  for (const s of Object.values(player.seasons || {})) {
    if ('era' in s) return 'pitcher';
  }
  return 'hitter';
}

// Mirrors GET /api/players: summary list for one season, sorted by WAR desc.
export async function getPlayers({ year, team, playerType = 'hitter', position = '' }) {
  const players = await loadData();
  const list = [];

  for (const p of Object.values(players)) {
    const s = p.seasons?.[year];
    if (!s) continue;

    // A pitcher's season stats carry 'era'; otherwise treat as hitter.
    const actualType = ('era' in s || p.position === '투수') ? 'pitcher' : 'hitter';

    if (playerType !== 'all' && actualType !== playerType) continue;
    if (team && s.team !== team) continue;
    if (position && p.position !== position) continue;

    list.push({
      id: p.id,
      name: p.name,
      team: s.team,
      position: p.position,
      playerType: actualType,
      stats: s,
    });
  }

  list.sort((a, b) => {
    const aw = parseFloat(a.stats.war) || 0;
    const bw = parseFloat(b.stats.war) || 0;
    return bw - aw;
  });

  return list;
}

// Mirrors GET /api/player/<id>: full player record with all seasons.
export async function getPlayer(id) {
  const players = await loadData();
  return players[String(id)] || null;
}

// Mirrors GET /api/search: name search across all seasons, returns each
// player's available years + full per-season stats for instant compare.
export async function searchPlayers(query, playerType = '') {
  const players = await loadData();
  const q = (query || '').trim();
  const results = [];

  for (const p of Object.values(players)) {
    const name = p.name || '';
    if (q && !name.includes(q)) continue;

    const actualType = detectType(p);
    if (playerType && actualType !== playerType) continue;

    const years = Object.keys(p.seasons || {}).sort((a, b) => parseInt(b) - parseInt(a));
    if (!years.length) continue;

    results.push({
      id: p.id,
      name,
      position: p.position,
      playerType: actualType,
      years,
      seasons: p.seasons,
    });
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  return results.slice(0, 100);
}
