import React, { useState, useMemo } from 'react';
import { Trophy, Search, ArrowUpDown, Medal, ChevronRight, SlidersHorizontal, X, RotateCcw, Zap, Sparkles, Filter } from 'lucide-react';

export const getDivisionTier = (divName) => {
  const dLow = (divName || '').toLowerCase();
  // Tier 1: Premier / Pro / 5.0+ / D1 Squads (1.50x)
  if (dLow.includes('pro') || dLow.includes('premier') || dLow.includes('5.0') || dLow.includes('5.5') || dLow.includes('6.0') || dLow.includes('d1 squad') || dLow.includes('squads d1')) {
    return { tier: 1, label: 'Tier 1: Premier / D1', weight: 1.5, badge: 'Premier/D1' };
  }
  // Tier 2: Expert / 4.5+ Contender (1.25x)
  if (dLow.includes('expert') || dLow.includes('4.5') || dLow.includes('contender')) {
    return { tier: 2, label: 'Tier 2: Expert / Contender', weight: 1.25, badge: 'Expert' };
  }
  // Tier 3: Advanced / Open / D2 Squads / Men's / Women's (1.00x Baseline)
  if (dLow.includes('advanced') || dLow.includes('open') || dLow.includes('4.0') || dLow.includes('d2 squad') || dLow.includes('squads d2') || dLow.includes('men') || dLow.includes('women') || dLow.includes('wadvanced')) {
    return { tier: 3, label: "Tier 3: Adv / Open / Women's", weight: 1.0, badge: 'Adv/Open' };
  }
  // Tier 4: Intermediate / Co-ed / Standard (0.80x)
  if (dLow.includes('intermediate') || dLow.includes('co-ed') || dLow.includes('coed') || dLow.includes('standard')) {
    return { tier: 4, label: 'Tier 4: Intermediate / Co-ed', weight: 0.8, badge: 'Int/Coed' };
  }
  // Tier 5: Beginner / Rec / All Skill (0.50x)
  if (dLow.includes('beginner') || dLow.includes('rec') || dLow.includes('all skill')) {
    return { tier: 5, label: 'Tier 5: Beginner / Rec', weight: 0.5, badge: 'Beg/Rec' };
  }
  return { tier: 3, label: 'Tier 3: Standard', weight: 1.0, badge: 'Standard' };
};

