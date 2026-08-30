import React, { useMemo } from 'react';
import { Crown, Zap, Flame, Award, Users, Swords, Globe, Medal, ChevronRight, TrendingUp } from 'lucide-react';

export default function SuperlativesTab({ leaderboard, matches, friends, onSelectPlayer, onSelectRivalry }) {
  const records = useMemo(() => {
    const friendSet = new Set(friends.map(f => f.toLowerCase()));
    const nameMap = {};
    leaderboard.forEach(p => { nameMap[p.name.toLowerCase()] = p.name; });

    // 1. Top 5 Iron Man (Most Matches)
    const topMatches = [...leaderboard]
      .sort((a, b) => b.matches_played - a.matches_played)
      .slice(0, 5);

    // 2. Top 5 Road Warriors (Most Distinct Tournaments)
    const tournCountMap = {};
    matches.forEach(m => {
      const t1 = (m.team1_players || '').split(',').map(p => p.trim().toLowerCase()).filter(p => friendSet.has(p));
      const t2 = (m.team2_players || '').split(',').map(p => p.trim().toLowerCase()).filter(p => friendSet.has(p));
      [...t1, ...t2].forEach(p => {
        if (!tournCountMap[p]) tournCountMap[p] = new Set();
        tournCountMap[p].add(m.tournament_id);
      });
    });

    const topRoadWarriors = Object.entries(tournCountMap)
      .map(([k, set]) => ({ name: nameMap[k] || k.toUpperCase(), count: set.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Top 5 Dynamic Duos (Partnerships)
    const pairMap = {};
    const pairWins = {};
    matches.forEach(m => {
      [m.team1_players, m.team2_players].forEach(teamStr => {
        const pList = (teamStr || '').split(',').map(p => nameMap[p.trim().toLowerCase()] || p.trim()).filter(p => friendSet.has(p.toLowerCase()));
        if (pList.length >= 2) {
          const p1 = pList[0];
          const p2 = pList[1];
          if (p1.toLowerCase() !== p2.toLowerCase()) {
            const pairKey = [p1, p2].sort().join(' & ');
            pairMap[pairKey] = (pairMap[pairKey] || 0) + 1;
            const isWinner = m.winner_players?.toLowerCase().includes(p1.toLowerCase());
            if (isWinner) pairWins[pairKey] = (pairWins[pairKey] || 0) + 1;
          }
        }
      });
    });

    const topPartnerships = Object.entries(pairMap)
      .map(([pair, count]) => ({
        pair,
        count,
        wins: pairWins[pair] || 0,
        winPct: Math.round(((pairWins[pair] || 0) / count) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Top 5 Fiercest Rivalries
    const rivalryMap = {};
    matches.forEach(m => {
      const t1 = (m.team1_players || '').split(',').map(p => nameMap[p.trim().toLowerCase()] || p.trim()).filter(p => friendSet.has(p.toLowerCase()));
      const t2 = (m.team2_players || '').split(',').map(p => nameMap[p.trim().toLowerCase()] || p.trim()).filter(p => friendSet.has(p.toLowerCase()));
      t1.forEach(p1 => {
        t2.forEach(p2 => {
          if (p1.toLowerCase() !== p2.toLowerCase()) {
            const rKey = [p1, p2].sort().join(' vs ');
            rivalryMap[rKey] = (rivalryMap[rKey] || 0) + 1;
          }
        });
      });
    });

    const topRivalries = Object.entries(rivalryMap)
      .map(([rivalry, count]) => {
        const [p1, p2] = rivalry.split(' vs ');
        return { rivalry, p1, p2, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 5. Top 5 Marathon Overtime Games (clean scores <= 45)
    const marathonGames = [];
    matches.forEach(m => {
      (m.games || []).forEach(g => {
        const s1 = g.team1_score;
        const s2 = g.team2_score;
        if (s1 <= 45 && s2 <= 45 && (s1 > 21 || s2 > 21)) {
          marathonGames.append ? null : marathonGames.push({
            score: `${s1} - ${s2}`,
            total_pts: s1 + s2,
            team1: m.team1_name,
            team2: m.team2_name,
            tournament: m.tournament_name
          });
        }
      });
    });

    const seenMarathons = new Set();
    const topMarathons = [];
    marathonGames
      .sort((a, b) => b.total_pts - a.total_pts)
      .forEach(g => {
        const key = `${g.score}-${g.tournament}-${g.team1}`;
        if (!seenMarathons.has(key) && topMarathons.length < 5) {
          seenMarathons.add(key);
          topMarathons.push(g);
        }
      });

    // 6. Top 5 Biggest Blowouts (margin <= 30, max score <= 30)
    const blowoutGames = [];
    matches.forEach(m => {
      (m.games || []).forEach(g => {
        const s1 = g.team1_score;
        const s2 = g.team2_score;
        if (s1 <= 30 && s2 <= 30 && (s1 >= 15 || s2 >= 15)) {
          const diff = Math.abs(s1 - s2);
          blowoutGames.push({
            score: `${Math.max(s1, s2)} - ${Math.min(s1, s2)}`,
            diff,
            team1: m.team1_name,
            team2: m.team2_name,
            tournament: m.tournament_name
          });
        }
      });
    });

    const seenBlowouts = new Set();
    const topBlowouts = [];
    blowoutGames
      .sort((a, b) => b.diff - a.diff)
      .forEach(g => {
        const key = `${g.score}-${g.tournament}-${g.team1}`;
        if (!seenBlowouts.has(key) && topBlowouts.length < 5) {
          seenBlowouts.add(key);
          topBlowouts.push(g);
        }
      });

    // 7. Highest Win Rate % (Min 15 matches)
    const topWinRates = [...leaderboard]
      .filter(p => p.matches_played >= 15)
      .sort((a, b) => b.win_pct - a.win_pct)
      .slice(0, 5);

    return {
      topMatches,
      topRoadWarriors,
      topPartnerships,
      topRivalries,
      topMarathons,
      topBlowouts,
      topWinRates
    };
  }, [leaderboard, matches, friends]);

  const medalStyles = [
    { text: 'text-amber-500 dark:text-[#FFE492]', bg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-[#FFE492] border-amber-200 dark:border-amber-500/20' },
    { text: 'text-slate-400 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
    { text: 'text-amber-700 dark:text-amber-600', bg: 'bg-amber-100 dark:bg-amber-700/15 text-amber-900 dark:text-amber-400 border-amber-200 dark:border-amber-700/30' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
          <Crown className="w-3.5 h-3.5" />
          Hall of Fame
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Crew Record Book & Superlatives
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
          All-time historic milestones, endurance achievements, top partnerships, and fierce rivalries across 49 tournaments.
        </p>
      </div>

      {/* Superlative Grid (2 Columns on Tablet/Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Iron Man (Most Matches) */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Iron Man Leaders</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Most career matches played</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400">
              Top 5
            </span>
          </div>

          <div className="space-y-2">
            {records.topMatches.map((p, idx) => (
              <div 
                key={p.name}
                onClick={() => onSelectPlayer && onSelectPlayer(p.name)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-cyan-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-center font-mono font-bold text-xs">
                    {idx < 3 ? <Medal className={`w-4 h-4 mx-auto ${medalStyles[idx].text}`} /> : `#${idx + 1}`}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-amber-700 dark:group-hover:text-cyan-300 transition-colors">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-cyan-300 text-xs sm:text-sm tabular-nums">
                    {p.matches_played} <span className="text-[10px] text-slate-500 font-sans">matches</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Road Warriors (Most Tournaments) */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-900 dark:bg-cyan-500/10 dark:text-cyan-300">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Road Warriors</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Most distinct tournaments attended</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400">
              Top 5
            </span>
          </div>

          <div className="space-y-2">
            {records.topRoadWarriors.map((p, idx) => (
              <div 
                key={p.name}
                onClick={() => onSelectPlayer && onSelectPlayer(p.name)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-cyan-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-center font-mono font-bold text-xs">
                    {idx < 3 ? <Medal className={`w-4 h-4 mx-auto ${medalStyles[idx].text}`} /> : `#${idx + 1}`}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-amber-700 dark:group-hover:text-cyan-300 transition-colors">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-cyan-300 text-xs sm:text-sm tabular-nums">
                    {p.count} <span className="text-[10px] text-slate-500 font-sans">events</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Dynamic Duos (Top Partnerships) */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Dynamic Duos</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Most matches played as teammates</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400">
              Top 5
            </span>
          </div>

          <div className="space-y-2">
            {records.topPartnerships.map((p, idx) => (
              <div 
                key={p.pair}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-xs shrink-0">
                    {idx < 3 ? <Medal className={`w-4 h-4 mx-auto ${medalStyles[idx].text}`} /> : `#${idx + 1}`}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">{p.pair}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">{p.wins} wins together</div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <div className="font-mono font-bold text-slate-900 dark:text-cyan-300 text-xs sm:text-sm tabular-nums">
                    {p.count} <span className="text-[10px] text-slate-500 font-sans">matches</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{p.winPct}% Win</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Fiercest Rivalries (Head-to-Head) */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-900 dark:bg-rose-500/10 dark:text-rose-400">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Fiercest Rivalries</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Most frequent head-to-head encounters</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400">
              Top 5
            </span>
          </div>

          <div className="space-y-2">
            {records.topRivalries.map((r, idx) => (
              <div 
                key={r.rivalry}
                onClick={() => onSelectRivalry && onSelectRivalry(r.p1, r.p2)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-cyan-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-xs shrink-0">
                    {idx < 3 ? <Medal className={`w-4 h-4 mx-auto ${medalStyles[idx].text}`} /> : `#${idx + 1}`}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-rose-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                    {r.rivalry}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm tabular-nums">
                    {r.count} <span className="text-[10px] text-slate-500 font-sans">battles</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Marathon Games (Highest Overtime Score) */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Marathon Games</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Highest total scoring overtime finishes</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400">
              Top 5
            </span>
          </div>

          <div className="space-y-2">
            {records.topMarathons.map((g, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono font-bold text-xs">
                      {idx < 3 ? <Medal className={`w-3.5 h-3.5 mx-auto ${medalStyles[idx].text}`} /> : `#${idx + 1}`}
                    </span>
                    <span className="font-mono font-black text-slate-900 dark:text-[#FFE492] text-sm tabular-nums">
                      {g.score}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                      {g.total_pts} Total Pts
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 pl-7 truncate">
                  {g.team1} vs {g.team2} • <span className="text-slate-500">{g.tournament}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Highest Win Rates (Efficiency) */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Win Rate Kings</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Highest win % (minimum 15 matches)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400">
              Top 5
            </span>
          </div>

          <div className="space-y-2">
            {records.topWinRates.map((p, idx) => (
              <div 
                key={p.name}
                onClick={() => onSelectPlayer && onSelectPlayer(p.name)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-cyan-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-center font-mono font-bold text-xs">
                    {idx < 3 ? <Medal className={`w-4 h-4 mx-auto ${medalStyles[idx].text}`} /> : `#${idx + 1}`}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-amber-700 dark:group-hover:text-cyan-300 transition-colors">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm tabular-nums">
                    {p.win_pct}% <span className="text-[10px] text-slate-500 font-sans font-normal">({p.wins}W - {p.losses}L)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
