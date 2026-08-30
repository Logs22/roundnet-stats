import React, { useState, useMemo } from 'react';
import { Flame, Zap, Award } from 'lucide-react';
import MatchCard from './MatchCard.jsx';

export default function ThrillersTab({ matches, friends }) {
  const [filterType, setFilterType] = useState('overtime');

  const crewMatches = useMemo(() => {
    const friendSet = friends.map(f => f.toLowerCase());
    return matches.filter(m => {
      const t1 = m.team1_players?.toLowerCase() || '';
      const t2 = m.team2_players?.toLowerCase() || '';
      return friendSet.some(f => t1.includes(f) || t2.includes(f));
    });
  }, [matches, friends]);

  const filteredMatches = useMemo(() => {
    if (filterType === 'overtime') {
      return crewMatches
        .filter(m => m.games?.some(g => g.team1_score > 21 || g.team2_score > 21))
        .sort((a, b) => {
          const maxA = Math.max(...a.games.map(g => g.team1_score + g.team2_score));
          const maxB = Math.max(...b.games.map(g => g.team1_score + g.team2_score));
          return maxB - maxA;
        });
    } else if (filterType === 'closest') {
      return crewMatches
        .filter(m => m.games?.some(g => g.point_diff <= 2))
        .sort((a, b) => {
          const minA = Math.min(...a.games.map(g => g.point_diff));
          const minB = Math.min(...b.games.map(g => g.point_diff));
          return minA - minB;
        });
    } else {
      return crewMatches
        .filter(m => m.games?.some(g => g.point_diff >= 10))
        .sort((a, b) => {
          const maxA = Math.max(...a.games.map(g => g.point_diff));
          const maxB = Math.max(...b.games.map(g => g.point_diff));
          return maxB - maxA;
        });
    }
  }, [crewMatches, filterType]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-[#222F44] rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-[#FFE492]/20 dark:text-[#FFE492] dark:border-[#FFE492]/40">
          <Flame className="w-3.5 h-3.5" />
          Game Highlights
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Thriller Games & Records</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Marathon overtime matches, nail-biter 1-point games, and blowout victories.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setFilterType('overtime')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              filterType === 'overtime' 
                ? 'bg-amber-500 text-white shadow-sm dark:bg-[#FFE492] dark:text-[#0B0F17]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0B0F17] dark:text-slate-300 dark:border dark:border-[#222F44] dark:hover:bg-[#1C2638]'
            }`}
          >
            <Zap className="w-4 h-4" />
            Overtime Games (&gt; 21 Pts)
          </button>
          <button
            onClick={() => setFilterType('closest')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              filterType === 'closest' 
                ? 'bg-slate-900 text-white shadow-sm dark:bg-[#A7CEFC] dark:text-[#0B0F17]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0B0F17] dark:text-slate-300 dark:border dark:border-[#222F44] dark:hover:bg-[#1C2638]'
            }`}
          >
            <Flame className="w-4 h-4" />
            Heart-Stoppers (≤ 2 Pt Margin)
          </button>
          <button
            onClick={() => setFilterType('blowouts')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              filterType === 'blowouts' 
                ? 'bg-amber-700 text-white shadow-sm dark:bg-[#A7CEFC]/30 dark:text-[#A7CEFC] dark:border dark:border-[#A7CEFC]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0B0F17] dark:text-slate-300 dark:border dark:border-[#222F44] dark:hover:bg-[#1C2638]'
            }`}
          >
            <Award className="w-4 h-4" />
            Biggest Blowouts (≥ 10 Pts)
          </button>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Found {filteredMatches.length} Matches
        </div>
        <div className="space-y-3">
          {filteredMatches.map(m => (
            <MatchCard key={m.match_id} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
