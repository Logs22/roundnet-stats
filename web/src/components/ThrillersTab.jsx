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
        .filter(m => m.games?.some(g => (g.team1_score > 21 || g.team2_score > 21) && g.team1_score <= 45 && g.team2_score <= 45))
        .sort((a, b) => {
          const maxA = Math.max(...a.games.map(g => (g.team1_score <= 45 && g.team2_score <= 45) ? g.team1_score + g.team2_score : 0));
          const maxB = Math.max(...b.games.map(g => (g.team1_score <= 45 && g.team2_score <= 45) ? g.team1_score + g.team2_score : 0));
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
        .filter(m => m.games?.some(g => g.point_diff >= 10 && g.team1_score <= 35 && g.team2_score <= 35))
        .sort((a, b) => {
          const maxA = Math.max(...a.games.map(g => (g.team1_score <= 35 && g.team2_score <= 35) ? g.point_diff : 0));
          const maxB = Math.max(...b.games.map(g => (g.team1_score <= 35 && g.team2_score <= 35) ? g.point_diff : 0));
          return maxB - maxA;
        });
    }
  }, [crewMatches, filterType]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
          <Flame className="w-3.5 h-3.5" />
          Game Highlights
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Thriller Matches</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Browse marathon overtime games, nail-biter 1-point finishes, and blowout victories.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5">
          <button
            onClick={() => setFilterType('overtime')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'overtime' 
                ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0B0F17] dark:text-slate-300 dark:border dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500 dark:text-[#0B0F17]" />
            Overtime (&gt;21 Pts)
          </button>
          <button
            onClick={() => setFilterType('closest')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'closest' 
                ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0B0F17] dark:text-slate-300 dark:border dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            Heart-Stoppers (≤2 Pt Margin)
          </button>
          <button
            onClick={() => setFilterType('blowouts')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'blowouts' 
                ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0B0F17] dark:text-slate-300 dark:border dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            Blowouts (≥10 Pt Margin)
          </button>
        </div>
      </div>

      {/* Filtered Matches List */}
      <div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Found {filteredMatches.length} Matches
        </div>
        <div className="space-y-2.5">
          {filteredMatches.slice(0, 60).map((m) => (
            <MatchCard key={m.match_id} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
