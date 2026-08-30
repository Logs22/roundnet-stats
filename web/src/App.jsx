import React, { useState, useEffect } from 'react';
import { Trophy, Swords, User, Flame, Calendar, Sun, Moon } from 'lucide-react';
import roundnetData from './data/roundnet_data.json';

import LeaderboardTab from './components/LeaderboardTab.jsx';
import HeadToHeadTab from './components/HeadToHeadTab.jsx';
import PlayerProfileTab from './components/PlayerProfileTab.jsx';
import ThrillersTab from './components/ThrillersTab.jsx';
import TournamentsTab from './components/TournamentsTab.jsx';

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    return { tab: 'leaderboard', params: {} };
  }
  const [path, query] = hash.split('?');
  const params = {};
  if (query) {
    const searchParams = new URLSearchParams(query);
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
  }
  const validTabs = ['leaderboard', 'h2h', 'profile', 'thrillers', 'tournaments'];
  const tab = validTabs.includes(path) ? path : 'leaderboard';
  return { tab, params };
}

function buildHash(tab, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.set(k, v);
    }
  });
  const qStr = query.toString();
  return `#/${tab}${qStr ? '?' + qStr : ''}`;
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute());
  const [theme, setTheme] = useState(() => localStorage.getItem('roundnet_theme') || 'dark');

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/leaderboard');
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('roundnet_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navigate = (tab, params = {}, replace = false) => {
    const newHash = buildHash(tab, params);
    if (window.location.hash !== newHash) {
      if (replace) {
        window.history.replaceState(null, '', newHash);
      } else {
        window.history.pushState(null, '', newHash);
      }
      setRoute({ tab, params });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const navItems = [
    { id: 'leaderboard', label: 'Leaderboard', shortLabel: 'Rankings', icon: Trophy },
    { id: 'h2h', label: 'Head-to-Head', shortLabel: 'H2H', icon: Swords },
    { id: 'profile', label: 'Player Profile', shortLabel: 'Profile', icon: User },
    { id: 'thrillers', label: 'Thrillers', shortLabel: 'Thrillers', icon: Flame },
    { id: 'tournaments', label: 'Tournaments', shortLabel: 'Tourneys', icon: Calendar },
  ];

  const currentTab = route.tab;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 dark:bg-[#111827]/95 dark:border-slate-800 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            {/* Logo + Title */}
            <div 
              onClick={() => navigate('leaderboard')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
              title="Return to Leaderboard"
            >
              <img 
                src="/norse_roundnet.png" 
                alt="Norse Roundnet Logo" 
                className="h-8 sm:h-11 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <span>ROUNDNET CREW</span>
                  <span className="hidden lg:inline-block text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                    {roundnetData.total_tournaments || roundnetData.tournaments?.length || 0} Tournaments
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
                  Tournament Statistics & Rivalries
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs + Theme Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-400 dark:text-[#0B0F17]' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Theme Toggle Button */}
              <div className="pl-1 sm:pl-2 md:border-l md:border-slate-200 md:dark:border-slate-800">
                <button
                  onClick={toggleTheme}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-800" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentTab === 'leaderboard' && (
          <LeaderboardTab 
            leaderboard={roundnetData.leaderboard}
            matches={roundnetData.matches}
            tournamentsCount={roundnetData.total_tournaments || roundnetData.tournaments?.length || 0}
            onSelectPlayer={(playerName) => navigate('profile', { player: playerName })}
          />
        )}
        {currentTab === 'h2h' && (
          <HeadToHeadTab 
            friends={roundnetData.friends_list}
            matches={roundnetData.matches}
            initialP1={route.params.p1}
            initialP2={route.params.p2}
            onSelectPlayers={(p1, p2) => navigate('h2h', { p1, p2 }, true)}
          />
        )}
        {currentTab === 'profile' && (
          <PlayerProfileTab 
            friends={roundnetData.friends_list}
            matches={roundnetData.matches}
            tournaments={roundnetData.tournaments}
            selectedPlayerName={route.params.player || roundnetData.friends_list[0]}
            onSelectPlayer={(playerName) => navigate('profile', { player: playerName })}
          />
        )}
        {currentTab === 'thrillers' && (
          <ThrillersTab 
            matches={roundnetData.matches}
            friends={roundnetData.friends_list}
          />
        )}
        {currentTab === 'tournaments' && (
          <TournamentsTab 
            tournaments={roundnetData.tournaments}
            matches={roundnetData.matches}
            friends={roundnetData.friends_list}
            selectedTournId={route.params.id || null}
            onSelectTourn={(tournId) => navigate('tournaments', { id: tournId })}
            onBackToAll={() => navigate('tournaments')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (iOS/Android App Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200 dark:bg-[#111827]/95 dark:border-slate-800 backdrop-blur-lg px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                  isActive 
                    ? 'text-slate-900 dark:text-cyan-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-md mb-0.5 transition-all ${
                  isActive ? 'bg-slate-900 text-white dark:bg-cyan-400/20 dark:text-cyan-300' : ''
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 dark:bg-[#070A10] dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-800 dark:text-slate-300">Roundnet Crew Analytics Platform</p>
          <p className="mt-1 text-slate-500 dark:text-slate-500">
            Last Synced: {new Date(roundnetData.last_updated).toLocaleString()} • {roundnetData.total_matches.toLocaleString()} Matches • {roundnetData.friends_list.length} Friends
          </p>
        </div>
      </footer>
    </div>
  );
}
