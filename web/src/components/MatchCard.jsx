import React from 'react';
import { Trophy, Calendar } from 'lucide-react';

export default function MatchCard({ match, highlightPlayer = '' }) {
  const isHighlightInTeam1 = highlightPlayer && match.team1_players?.toLowerCase().includes(highlightPlayer.toLowerCase());
  const isHighlightInTeam2 = highlightPlayer && match.team2_players?.toLowerCase().includes(highlightPlayer.toLowerCase());
  const isTie = match.winner_team === 'None/Tie' || match.winner_team === 'Tie' || !match.winner_players;

  const isTeam1Winner = !isTie && match.winner_team === match.team1_name;
  const isTeam2Winner = !isTie && match.winner_team === match.team2_name;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-[#151D2C] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all rounded-xl p-4 shadow-sm dark:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-cyan-300 dark:border-slate-700">
            {match.stage_type === 'group' ? 'Pool Play' : match.stage_type === 'bracket' ? 'Bracket Play' : match.stage_type}
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{match.division}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="truncate max-w-[220px] font-semibold text-slate-800 dark:text-slate-200">{match.tournament_name}</span>
          {match.played_at && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-cyan-400" />
              {formatDate(match.played_at)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        {/* Team 1 */}
        <div className={`p-3 rounded-lg border transition-all ${
          isTeam1Winner 
            ? 'bg-amber-50/70 border-amber-300 dark:bg-[#1A2638] dark:border-cyan-500/40' 
            : isTie 
              ? 'bg-slate-50 border-slate-200 dark:bg-[#0B0F17] dark:border-slate-800' 
              : 'bg-slate-50/50 border-slate-100 opacity-80 dark:bg-[#0B0F17]/60 dark:border-slate-800/60'
        }`}>
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              {match.team1_name}
              {isTeam1Winner && <Trophy className="w-4 h-4 text-amber-600 dark:text-[#FFE492] shrink-0 inline" />}
            </div>
            {isTeam1Winner && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-slate-900 text-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30">
                WINNER
              </span>
            )}
          </div>
          <div className={`text-xs mt-1.5 truncate ${isHighlightInTeam1 ? 'text-amber-800 dark:text-[#FFE492] font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
            {match.team1_players || 'Roster not recorded'}
          </div>
        </div>

        {/* Team 2 */}
        <div className={`p-3 rounded-lg border transition-all ${
          isTeam2Winner 
            ? 'bg-amber-50/70 border-amber-300 dark:bg-[#1A2638] dark:border-cyan-500/40' 
            : isTie 
              ? 'bg-slate-50 border-slate-200 dark:bg-[#0B0F17] dark:border-slate-800' 
              : 'bg-slate-50/50 border-slate-100 opacity-80 dark:bg-[#0B0F17]/60 dark:border-slate-800/60'
        }`}>
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              {match.team2_name}
              {isTeam2Winner && <Trophy className="w-4 h-4 text-amber-600 dark:text-[#FFE492] shrink-0 inline" />}
            </div>
            {isTeam2Winner && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-slate-900 text-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30">
                WINNER
              </span>
            )}
          </div>
          <div className={`text-xs mt-1.5 truncate ${isHighlightInTeam2 ? 'text-amber-800 dark:text-[#FFE492] font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
            {match.team2_players || 'Roster not recorded'}
          </div>
        </div>
      </div>

      {/* Game Scores */}
      {match.games && match.games.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scores:</span>
          {match.games.map((g, idx) => {
            const isOvertime = g.team1_score > 21 || g.team2_score > 21;
            return (
              <div 
                key={idx}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium tabular-nums flex items-center gap-1 border ${
                  isOvertime 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300' 
                    : 'bg-slate-100 border-slate-200 text-slate-800 dark:bg-[#0B0F17] dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">G{g.game_number}:</span>
                <span className={g.team1_score > g.team2_score ? 'font-bold text-slate-900 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'}>
                  {g.team1_score}
                </span>
                <span className="text-slate-400 dark:text-slate-600">-</span>
                <span className={g.team2_score > g.team1_score ? 'font-bold text-slate-900 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'}>
                  {g.team2_score}
                </span>
                {isOvertime && <span className="text-[9px] px-1 rounded font-bold ml-0.5 bg-amber-500 text-white dark:bg-amber-400/20 dark:text-amber-300">OT</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
