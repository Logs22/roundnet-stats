import React, { useState, useMemo } from 'react';
import { Trophy, Search, MapPin, Calendar, ExternalLink } from 'lucide-react';
import MatchCard from './MatchCard.jsx';

export default function TournamentsTab({ tournaments, matches, friends, selectedTournId, onSelectTourn, onBackToAll }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTournaments = useMemo(() => {
    if (!searchTerm) return tournaments;
    const s = searchTerm.toLowerCase();
    return tournaments.filter(t => 
      t.tournament_name.toLowerCase().includes(s) ||
      (t.city && t.city.toLowerCase().includes(s)) ||
      (t.state && t.state.toLowerCase().includes(s))
    );
  }, [tournaments, searchTerm]);

  const selectedTournMatches = useMemo(() => {
    if (!selectedTournId) return [];
    return matches.filter(m => m.tournament_id === selectedTournId);
  }, [matches, selectedTournId]);

  const selectedTourn = useMemo(() => {
    return tournaments.find(t => t.tournament_id === selectedTournId);
  }, [tournaments, selectedTournId]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2.5 bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              Tournament Directory
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Tournaments ({tournaments.length})</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Browse every tournament the crew has participated in with direct links to Fwango.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search tournament or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {selectedTourn ? (
        <div>
          <button
            onClick={onBackToAll}
            className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to all tournaments
          </button>
          
          <div className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm dark:shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedTourn.tournament_name}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {selectedTourn.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-amber-700 dark:text-cyan-400" />
                      {selectedTourn.city}, {selectedTourn.state}
                    </span>
                  )}
                  {selectedTourn.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      {new Date(selectedTourn.start_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {selectedTourn.url_slug && (
                <a
                  href={`https://fwango.io/${selectedTourn.url_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-[#0B0F17]"
                >
                  View on Fwango <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Tournament Matches ({selectedTournMatches.length})
          </h3>
          <div className="space-y-3">
            {selectedTournMatches.map(m => (
              <MatchCard key={m.match_id} match={m} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTournaments.map(t => (
            <div
              key={t.tournament_id}
              onClick={() => onSelectTourn(t.tournament_id)}
              className="bg-white dark:bg-[#151D2C] border border-slate-300 dark:border-slate-800 hover:border-slate-500 dark:hover:border-cyan-400 p-5 rounded-2xl cursor-pointer transition-all shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 text-base">
                  {t.tournament_name}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-3">
                  {t.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {t.city}, {t.state}
                    </span>
                  )}
                  {t.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {new Date(t.start_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">fwango.io/{t.url_slug}</span>
                <span className="font-bold text-slate-900 dark:text-cyan-300 group-hover:translate-x-1 transition-transform">
                  View Results →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
