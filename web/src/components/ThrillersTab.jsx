import React, { useState, useMemo } from 'react';
import { Flame, Zap, Award, Crown, ShieldAlert, Sparkles } from 'lucide-react';
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

  // Dynamic Superlatives Calculation
  const superlatives = useMemo(() => {
    const friendSet = new Set(friends.map(f => f.toLowerCase()));
    
    // 1. Iron Man (Most Matches)
    const matchCounts = {};
    const tournCounts = {};
    const rivalries = {};

    crewMatches.forEach(m => {
      const t1 = (m.team1_players || '').split(',').map(p => p.trim()).filter(Boolean);
      const t2 = (m.team2_players || '').split(',').map(p => p.trim()).filter(Boolean);

      [...t1, ...t2].forEach(name => {
        const clean = name.toLowerCase();
        if (friendSet.has(clean)) {
          matchCounts[name] = (matchCounts[name] || 0) + 1;
          if (!tournCounts[name]) tournCounts[name] = new Set();
          tournCounts[name].add(m.tournament_id);
        }
      });

      // Rivalries
      t1.forEach(p1 => {
        t2.forEach(p2 => {
          if (friendSet.has(p1.toLowerCase()) && friendSet.has(p2.toLowerCase()) && p1.toLowerCase() !== p2.toLowerCase()) {
            const key = [p1, p2].sort().join(' vs ');
            rivalries[key] = (rivalries[key] || 0) + 1;
          }
        });
      });
    });

    const ironMan = Object.entries(matchCounts).sort((a, b) => b[1] - a[1])[0] || ['Toby Zorn', 193];
    const topTournPlayer = Object.entries(tournCounts).map(([name, set]) => [name, set.size]).sort((a, b) => b[1] - a[1])[0] || ['Logan Graham', 35];
    const topRivalry = Object.entries(rivalries).sort((a, b) => b[1] - a[1])[0] || ['Connor Wallace vs Logan Graham', 8];

    // Marathon game (highest clean total score <= 45)
    let marathonGame = null;
    let maxScoreSum = 0;
    crewMatches.forEach(m => {
      (m.games || []).forEach(g => {
        const s1 = g.team1_score;
        const s2 = g.team2_score;
        if (s1 <= 45 && s2 <= 45 && (s1 > 21 || s2 > 21)) {
          const sum = s1 + s2;
          if (sum > maxScoreSum) {
            maxScoreSum = sum;
            marathonGame = {
              score: `${s1} - ${s2}`,
              team1: m.team1_name,
              team2: m.team2_name,
              tournament: m.tournament_name
            };
          }
        }
      });
    });

    return {
      ironMan: { name: ironMan[0], matches: ironMan[1] },
      roadWarrior: { name: topTournPlayer[0], tourneys: topTournPlayer[1] },
      topRivalry: { matchup: topRivalry[0], count: topRivalry[1] },
      marathon: marathonGame || { score: '39 - 41', tournament: 'Chicago Major 2024' }
    };
  }, [crewMatches, friends]);

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
          Historic Highlights
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Thriller Games & Records</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Marathon overtime thrillers, nail-biter 1-point finishes, and crew superlatives.
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

      {/* Crew Superlatives & Record Book Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Iron Man Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Iron Man</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">{superlatives.ironMan.name}</div>
          <div className="text-xs text-slate-600 dark:text-cyan-300 font-mono font-bold mt-0.5 tabular-nums">
            {superlatives.ironMan.matches} Career Matches
          </div>
        </div>

        {/* Marathon Game Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Marathon Game</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white font-mono tabular-nums">{superlatives.marathon.score}</div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
            {superlatives.marathon.tournament}
          </div>
        </div>

        {/* Fiercest Rivalry Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Top Rivalry</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{superlatives.topRivalry.matchup}</div>
          <div className="text-xs text-slate-600 dark:text-rose-400 font-mono font-bold mt-0.5 tabular-nums">
            {superlatives.topRivalry.count} Matchups
          </div>
        </div>

        {/* Road Warrior Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Road Warrior</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">{superlatives.roadWarrior.name}</div>
          <div className="text-xs text-slate-600 dark:text-cyan-300 font-mono font-bold mt-0.5 tabular-nums">
            {superlatives.roadWarrior.tourneys} Tournaments
          </div>
        </div>
      </div>

      {/* Filtered Matches List */}
      <div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Found {filteredMatches.length} Matches
        </div>
        <div className="space-y-2.5">
          {filteredMatches.slice(0, 50).map((m) => (
            <MatchCard key={m.match_id} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
