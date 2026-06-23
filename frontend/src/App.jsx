import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { getPlayers, getPlayer, searchPlayers } from './data';

const TEAMS = ["전체", "LG", "KT", "SSG", "NC", "두산", "KIA", "롯데", "삼성", "한화", "키움"];
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010"];
const PAGE_SIZE = 30;

// Column metadata: key (stat field), label (header), tip (Korean tooltip),
// hl ('max' | 'min') marks the column for career-best highlighting in the detail view.
const HITTER_COLS = [
  { key: 'hra', label: '타율', tip: '타율 (Batting Average)', hl: 'max' },
  { key: 'g', label: 'G', tip: '경기수 (Games)' },
  { key: 'ab', label: 'AB', tip: '타수 (At Bats)' },
  { key: 'hit', label: 'H', tip: '안타 (Hits)' },
  { key: '2b', label: '2B', tip: '2루타 (Doubles)' },
  { key: '3b', label: '3B', tip: '3루타 (Triples)' },
  { key: 'hr', label: 'HR', tip: '홈런 (Home Runs)', hl: 'max' },
  { key: 'rbi', label: 'RBI', tip: '타점 (Runs Batted In)', hl: 'max' },
  { key: 'run', label: 'R', tip: '득점 (Runs)' },
  { key: 'sb', label: 'SB', tip: '도루 (Stolen Bases)' },
  { key: 'bb', label: 'BB', tip: '볼넷 (Base on Balls)' },
  { key: 'kk', label: 'SO', tip: '삼진 (Strikeouts)' },
  { key: 'obp', label: 'OBP', tip: '출루율 (On-Base Percentage)' },
  { key: 'slg', label: 'SLG', tip: '장타율 (Slugging Percentage)' },
  { key: 'ops', label: 'OPS', tip: '출루율 + 장타율 (On-base Plus Slugging)', hl: 'max' },
  { key: 'isop', label: 'IsoP', tip: '순수장타율 (Isolated Power)' },
  { key: 'babip', label: 'BABIP', tip: '인플레이 타구 타율 (BABIP)' },
  { key: 'woba', label: 'wOBA', tip: '가중 출루율 (weighted On-Base Average)' },
  { key: 'wrc_plus', label: 'wRC+', tip: '조정 득점 생산력 (weighted Runs Created +)' },
  { key: 'wpa', label: 'WPA', tip: '승리 확률 기여도 (Win Probability Added)' },
  { key: 'war', label: 'WAR', tip: '대체 선수 대비 승리 기여도 (Wins Above Replacement)', hl: 'max' },
];

const PITCHER_COLS = [
  { key: 'era', label: 'ERA', tip: '평균자책점 (Earned Run Average)', hl: 'min' },
  { key: 'g', label: 'G', tip: '경기수 (Games)' },
  { key: 'inn', label: 'IP', tip: '이닝 (Innings Pitched)' },
  { key: 'w', label: 'W', tip: '승 (Wins)', hl: 'max' },
  { key: 'l', label: 'L', tip: '패 (Losses)' },
  { key: 'sv', label: 'SV', tip: '세이브 (Saves)', hl: 'max' },
  { key: 'hld', label: 'HLD', tip: '홀드 (Holds)' },
  { key: 'kk', label: 'SO', tip: '탈삼진 (Strikeouts)', hl: 'max' },
  { key: 'hit', label: 'H', tip: '피안타 (Hits Allowed)' },
  { key: 'hr', label: 'HR', tip: '피홈런 (Home Runs Allowed)' },
  { key: 'r', label: 'ER', tip: '자책점 (Earned Runs)' },
  { key: 'bb', label: 'BB', tip: '볼넷 (Walks)' },
  { key: 'hbp', label: 'HBP', tip: '몸에 맞는 공 (Hit By Pitch)' },
  { key: 'wpct', label: 'WPCT', tip: '승률 (Winning Percentage)' },
  { key: 'whip', label: 'WHIP', tip: '이닝당 출루 허용 (Walks + Hits per IP)', hl: 'min' },
  { key: 'k_per_9', label: 'K/9', tip: '9이닝당 탈삼진' },
  { key: 'bb_per_9', label: 'BB/9', tip: '9이닝당 볼넷' },
  { key: 'k_percent', label: 'K%', tip: '삼진 비율 (Strikeout %)' },
  { key: 'bb_percent', label: 'BB%', tip: '볼넷 비율 (Walk %)' },
  { key: 'wpa', label: 'WPA', tip: '승리 확률 기여도 (Win Probability Added)' },
  { key: 'war', label: 'WAR', tip: '대체 선수 대비 승리 기여도 (Wins Above Replacement)', hl: 'max' },
];

