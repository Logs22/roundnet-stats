import React, { useState, useMemo } from 'react';
import { Trophy, Search, ArrowUpDown, Medal, ChevronRight, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

export default function LeaderboardTab({ leaderboard, onSelectPlayer, matches, tournamentsCount }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortKey, setSortKey] = useState('points_pct');
  const [sortAsc, setSortAsc] = useState(false);

  // Stat filters
  const [minMatches, setMinMatches] = useState(0);
  const [minWinPct, setMinWinPct] = useState(0);
  const [minPointsPct, setMinPointsPct] = useState(0);
  const [minWins, setMinWins] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const activeFiltersCount = (minMatches > 0 ? 1 : 0) + 
                             (minWinPct > 0 ? 1 : 0) + 
                             (minPointsPct > 0 ? 1 : 0) + 
                             (minWins > 0 ? 1 : 0);

  const resetFilters = () => {
    setMinMatches(0);
    setMinWinPct(0);
    setMinPointsPct(0);
    setMinWins(0);
    setSearchTerm('');
    setStageFilter('all');
  };

  const filteredLeaderboard = useMemo(() => {
    let data = [...leaderboard];

    if (stageFilter !== 'all') {
      data = leaderboard.map(p => {
        const pLower = p.name.toLowerCase();
        const pMatches = matches.filter(m => 
          m.stage_type === stageFilter &&
          (m.team1_players?.toLowerCase().includes(pLower) || m.team2_players?.toLowerCase().includes(pLower))
        );
        const wins = pMatches.filter(m => m.winner_players?.toLowerCase().includes(pLower)).length;
        const ties = pMatches.filter(m => m.winner_team === 'None/Tie' || m.winner_team === 'Tie' || !m.winner_players).length;
        const losses = pMatches.length - wins - ties;
        const win_pct = pMatches.length ? Math.round((wins / pMatches.length) * 1000) / 10 : 0;
        const points_pct = pMatches.length ? Math.round(((wins + 0.5 * ties) / pMatches.length) * 1000) / 10 : 0;

        return {
          ...p,
          matches_played: pMatches.length,
          wins,
          losses,
          ties,
          record: `${wins}-${losses}-${ties}`,
          win_pct,
          points_pct
        };
      });
    }

    // Name search
    if (searchTerm) {
      data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Stat threshold filtering
    if (minMatches > 0) {
      data = data.filter(p => p.matches_played >= minMatches);
    }
    if (minWinPct > 0) {
      data = data.filter(p => p.win_pct >= minWinPct);
    }
    if (minPointsPct > 0) {
      data = data.filter(p => p.points_pct >= minPointsPct);
    }
    if (minWins > 0) {
      data = data.filter(p => p.wins >= minWins);
    }

    data.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return data;
  }, [leaderboard, matches, searchTerm, stageFilter, minMatches, minWinPct, minPointsPct, minWins, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2.5 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              Roundnet Standings
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Crew Leaderboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1.5 max-w-xl">
              Rankings, records, and win rates across all {leaderboard.length} friends and {tournamentsCount || 0} tournaments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Find a friend..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Stage Filter */}
            <div className="bg-slate-100 dark:bg-[#0B0F17] p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex text-xs font-semibold">
              <button
                onClick={() => setStageFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  stageFilter === 'all' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStageFilter('bracket')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  stageFilter === 'bracket' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bracket
              </button>
              <button
                onClick={() => setStageFilter('group')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  stageFilter === 'group' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pool Play
              </button>
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-cyan-400 dark:text-[#0B0F17] dark:border-cyan-400'
                  : 'bg-slate-50 dark:bg-[#0B0F17] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-500'
              }`}
              title="Filter by Match Count, Win %, Points %, Wins"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white dark:bg-[#0B0F17] dark:text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Min-Matches Pill Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400 mr-1 uppercase tracking-wider text-[11px]">
              Min Matches:
            </span>
            {[
              { label: 'All', value: 0 },
              { label: '5+ Matches', value: 5 },
              { label: '10+ Matches', value: 10 },
              { label: '25+ Matches', value: 25 },
              { label: '50+ Matches', value: 50 },
            ].map(pill => (
              <button
                key={pill.value}
                onClick={() => setMinMatches(pill.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  minMatches === pill.value
                    ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredLeaderboard.length}</strong> of {leaderboard.length} players
            </span>
            {(activeFiltersCount > 0 || searchTerm || stageFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-amber-800 dark:text-cyan-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="mt-4 p-5 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400" />
                Filter by Performance Thresholds
              </div>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Min Matches */}
              <div className="bg-white dark:bg-[#151D2C] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Min Matches Played</span>
                  <span className="font-mono text-slate-900 dark:text-cyan-300 text-sm font-extrabold">{minMatches}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minMatches}
                  onChange={(e) => setMinMatches(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0</span>
                  <span>50</span>
                  <span>100+</span>
                </div>
              </div>

              {/* Min Win % */}
              <div className="bg-white dark:bg-[#151D2C] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Min Win Rate %</span>
                  <span className="font-mono text-slate-900 dark:text-cyan-300 text-sm font-extrabold">{minWinPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={minWinPct}
                  onChange={(e) => setMinWinPct(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0%</span>
                  <span>40%</span>
                  <span>80%</span>
                </div>
              </div>

              {/* Min Points % */}
              <div className="bg-white dark:bg-[#151D2C] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Min Points %</span>
                  <span className="font-mono text-amber-800 dark:text-[#FFE492] text-sm font-extrabold">{minPointsPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={minPointsPct}
                  onChange={(e) => setMinPointsPct(Number(e.target.value))}
                  className="w-full accent-amber-600 dark:accent-[#FFE492] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0%</span>
                  <span>40%</span>
                  <span>80%</span>
                </div>
              </div>

              {/* Min Total Wins */}
              <div className="bg-white dark:bg-[#151D2C] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Min Total Wins</span>
                  <span className="font-mono text-slate-900 dark:text-cyan-300 text-sm font-extrabold">{minWins}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={minWins}
                  onChange={(e) => setMinWins(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0</span>
                  <span>25</span>
                  <span>50+</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table with Row Striping, Stronger Borders, Tabular-Nums & Right-Aligned Figures */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-200/80 dark:bg-[#0F172A] border-b border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider select-none">
              <tr>
                <th className="py-4 px-4 w-14 text-center">Rank</th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    Player <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('matches_played')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Matches <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-900 dark:text-cyan-300" onClick={() => handleSort('wins')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Wins <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-red-700 dark:text-rose-400" onClick={() => handleSort('losses')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Losses <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300" onClick={() => handleSort('ties')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Ties <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-4 px-4 text-center font-mono text-xs">Record</th>
                <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('win_pct')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Win % <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-amber-800 dark:text-[#FFE492]" onClick={() => handleSort('points_pct')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Points % <ArrowUpDown className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFE492]" />
                  </div>
                </th>
                <th className="py-4 px-4 text-center w-10"></th>
              </tr>
            </thead>
            {/* Boosted divider border between rows */}
            <tbody className="divide-y divide-slate-300/90 dark:divide-slate-800">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-semibold">No players match the selected filters.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs font-bold text-slate-900 dark:text-cyan-300 hover:underline cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((player, idx) => {
                  const isTop3 = idx < 3;
                  const medalColors = ['text-amber-500 dark:text-[#FFE492]', 'text-slate-400 dark:text-slate-300', 'text-amber-700 dark:text-amber-600'];
                  return (
                    <tr 
                      key={player.name}
                      onClick={() => onSelectPlayer(player.name)}
                      className="odd:bg-white even:bg-slate-100/75 dark:odd:bg-[#151D2C] dark:even:bg-[#111827]/70 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {isTop3 ? (
                          <Medal className={`w-4 h-4 mx-auto ${medalColors[idx]}`} />
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400 font-mono text-xs tabular-nums font-semibold">{idx + 1}</span>
                        )}
                      </td>

                      {/* Player Name (bold) */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-cyan-300 transition-colors">
                          {player.name}
                        </div>
                      </td>

                      {/* Matches Played (regular weight, right-aligned) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'matches_played' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.matches_played}
                      </td>

                      {/* Wins (regular weight by default, cyan pastel on dark) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'wins' ? 'font-bold' : 'font-normal'} text-slate-900 dark:text-cyan-300`}>
                        {player.wins}
                      </td>

                      {/* Losses (deep red on light #b91c1c, pastel rose on dark #fb7185) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'losses' ? 'font-bold' : 'font-normal'} text-red-700 dark:text-rose-400`}>
                        {player.losses}
                      </td>

                      {/* Ties (lifted to brighter slate on dark mode) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'ties' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.ties}
                      </td>

                      {/* Record (tabular-nums font-mono) */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                        {player.record}
                      </td>

                      {/* Win % (regular weight unless sorted) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'win_pct' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.win_pct}%
                      </td>

                      {/* Points % (deepened amber on light #92400e / #b45309, warm yellow on dark) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums text-base ${sortKey === 'points_pct' ? 'font-extrabold text-amber-800 dark:text-[#FFE492]' : 'font-semibold text-amber-800 dark:text-amber-300'}`}>
                        {player.points_pct}%
                      </td>

                      {/* Chevron */}
                      <td className="py-3.5 px-4 text-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-cyan-300">
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
