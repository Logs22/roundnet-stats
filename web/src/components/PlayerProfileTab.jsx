import React, { useState, useMemo } from 'react';
import { User, Trophy, Calendar, MapPin, ChevronDown, ChevronUp, Users, Shield, Search, Share2, Check, TrendingUp } from 'lucide-react';
import MatchCard from './MatchCard.jsx';

export default function PlayerProfileTab({ friends, matches, tournaments, selectedPlayerName, onSelectPlayer }) {
  const selectedPlayer = selectedPlayerName || friends[0] || 'Logan Graham';
  const [stageFilter, setStageFilter] = useState('all');
  const [tournamentSearch, setTournamentSearch] = useState('');
  const [expandedTournaments, setExpandedTournaments] = useState({});
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  const handleCopyShare = () => {
    const url = window.location.origin + window.location.pathname + `#/profile?player=${encodeURIComponent(selectedPlayer)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const filteredFriendsList = useMemo(() => {
    if (!playerSearchQuery) return friends;
    const q = playerSearchQuery.toLowerCase();
    return friends.filter(f => f.toLowerCase().includes(q));
  }, [friends, playerSearchQuery]);

  const tournLookup = useMemo(() => {
    const map = {};
    tournaments.forEach(t => { map[t.tournament_id] = t; });
    return map;
  }, [tournaments]);

  const playerMatches = useMemo(() => {
    const p = selectedPlayer.toLowerCase();
    return matches.filter(m => {
      const t1 = m.team1_players?.toLowerCase() || '';
      const t2 = m.team2_players?.toLowerCase() || '';
      return t1.includes(p) || t2.includes(p);
    });
  }, [matches, selectedPlayer]);

  // Recent Form (Last 5 matches sorted chronologically)
  const recentForm = useMemo(() => {
    const p = selectedPlayer.toLowerCase();
    const sorted = [...playerMatches].sort((a, b) => {
      const dateA = a.played_at ? new Date(a.played_at).getTime() : 0;
      const dateB = b.played_at ? new Date(b.played_at).getTime() : 0;
      return dateB - dateA;
    });

    const last5 = sorted.slice(0, 5).map(m => {
      const isWinner = m.winner_players?.toLowerCase().includes(p);
      const isTie = m.winner_team === 'None/Tie' || m.winner_team === 'Tie' || !m.winner_players;
      return {
        match_id: m.match_id,
        tournament_name: m.tournament_name,
        result: isWinner ? 'W' : isTie ? 'T' : 'L',
        opponents: (m.team1_players?.toLowerCase().includes(p) ? m.team2_players : m.team1_players) || m.team2_name || 'Opponent'
      };
    });

    const winsIn5 = last5.filter(x => x.result === 'W').length;
    const lossesIn5 = last5.filter(x => x.result === 'L').length;
    const tiesIn5 = last5.filter(x => x.result === 'T').length;

    return {
      matches: last5,
      summary: `${winsIn5}W - ${lossesIn5}L${tiesIn5 ? ` - ${tiesIn5}T` : ''}`
    };
  }, [playerMatches, selectedPlayer]);

  const tournamentGroups = useMemo(() => {
    const p = selectedPlayer.toLowerCase();
    const groups = {};

    playerMatches.forEach(m => {
      if (stageFilter !== 'all' && m.stage_type !== stageFilter) return;

      const tid = m.tournament_id;
      if (!groups[tid]) {
        const meta = tournLookup[tid] || {};
        groups[tid] = {
          tournament_id: tid,
          name: meta.tournament_name || m.tournament_name || 'Unknown Tournament',
          date: meta.start_date || m.played_at,
          city: meta.city,
          state: meta.state,
          url_slug: meta.url_slug,
          matches: [],
          teams: new Set(),
          wins: 0,
          losses: 0,
          ties: 0,
        };
      }

      groups[tid].matches.push(m);

      const isWinner = m.winner_players?.toLowerCase().includes(p);
      const isTie = m.winner_team === 'None/Tie' || m.winner_team === 'Tie' || !m.winner_players;

      if (isWinner) groups[tid].wins++;
      else if (isTie) groups[tid].ties++;
      else groups[tid].losses++;

      if (m.team1_players?.toLowerCase().includes(p)) groups[tid].teams.add(m.team1_name);
      if (m.team2_players?.toLowerCase().includes(p)) groups[tid].teams.add(m.team2_name);
    });

    let list = Object.values(groups).map(g => ({
      ...g,
      team_names: Array.from(g.teams),
      record: `${g.wins}-${g.losses}-${g.ties}`,
      win_pct: g.matches.length ? Math.round((g.wins / g.matches.length) * 100) : 0
    }));

    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    if (tournamentSearch) {
      const q = tournamentSearch.toLowerCase();
      list = list.filter(g => 
        g.name.toLowerCase().includes(q) ||
        (g.city && g.city.toLowerCase().includes(q)) ||
        (g.state && g.state.toLowerCase().includes(q)) ||
        g.team_names.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [playerMatches, stageFilter, tournLookup, selectedPlayer, tournamentSearch]);

  const analytics = useMemo(() => {
    const p = selectedPlayer.toLowerCase();
    let wins = 0;
    let ties = 0;
    let losses = 0;

    const partnerCounts = {};
    const rivalCounts = {};

    playerMatches.forEach(m => {
      const pInT1 = m.team1_players?.toLowerCase().includes(p);
      const isWinner = m.winner_players?.toLowerCase().includes(p);
      const isTie = m.winner_team === 'None/Tie' || m.winner_team === 'Tie' || !m.winner_players;

      if (isWinner) wins++;
      else if (isTie) ties++;
      else losses++;

      const teammates = (pInT1 ? m.team1_players : m.team2_players) || '';
      teammates.split(',').map(name => name.trim()).forEach(name => {
        if (name && !name.toLowerCase().includes(p)) {
          if (!partnerCounts[name]) partnerCounts[name] = { played: 0, wins: 0 };
          partnerCounts[name].played++;
          if (isWinner) partnerCounts[name].wins++;
        }
      });

      const opponents = (pInT1 ? m.team2_players : m.team1_players) || '';
      opponents.split(',').map(name => name.trim()).forEach(name => {
        if (name) {
          if (!rivalCounts[name]) rivalCounts[name] = { played: 0 };
          rivalCounts[name].played++;
        }
      });
    });

    const topPartners = Object.entries(partnerCounts)
      .map(([name, stat]) => ({ name, ...stat, winPct: Math.round((stat.wins / stat.played) * 100) }))
      .sort((a, b) => b.played - a.played)
      .slice(0, 4);

    const topRivals = Object.entries(rivalCounts)
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.played - a.played)
      .slice(0, 4);

    const winPct = playerMatches.length ? Math.round((wins / playerMatches.length) * 1000) / 10 : 0;
    const pointsPct = playerMatches.length ? Math.round(((wins + 0.5 * ties) / playerMatches.length) * 1000) / 10 : 0;

    return { wins, ties, losses, winPct, pointsPct, topPartners, topRivals };
  }, [playerMatches, selectedPlayer]);

  const toggleTournament = (tid) => {
    setExpandedTournaments(prev => ({
      ...prev,
      [tid]: !prev[tid]
    }));
  };

  const expandAll = () => {
    const all = {};
    tournamentGroups.forEach(g => { all[g.tournament_id] = true; });
    setExpandedTournaments(all);
  };

  const collapseAll = () => {
    setExpandedTournaments({});
  };

  const getFriendMatch = (name) => {
    if (!name) return null;
    const clean = name.trim().toLowerCase();
    const exact = friends.find(f => f.toLowerCase() === clean);
    if (exact) return exact;

    if (clean === 'patrick flynn' || clean === 'pat flynn') return friends.find(f => f.toLowerCase().includes('flynn'));
    if (clean === 'aiden gill' || clean === 'aidan gill') return friends.find(f => f.toLowerCase().includes('gill'));
    if (clean === 'whitney aaron' || clean === 'whitney graham') return friends.find(f => f.toLowerCase().includes('whitney'));

    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      const match = friends.find(f => {
        const fParts = f.toLowerCase().split(' ').filter(Boolean);
        return fParts[0] === parts[0] && fParts[fParts.length - 1] === parts[parts.length - 1];
      });
      if (match) return match;
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Player Header Banner */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="w-full lg:w-auto">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 dark:bg-sky-500/10 dark:text-cyan-300 dark:border-sky-500/20">
                <User className="w-3.5 h-3.5" />
                Career Player Profile
              </div>

              {/* Share Profile Button */}
              <button
                onClick={handleCopyShare}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#0B0F17] dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="Copy share link for this player"
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

            {/* Searchable Player Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <select
                value={selectedPlayer}
                onChange={(e) => {
                  if (onSelectPlayer) {
                    onSelectPlayer(e.target.value);
                  }
                  setExpandedTournaments({});
                }}
                className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-cyan-400 cursor-pointer w-full sm:w-auto"
              >
                {friends.map(f => (
                  <option key={f} value={f} className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white text-base">{f}</option>
                ))}
              </select>

              {/* Recent Form Badge */}
              {recentForm.matches.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 text-xs mt-1 sm:mt-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-600 dark:text-cyan-400" /> Form:
                  </span>
                  <div className="flex items-center gap-1">
                    {recentForm.matches.map((m, i) => (
                      <span
                        key={i}
                        title={`vs ${m.opponents} at ${m.tournament_name}`}
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-xs select-none ${
                          m.result === 'W' 
                            ? 'bg-emerald-600 dark:bg-cyan-500' 
                            : m.result === 'L' 
                              ? 'bg-red-600 dark:bg-rose-500' 
                              : 'bg-slate-500'
                        }`}
                      >
                        {m.result}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    ({recentForm.summary})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-800 p-2.5 sm:p-3.5 rounded-xl text-center min-w-[85px]">
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Tournaments</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">{tournamentGroups.length}</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-800 p-2.5 sm:p-3.5 rounded-xl text-center min-w-[85px]">
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Matches</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">{playerMatches.length}</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-800 p-2.5 sm:p-3.5 rounded-xl text-center min-w-[85px]">
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Record</div>
              <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-cyan-300 mt-1 tabular-nums">
                {analytics.wins}-{analytics.losses}-{analytics.ties}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-800 p-2.5 sm:p-3.5 rounded-xl text-center min-w-[85px]">
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Points %</div>
              <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-[#FFE492] mt-0.5 tabular-nums">{analytics.pointsPct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners & Rivals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Users className="w-4 h-4 text-slate-900 dark:text-cyan-400" />
            Frequent Teammates & Synergy
          </h3>
          {analytics.topPartners.length === 0 ? (
            <p className="text-xs text-slate-500">No teammate history recorded.</p>
          ) : (
            <div className="space-y-2">
              {analytics.topPartners.map(p => {
                const friendMatch = getFriendMatch(p.name);
                return (
                  <div 
                    key={p.name}
                    onClick={() => {
                      if (friendMatch && onSelectPlayer) {
                        onSelectPlayer(friendMatch);
                        setExpandedTournaments({});
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-xl border border-slate-200 dark:border-slate-800 transition-all ${
                      friendMatch 
                        ? 'cursor-pointer hover:border-slate-400 dark:hover:border-cyan-400 hover:shadow-sm group' 
                        : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                        <span className={friendMatch ? 'group-hover:text-amber-700 dark:group-hover:text-cyan-300 transition-colors' : ''}>
                          {p.name}
                        </span>
                        {friendMatch && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 dark:bg-cyan-400/15 dark:text-cyan-300 dark:border-cyan-400/30">
                            Profile →
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">{p.played} matches together</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-cyan-400/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30 tabular-nums">
                        {p.winPct}%
                      </span>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 tabular-nums">{p.wins} wins</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-300" />
            Most Frequent Opponents
          </h3>
          {analytics.topRivals.length === 0 ? (
            <p className="text-xs text-slate-500">No opponent history recorded.</p>
          ) : (
            <div className="space-y-2">
              {analytics.topRivals.map(r => {
                const friendMatch = getFriendMatch(r.name);
                return (
                  <div 
                    key={r.name}
                    onClick={() => {
                      if (friendMatch && onSelectPlayer) {
                        onSelectPlayer(friendMatch);
                        setExpandedTournaments({});
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-xl border border-slate-200 dark:border-slate-800 transition-all ${
                      friendMatch 
                        ? 'cursor-pointer hover:border-slate-400 dark:hover:border-cyan-400 hover:shadow-sm group' 
                        : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                        <span className={friendMatch ? 'group-hover:text-amber-700 dark:group-hover:text-cyan-300 transition-colors' : ''}>
                          {r.name}
                        </span>
                        {friendMatch && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 dark:bg-cyan-400/15 dark:text-cyan-300 dark:border-cyan-400/30">
                            Profile →
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Rival Matchup</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md tabular-nums">
                      {r.played} Matchups
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TOURNAMENT HIERARCHY MATCH LOG */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-300 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              Tournament History ({tournamentGroups.length})
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Click any tournament to view match results and game scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter tourneys..."
                value={tournamentSearch}
                onChange={(e) => setTournamentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium dark:bg-[#151D2C] dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer text-xs"
              >
                Expand
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium dark:bg-[#151D2C] dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer text-xs"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>

        {/* Tournaments Accordion List */}
        {tournamentGroups.length === 0 ? (
          <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400">
            No tournaments found matching your filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tournamentGroups.map((tourn) => {
              const isExpanded = !!expandedTournaments[tourn.tournament_id];
              return (
                <div
                  key={tourn.tournament_id}
                  className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-md transition-all"
                >
                  <div
                    onClick={() => toggleTournament(tourn.tournament_id)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
                  >
                    <div className="flex items-start sm:items-center gap-2.5">
                      <div className={`p-2 rounded-lg border transition-colors shrink-0 ${
                        isExpanded 
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-cyan-400/20 dark:text-cyan-300 dark:border-cyan-400/30' 
                          : 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700'
                      }`}>
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-amber-700 dark:hover:text-cyan-300 transition-colors truncate">
                          {tourn.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {tourn.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-700 dark:text-cyan-400" />
                              {new Date(tourn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                          {tourn.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {tourn.city}, {tourn.state}
                            </span>
                          )}
                          {tourn.team_names.length > 0 && (
                            <span className="font-semibold px-1.5 py-0.2 rounded border bg-slate-100 border-slate-200 text-slate-800 dark:bg-[#0B0F17] dark:border-slate-800 dark:text-slate-300 truncate max-w-[180px]">
                              Team: {tourn.team_names.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium px-1.5 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-900 dark:bg-[#0B0F17] dark:border-slate-800 dark:text-slate-200 tabular-nums">
                          {tourn.record}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 tabular-nums">
                          {tourn.win_pct}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1 pl-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {tourn.matches.length}m
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-900 dark:text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 sm:p-5 bg-slate-50 dark:bg-[#0B0F17] border-t border-slate-300 dark:border-slate-800 space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-300 mb-1">
                        Matches Played at {tourn.name}
                      </div>
                      {tourn.matches.map(m => (
                        <MatchCard key={m.match_id} match={m} highlightPlayer={selectedPlayer} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
