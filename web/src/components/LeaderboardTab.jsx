import React, { useState, useMemo } from 'react';
import { Trophy, Search, ArrowUpDown, Medal, ChevronRight } from 'lucide-react';

export default function LeaderboardTab({ leaderboard, onSelectPlayer, matches, tournamentsCount }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortKey, setSortKey] = useState('points_pct');
  const [sortAsc, setSortAsc] = useState(false);

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

    if (searchTerm) {
      data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
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
  }, [leaderboard, matches, searchTerm, stageFilter, sortKey, sortAsc]);

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
      <div className="bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            {/* Pill Badge: semi-transparent on dark, solid subtle on light */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2.5 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              Roundnet Standings
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Crew Leaderboard
            </h1>
            {/* Darkened muted text on light mode (#475569) */}
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
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  stageFilter === 'all' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStageFilter('bracket')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  stageFilter === 'bracket' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bracket
              </button>
              <button
                onClick={() => setStageFilter('group')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  stageFilter === 'group' 
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17] dark:font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pool Play
              </button>
            </div>
          </div>
        </div>
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
              {filteredLeaderboard.map((player, idx) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