const colsForType = (t) => (t === 'pitcher' ? PITCHER_COLS : HITTER_COLS);

// Render a stat value with the existing "headline" highlights kept intact.
function statClass(key, value) {
  if (key === 'ops' && parseFloat(value) >= 0.9) return 'high-stat';
  if (key === 'war' && parseFloat(value) >= 5.0) return 'high-stat';
  return '';
}

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters (list tab)
  const [year, setYear] = useState("2026");
  const [team, setTeam] = useState("");
  const [playerType, setPlayerType] = useState("hitter");
  const [position, setPosition] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'war', direction: 'desc' });

  const [activeTab, setActiveTab] = useState('list');

  // Detail (player page) state
  const [detailPlayer, setDetailPlayer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Compare state
  const [compareType, setCompareType] = useState('hitter');
  const [compareEntries, setCompareEntries] = useState([]); // {key, id, name, position, year, stats}
  const [compareQuery, setCompareQuery] = useState('');
  const [compareResults, setCompareResults] = useState([]);
  const [compareSearching, setCompareSearching] = useState(false);

  // Fetch players based on filters (list tab)
  useEffect(() => {
    let cancelled = false;
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const teamParam = team === "전체" ? "" : team;
        const data = await getPlayers({ year, team: teamParam, playerType, position });
        if (!cancelled) {
          setPlayers(data);
          setPage(1);
        }
      } catch (err) {
        console.error("Error loading players:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPlayers();
    return () => { cancelled = true; };
  }, [year, team, playerType, position]);

  const cols = colsForType(playerType);
  const primaryKey = cols[0].key; // 'hra' or 'era'

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];
    if (searchQuery) {
      result = result.filter(p => p.name.includes(searchQuery));
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal, bVal;
        if (['name', 'team', 'position'].includes(sortConfig.key)) {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        } else {
          aVal = a.stats[sortConfig.key];
          bVal = b.stats[sortConfig.key];
        }
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    return result;
  }, [players, searchQuery, sortConfig]);

  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSortedPlayers.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedPlayers, page]);

  const totalPages = Math.ceil(filteredAndSortedPlayers.length / PAGE_SIZE);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'desc') return { key, direction: 'asc' };
        return { key: 'war', direction: 'desc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'desc' ? ' ▼' : ' ▲';
  };

  const positions = useMemo(() => {
    if (playerType === 'hitter') return ["내야수", "외야수", "포수"];
    if (playerType === 'pitcher') return ["투수"];
    return ["내야수", "외야수", "포수", "투수"];
  }, [playerType]);

  // ---- Detail (player page) ----
  const openPlayerDetail = useCallback(async (playerId) => {
    setActiveTab('detail');
    setDetailLoading(true);
    setDetailPlayer(null);
    try {
      const data = await getPlayer(playerId);
      setDetailPlayer(data);
    } catch (err) {
      console.error('Error loading player detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ---- Compare search ----
  useEffect(() => {
    if (activeTab !== 'compare') return;
    const q = compareQuery.trim();
    if (!q) {
      setCompareResults([]);
      return;
    }
    let cancelled = false;
    setCompareSearching(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchPlayers(q, compareType);
        if (!cancelled) setCompareResults(data);
      } catch (err) {
        console.error('Error searching players:', err);
      } finally {
        if (!cancelled) setCompareSearching(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [compareQuery, compareType, activeTab]);

  // Switching compare type clears entries (columns differ between hitter/pitcher).
  const handleCompareTypeChange = (t) => {
    setCompareType(t);
    setCompareEntries([]);
    setCompareResults([]);
    setCompareQuery('');
  };

  const addCompareEntry = (player, selectedYear) => {
    const entryKey = `${player.id}-${selectedYear}`;
    if (compareEntries.find(e => e.key === entryKey)) return;
    if (compareEntries.length >= 5) {
      alert('최대 5명까지 비교 가능합니다.');
      return;
    }
    const stats = player.seasons[selectedYear];
    setCompareEntries(prev => [...prev, {
      key: entryKey,
      id: player.id,
      name: player.name,
      position: player.position,
      year: selectedYear,
      stats,
    }]);
  };

  const removeCompareEntry = (key) => {
    setCompareEntries(prev => prev.filter(e => e.key !== key));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-area">
          <h1>KBO Stats Insight</h1>
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'list' || activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              기록 목록
            </button>
            <button
              className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              선수 비교 ({compareEntries.length})
            </button>
          </div>
        </div>

        {activeTab === 'list' && (
          <div className="filter-bar">
            <div className="filter-group">
              <label>시즌</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>구분</label>
              <select value={playerType} onChange={(e) => { setPlayerType(e.target.value); setPosition(''); }}>
                <option value="hitter">타자</option>
                <option value="pitcher">투수</option>
              </select>
            </div>
            <div className="filter-group">
              <label>팀</label>
              <select value={team} onChange={(e) => setTeam(e.target.value)}>
                {TEAMS.map(t => <option key={t} value={t === "전체" ? "" : t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>포지션</label>
              <select value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="">전체</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="filter-group search-group">
              <input
                type="text"
                placeholder="선수 이름을 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}
      </header>

      <main className="content">
        {/* ---------- LIST TAB ---------- */}
        {activeTab === 'list' && (
          loading ? (
            <Loader />
          ) : (
            <div className="list-wrapper">
            <div className="table-wrapper scroll-area">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th className="sticky-col-1">순위</th>
                    <th className="sticky-col-2 clickable" onClick={() => handleSort('name')} data-tip="선수명">선수명{getSortIcon('name')}</th>
                    <th className="sticky-col-3 clickable" onClick={() => handleSort('team')} data-tip="소속 팀">팀{getSortIcon('team')}</th>
                    <th className="sticky-col-4 clickable" onClick={() => handleSort('position')} data-tip="포지션">포지션{getSortIcon('position')}</th>
                    {cols.map((c, i) => (
                      <th
                        key={c.key}
                        className={`clickable ${i === 0 ? 'sticky-col-5' : ''}`}
                        onClick={() => handleSort(c.key)}
                        data-tip={c.tip}
                      >
                        {c.label}{getSortIcon(c.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPlayers.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="rank sticky-col-1">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="player-name-cell sticky-col-2">
                        <span className="player-name player-link" onClick={() => openPlayerDetail(p.id)} title="선수 상세 보기">
                          {p.name}
                        </span>
                      </td>
                      <td className="sticky-col-3">{p.team}</td>
                      <td className="sticky-col-4">{p.position}</td>
                      {cols.map((c, i) => {
                        const isPrimary = i === 0;
                        const isWar = c.key === 'war';
                        const sorted = sortConfig.key === c.key ? 'sorted-col' : '';
                        const baseCls = isWar ? 'highlighted' : 'stats-val';
                        const sticky = isPrimary ? 'sticky-col-5' : '';
                        const hi = statClass(c.key, p.stats[c.key]);
                        return (
                          <td key={c.key} className={`${baseCls} ${sticky} ${sorted}`.trim()}>
                            {hi ? <span className={hi}>{p.stats[c.key]}</span> : p.stats[c.key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {filteredAndSortedPlayers.length === 0 && (
                    <tr>
                      <td colSpan={4 + cols.length} className="no-data">일치하는 기록이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>이전</button>
              <span className="page-info">{page} / {totalPages || 1}</span>
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>다음</button>
            </div>
            </div>
          )
        )}

        {/* ---------- DETAIL TAB ---------- */}
        {activeTab === 'detail' && (
          <PlayerDetail
            player={detailPlayer}
            loading={detailLoading}
            onBack={() => setActiveTab('list')}
          />
        )}

        {/* ---------- COMPARE TAB ---------- */}
        {activeTab === 'compare' && (
          <CompareView
            compareType={compareType}
            onTypeChange={handleCompareTypeChange}
            query={compareQuery}
            onQueryChange={setCompareQuery}
            results={compareResults}
            searching={compareSearching}
            entries={compareEntries}
            onAdd={addCompareEntry}
            onRemove={removeCompareEntry}
          />
        )}
      </main>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <span>데이터 분석 중...</span>
    </div>
  );
}

// ---------- Player detail: year-by-year records ----------
function PlayerDetail({ player, loading, onBack }) {
  if (loading) return <Loader />;
  if (!player) {
    return (
      <div className="detail-wrapper">
        <button className="back-btn" onClick={onBack}>← 목록으로</button>
        <div className="no-data">선수 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  const type = player.playerType === 'pitcher' || player.position === '투수' ? 'pitcher' : 'hitter';
  const cols = colsForType(type);
  const seasons = player.seasons || {};
  const years = Object.keys(seasons).sort((a, b) => parseInt(b) - parseInt(a));

  // Compute career-best value per highlighted column.
  const bestByKey = {};
  cols.forEach(c => {
    if (!c.hl) return;
    const nums = years
      .map(y => parseFloat(seasons[y][c.key]))
      .filter(n => !isNaN(n));
    if (!nums.length) return;
    bestByKey[c.key] = c.hl === 'min' ? Math.min(...nums) : Math.max(...nums);
  });

  return (
    <div className="detail-wrapper">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>← 목록으로</button>
        <div className="detail-identity">
          <h2 className="detail-name">{player.name}</h2>
          <span className="detail-meta">{player.position || '-'} · {type === 'pitcher' ? '투수' : '타자'}</span>
        </div>
      </div>

      <div className="table-wrapper scroll-area">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="sticky-col-1" data-tip="시즌">연도</th>
              <th className="sticky-col-2" data-tip="소속 팀">팀</th>
              {cols.map((c) => (
                <th key={c.key} data-tip={c.tip}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(y => {
              const s = seasons[y];
              return (
                <tr key={y}>
                  <td className="rank sticky-col-1">{y}</td>
                  <td className="sticky-col-2">{s.team || '-'}</td>
                  {cols.map((c) => {
                    const val = s[c.key];
                    const isBest = c.hl && bestByKey[c.key] !== undefined &&
                      parseFloat(val) === bestByKey[c.key];
                    const baseCls = c.key === 'war' ? 'highlighted' : 'stats-val';
                    return (
                      <td key={c.key} className={baseCls}>
                        {isBest ? <span className="best-stat">{val}</span> : val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {years.length === 0 && (
              <tr><td colSpan={2 + cols.length} className="no-data">연도별 기록이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="detail-hint">초록색으로 강조된 값은 커리어 최고 기록입니다.</p>
    </div>
  );
}

// ---------- Compare view: search + cross-season comparison ----------
function CompareView({ compareType, onTypeChange, query, onQueryChange, results, searching, entries, onAdd, onRemove }) {
  const cols = colsForType(compareType);

  return (
    <div className="compare-wrapper">
      <div className="compare-search-panel">
        <div className="compare-controls">
          <div className="filter-group">
            <label>구분</label>
            <select value={compareType} onChange={(e) => onTypeChange(e.target.value)}>
              <option value="hitter">타자</option>
              <option value="pitcher">투수</option>
            </select>
          </div>
          <div className="filter-group search-group">
            <input
              type="text"
              className="search-input"
              placeholder="비교할 선수 이름을 검색하세요..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
        </div>

        {query.trim() && (
          <div className="search-results">
            {searching ? (
              <div className="search-hint">검색 중...</div>
            ) : results.length === 0 ? (
              <div className="search-hint">검색 결과가 없습니다.</div>
            ) : (
              results.map(p => (
                <SearchResultRow key={p.id} player={p} onAdd={onAdd} />
              ))
            )}
          </div>
        )}
      </div>

      <div className="table-wrapper scroll-area">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="sticky-name" data-tip="선수명 (시즌)">선수</th>
              <th className="sticky-team" data-tip="소속 팀">팀</th>
              {cols.map((c) => (
                <th key={c.key} data-tip={c.tip}>{c.label}</th>
              ))}
              <th>제외</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.key}>
                <td className="player-name-cell sticky-name">
                  <span className="player-name">{e.name}</span>
                  <span className="compare-year-badge">{e.year}</span>
                </td>
                <td className="sticky-team">{e.stats.team || '-'}</td>
                {cols.map((c) => {
                  const baseCls = c.key === 'war' ? 'highlighted' : 'stats-val';
                  return (
                    <td key={c.key} className={baseCls}>{e.stats[c.key]}</td>
                  );
                })}
                <td>
                  <button className="remove-btn" onClick={() => onRemove(e.key)}>제외</button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={3 + cols.length} className="no-selection">
                  위에서 선수를 검색해 비교 대상에 추가하세요. (시즌별로 선택 가능)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchResultRow({ player, onAdd }) {
  const [selYear, setSelYear] = useState(player.years[0]);
  return (
    <div className="search-result-row">
      <span className="sr-name">{player.name}</span>
      <span className="sr-pos">{player.position || '-'}</span>
      <select className="sr-year" value={selYear} onChange={(e) => setSelYear(e.target.value)}>
        {player.years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <button className="sr-add" onClick={() => onAdd(player, selYear)}>+ 추가</button>
    </div>
  );
}

export default App;
