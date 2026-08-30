import React, { useState, useEffect, useMemo } from 'react';
import { Swords, ArrowLeftRight, Share2, Check } from 'lucide-react';
import MatchCard from './MatchCard.jsx';

export default function HeadToHeadTab({ friends, matches, initialP1, initialP2, onSelectPlayers }) {
  const [player1, setPlayer1] = useState(initialP1 || friends[0] || 'Logan Graham');
  const [player2, setPlayer2] = useState(initialP2 || friends[2] || 'Alex Aaron');
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    if (initialP1 && initialP1 !== player1) setPlayer1(initialP1);
    if (initialP2 && initialP2 !== player2) setPlayer2(initialP2);
  }, [initialP1, initialP2]);

  const handleCopyShare = () => {
    const url = window.location.origin + window.location.pathname + `#/h2h?p1=${encodeURIComponent(player1)}&p2=${encodeURIComponent(player2)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleP1Change = (val) => {
    setPlayer1(val);
    if (onSelectPlayers) onSelectPlayers(val, player2);
  };

  const handleP2Change = (val) => {
    setPlayer2(val);
    if (onSelectPlayers) onSelectPlayers(player1, val);
  };

  const swapPlayers = () => {
    const temp = player1;
    setPlayer1(player2);
    setPlayer2(temp);
    if (onSelectPlayers) onSelectPlayers(player2, temp);
  };

  const h2hMatches = useMemo(() => {
    if (!player1 || !player2 || player1 === player2) return [];
    const p1 = player1.toLowerCase();
    const p2 = player2.toLowerCase();

    return matches.filter(m => {
      const t1 = m.team1_players?.toLowerCase() || '';
      const t2 = m.team2_players?.toLowerCase() || '';
      return (t1.includes(p1) && t2.includes(p2)) || (t1.includes(p2) && t2.includes(p1));
    });
  }, [matches, player1, player2]);

  const stats = useMemo(() => {
    const p1 = player1.toLowerCase();
    const p2 = player2.toLowerCase();

    let p1Wins = 0;
    let p2Wins = 0;
    let ties = 0;
    let p1Points = 0;
    let p2Points = 0;

    h2hMatches.forEach(m => {
      const p1InT1 = m.team1_players?.toLowerCase().includes(p1);
      const isWinnerP1 = m.winner_players?.toLowerCase().includes(p1);
      const isWinnerP2 = m.winner_players?.toLowerCase().includes(p2);

      if (isWinnerP1) p1Wins++;
      else if (isWinnerP2) p2Wins++;
      else ties++;

      if (m.games) {
        m.games.forEach(g => {
          if (p1InT1) {
            p1Points += g.team1_score;
            p2Points += g.team2_score;
          } else {
            p1Points += g.team2_score;
            p2Points += g.team1_score;
          }
        });
      }
    });

    return { p1Wins, p2Wins, ties, p1Points, p2Points };
  }, [h2hMatches, player1, player2]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Selectors */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
            <Swords className="w-3.5 h-3.5" />
            Rivalry Matrix
          </div>

          <button
            onClick={handleCopyShare}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F17] dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Copy share link for this matchup"
          >
            {copiedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Head-to-Head Showdown</h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Select any two friends to compare direct matchup records, game scores, and total points.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 sm:gap-4 items-center mt-5">
          {/* Player 1 Picker */}
          <div className="bg-slate-50 dark:bg-[#0B0F17] p-3 sm:p-4 rounded-xl border border-slate-300 dark:border-slate-700">
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-900 dark:text-cyan-300">
              Player 1
            </label>
            <select
              value={player1}
              onChange={(e) => handleP1Change(e.target.value)}
              className="w-full bg-transparent text-base sm:text-xl font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {friends.map(f => (
                <option key={f} value={f} disabled={f === player2} className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white">{f}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapPlayers}
              className="p-2.5 sm:p-3 rounded-full transition-all hover:rotate-180 duration-300 shadow-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-[#0B0F17] dark:hover:bg-cyan-300 cursor-pointer"
              title="Swap players"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Player 2 Picker */}
          <div className="bg-slate-50 dark:bg-[#0B0F17] p-3 sm:p-4 rounded-xl border border-slate-300 dark:border-slate-700">
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-amber-700 dark:text-amber-300">
              Player 2
            </label>
            <select
              value={player2}
              onChange={(e) => handleP2Change(e.target.value)}
              className="w-full bg-transparent text-base sm:text-xl font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {friends.map(f => (
                <option key={f} value={f} disabled={f === player1} className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white">{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Showdown Scorecards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* P1 Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center shadow-sm relative overflow-hidden transition-colors">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-cyan-300 truncate">{player1}</div>
          <div className="text-3xl sm:text-6xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2 tabular-nums">{stats.p1Wins}</div>
          <div className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 tracking-wider">WINS</div>
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">
            Pts: <span className="font-bold text-slate-900 dark:text-cyan-300 tabular-nums">{stats.p1Points}</span>
          </div>
        </div>

        {/* Total Matchups Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center shadow-sm flex flex-col justify-center transition-colors">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matchups</div>
          <div className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mt-0.5 sm:mt-1 tabular-nums">{h2hMatches.length}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{stats.ties} Ties</div>
        </div>

        {/* P2 Card */}
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center shadow-sm relative overflow-hidden transition-colors">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 truncate">{player2}</div>
          <div className="text-3xl sm:text-6xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2 tabular-nums">{stats.p2Wins}</div>
          <div className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 tracking-wider">WINS</div>
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">
            Pts: <span className="font-bold text-amber-800 dark:text-amber-300 tabular-nums">{stats.p2Points}</span>
          </div>
        </div>
      </div>

      {/* Match History List */}
      <div>
        <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-3">
          Match History ({h2hMatches.length} Direct Battles)
        </h2>

        {h2hMatches.length === 0 ? (
          <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-600 dark:text-slate-400">
            <p className="text-sm sm:text-base font-semibold">No direct matchups between {player1} and {player2}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">They may have played in different divisions or as teammates.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {h2hMatches.map((m) => (
              <MatchCard key={m.match_id} match={m} highlightPlayer={player1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