export default function LeaderboardTab({ leaderboard, onSelectPlayer, matches, tournamentsCount }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [rankingMode, setRankingMode] = useState('power'); // 'power' or 'standard'
  const [sortKey, setSortKey] = useState('power_rating');
  const [sortAsc, setSortAsc] = useState(false);

  // Stat filters
  const [minMatches, setMinMatches] = useState(10);
  const [minWinPct, setMinWinPct] = useState(0);
  const [minPointsPct, setMinPointsPct] = useState(0);
  const [minWins, setMinWins] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const activeFiltersCount = (minMatches !== 10 ? 1 : 0) + 
                             (minWinPct > 0 ? 1 : 0) + 
                             (minPointsPct > 0 ? 1 : 0) + 
                             (minWins > 0 ? 1 : 0) +
                             (divisionFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setMinMatches(0);
    setMinWinPct(0);
    setMinPointsPct(0);
    setMinWins(0);
    setSearchTerm('');
    setStageFilter('all');
    setDivisionFilter('all');
    setRankingMode('power');
    setSortKey('power_rating');
    setSortAsc(false);
  };

  const handleModeChange = (mode) => {
    setRankingMode(mode);
    if (mode === 'power') {
      setSortKey('power_rating');
      setSortAsc(false);
    } else {
      setSortKey('points_pct');
      setSortAsc(false);
    }
  };

  const filteredLeaderboard = useMemo(() => {
    // Dynamic recalculation per player with division weights and filters
    let data = leaderboard.map(p => {
      const pLower = p.name.toLowerCase();
      const pMatches = matches.filter(m => {
        const isPlayer = m.team1_players?.toLowerCase().includes(pLower) || m.team2_players?.toLowerCase().includes(pLower);
        if (!isPlayer) return false;
        if (stageFilter !== 'all' && m.stage_type !== stageFilter) return false;
        if (divisionFilter !== 'all') {
          const divInfo = getDivisionTier(m.division);
          if (divInfo.tier.toString() !== divisionFilter) return false;
        }
        return true;
      });

      let wins = 0;
      let ties = 0;
      let totalWeight = 0;

      pMatches.forEach(m => {
        const divInfo = getDivisionTier(m.division);
        totalWeight += divInfo.weight;
        const isWinner = m.winner_players?.toLowerCase().includes(pLower);
        const isTie = m.winner_team === 'None/Tie' || m.winner_team === 'Tie' || !m.winner_players;

        if (isWinner) wins++;
        else if (isTie) ties++;
      });

      const losses = pMatches.length - wins - ties;
      const win_pct = pMatches.length ? Math.round((wins / pMatches.length) * 1000) / 10 : 0;
      const points_pct = pMatches.length ? Math.round(((wins + 0.5 * ties) / pMatches.length) * 1000) / 10 : 0;
      const avg_tier_weight = pMatches.length ? Math.round((totalWeight / pMatches.length) * 100) / 100 : 1.0;
      const power_rating = Math.round(points_pct * avg_tier_weight * 10) / 10;

      return {
        ...p,
        matches_played: pMatches.length,
        wins,
        losses,
        ties,
        record: `${wins}-${losses}-${ties}`,
        win_pct,
        points_pct,
        avg_tier_weight,
        power_rating
      };
    });

    if (searchTerm) {
      data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

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
  }, [leaderboard, matches, searchTerm, stageFilter, divisionFilter, minMatches, minWinPct, minPointsPct, minWins, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner & Controls */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              Roundnet Standings
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Crew Leaderboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Rankings weighted by division difficulty, records, and win rates across all {leaderboard.length} friends and {tournamentsCount || 0} tournaments.
            </p>
          </div>

          {/* Ranking Mode Switcher Pill */}
          <div className="bg-slate-100 dark:bg-[#0B0F17] p-1 rounded-xl border border-slate-300 dark:border-slate-800 flex text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => handleModeChange('power')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rankingMode === 'power'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 dark:text-[#0B0F17]" />
              <span>Power Rating (Weighted)</span>
            </button>
            <button
              onClick={() => handleModeChange('standard')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rankingMode === 'standard'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Standard Win %</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[170px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Find a friend..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-cyan-400"
            />
          </div>

          {/* Division Tier Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Divisions (Weighted)</option>
              <option value="1">Tier 1: Premier & D1 Squads (1.5x)</option>
              <option value="2">Tier 2: Expert & Contender (1.25x)</option>
              <option value="3">Tier 3: Adv, Open, Women's (1.0x)</option>
              <option value="4">Tier 4: Intermediate & Co-ed (0.8x)</option>
              <option value="5">Tier 5: Beginner / Rec (0.5x)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* Stage Filter */}
            <div className="bg-slate-100 dark:bg-[#0B0F17] p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex text-xs font-semibold">
              <button
                onClick={() => setStageFilter('all')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  stageFilter === 'all' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStageFilter('bracket')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  stageFilter === 'bracket' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bracket
              </button>
              <button
                onClick={() => setStageFilter('group')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  stageFilter === 'group' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pool
              </button>
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-cyan-400 dark:text-[#0B0F17] dark:border-cyan-400'
                  : 'bg-slate-50 dark:bg-[#0B0F17] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-500'
              }`}
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
        <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 text-[11px] uppercase tracking-wider shrink-0">
              Min Matches:
            </span>
            {[
              { label: 'All', value: 0 },
              { label: '5+', value: 5 },
              { label: '10+ (Standard)', value: 10 },
              { label: '25+', value: 25 },
              { label: '50+', value: 50 },
            ].map(pill => (
              <button
                key={pill.value}
                onClick={() => setMinMatches(pill.value)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  minMatches === pill.value
                    ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredLeaderboard.length}</strong> of {leaderboard.length}
            </span>
            {(activeFiltersCount > 0 || searchTerm || stageFilter !== 'all' || divisionFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-amber-800 dark:text-cyan-300 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-1 text-xs"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="mt-3 p-4 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400" />
                Performance Thresholds
              </div>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-[#151D2C] p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Min Matches</span>
                  <span className="font-mono text-slate-900 dark:text-cyan-300 font-extrabold">{minMatches}</span>
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
              </div>

              <div className="bg-white dark:bg-[#151D2C] p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Min Win Rate %</span>
                  <span className="font-mono text-slate-900 dark:text-cyan-300 font-extrabold">{minWinPct}%</span>
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
              </div>

              <div className="bg-white dark:bg-[#151D2C] p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Min Points %</span>
                  <span className="font-mono text-amber-800 dark:text-[#FFE492] font-extrabold">{minPointsPct}%</span>
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
              </div>

              <div className="bg-white dark:bg-[#151D2C] p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Min Wins</span>
                  <span className="font-mono text-slate-900 dark:text-cyan-300 font-extrabold">{minWins}</span>
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Table */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="sm:hidden px-4 py-2 bg-slate-100 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>👈 Scroll horizontally for stats</span>
          <span className="font-semibold text-slate-700 dark:text-cyan-300">Name is locked</span>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-sm border-collapse min-w-[780px]">
            <thead className="bg-slate-200/90 dark:bg-[#0F172A] border-b border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider select-none">
              <tr>
                {/* Sticky Rank Header */}
                <th className="py-3.5 px-3 w-12 text-center sticky left-0 z-30 bg-slate-200 dark:bg-[#0F172A]">
                  Rank
                </th>

                {/* Sticky Player Name Header */}
                <th 
                  className="py-3.5 px-3 min-w-[150px] sm:min-w-[180px] sticky left-12 z-30 bg-slate-200 dark:bg-[#0F172A] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_6px_-2px_rgba(0,0,0,0.35)] border-r border-slate-300 dark:border-slate-800 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    Player <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>

                {/* Power Rating Column (Golden Highlight) */}
                <th 
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white bg-amber-500/10 dark:bg-amber-400/5 text-amber-900 dark:text-[#FFE492]"
                  onClick={() => handleSort('power_rating')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFE492]" />
                    <span>Power Rating</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFE492]" />
                  </div>
                </th>

                {/* Matches, Wins, Losses, Ties, Record */}
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('matches_played')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Matches <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-900 dark:text-cyan-300" onClick={() => handleSort('wins')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Wins <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-red-700 dark:text-rose-400" onClick={() => handleSort('losses')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Losses <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300" onClick={() => handleSort('ties')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Ties <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center font-mono text-xs">Record</th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('win_pct')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Win % <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 dark:text-cyan-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-amber-800 dark:text-[#FFE492]" onClick={() => handleSort('points_pct')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Points % <ArrowUpDown className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFE492]" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/90 dark:divide-slate-800">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 dark:text-slate-400">
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
                  const isEven = idx % 2 === 1;
                  const stickyBg = isEven ? 'bg-slate-100 dark:bg-[#111827]' : 'bg-white dark:bg-[#151D2C]';

                  return (
                    <tr 
                      key={player.name}
                      onClick={() => onSelectPlayer(player.name)}
                      className="odd:bg-white even:bg-slate-100 dark:odd:bg-[#151D2C] dark:even:bg-[#111827] hover:bg-slate-200/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      {/* Sticky Rank */}
                      <td className={`py-3.5 px-3 text-center sticky left-0 z-20 ${stickyBg} group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors`}>
                        {isTop3 ? (
                          <Medal className={`w-4 h-4 mx-auto ${medalColors[idx]}`} />
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400 font-mono text-xs tabular-nums font-semibold">{idx + 1}</span>
                        )}
                      </td>

                      {/* Sticky Player Name */}
                      <td className={`py-3.5 px-3 sticky left-12 z-20 ${stickyBg} shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_6px_-2px_rgba(0,0,0,0.35)] border-r border-slate-300 dark:border-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors`}>
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-cyan-300 transition-colors truncate max-w-[140px] sm:max-w-none">
                          {player.name}
                        </div>
                      </td>

                      {/* Power Rating (Golden Highlight) */}
                      <td className={`py-3.5 px-4 text-right tabular-nums bg-amber-500/5 dark:bg-amber-400/[0.02] ${sortKey === 'power_rating' ? 'font-black text-amber-900 dark:text-[#FFE492]' : 'font-bold text-amber-800 dark:text-amber-300'}`}>
                        <div className="text-base tabular-nums">{player.power_rating}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal font-mono">
                          {player.avg_tier_weight}x diff
                        </div>
                      </td>

                      {/* Matches */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'matches_played' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.matches_played}
                      </td>

                      {/* Wins */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'wins' ? 'font-bold' : 'font-normal'} text-slate-900 dark:text-cyan-300`}>
                        {player.wins}
                      </td>

                      {/* Losses */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'losses' ? 'font-bold' : 'font-normal'} text-red-700 dark:text-rose-400`}>
                        {player.losses}
                      </td>

                      {/* Ties */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'ties' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.ties}
                      </td>

                      {/* Record */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                        {player.record}
                      </td>

                      {/* Win % */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'win_pct' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.win_pct}%
                      </td>

                      {/* Points % */}
                      <td className={`py-3.5 px-4 text-right tabular-nums ${sortKey === 'points_pct' ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                        {player.points_pct}%
                      </td>

                      <td className="py-3.5 px-3 text-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-cyan-300">
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
