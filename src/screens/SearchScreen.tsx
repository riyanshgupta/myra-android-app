import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { autocompleteApi, searchApi } from '../services/api';
import { Track } from '../types/music';

export const SearchScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
    playTrack,
    isLandscape,
    setActiveScreen,
  } = usePlayer();

  const [liveSearchResults, setLiveSearchResults] = useState<Track[]>([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Debounced API search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults([]);
      setAutocompleteSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);

      // 1. Fetch autocomplete suggestions
      const suggestions = await autocompleteApi(searchQuery.trim());
      if (suggestions && suggestions.length > 0) {
        setAutocompleteSuggestions(suggestions);
      } else {
        setAutocompleteSuggestions([]);
      }

      // 2. Fetch full search results
      const results = await searchApi(searchQuery.trim());
      if (results && results.length > 0) {
        setLiveSearchResults(results);
      } else {
        setLiveSearchResults([]);
      }

      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
    }
  };

  const resultsToDisplay = searchQuery.trim().length > 0
    ? liveSearchResults
    : [];

  return (
    <div
      className={`w-full ${
        isLandscape
          ? 'max-w-4xl mx-auto px-6 py-6 pb-28 min-h-[calc(100vh-140px)]'
          : 'px-4 pb-36 pt-2 max-w-md mx-auto min-h-[calc(100vh-140px)] select-none'
      }`}
    >
      {/* Search Input Box */}
      <section className="flex flex-col pt-1">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative w-full flex items-center bg-surface-container rounded-full group transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 border border-surface-container-high">
            <div className="pl-4 pr-2 flex items-center justify-center text-outline transition-colors group-focus-within:text-primary">
              <span className={`material-symbols-outlined text-[22px] ${isSearching ? 'animate-spin text-primary' : ''}`}>
                {isSearching ? 'sync' : 'search'}
              </span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isLandscape ? "Search artists, songs, albums, or ask Myra..." : "Search songs, artists, moods..."}
              className="w-full bg-transparent py-3 pr-20 text-on-surface placeholder:text-outline text-sm focus:outline-none tracking-wide"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                  aria-label="Clear Search"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveScreen('myra-ai')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-bright active:scale-95 transition-all cursor-pointer"
                aria-label="Voice Search"
                title="Voice Search"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          </div>
        </form>

        {/* Autocomplete Quick Chips */}
        {autocompleteSuggestions.length > 0 && searchQuery.trim().length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mt-1">
            {autocompleteSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(sug)}
                className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-xs text-secondary font-medium shrink-0 transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Search Results */}
      {searchQuery.trim().length > 0 && (
        <section className="flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-outline flex items-center gap-2">
              <span>Results for "{searchQuery}" ({resultsToDisplay.length})</span>
              {isSearching && <span className="animate-pulse text-primary font-mono text-[10px]">Searching API...</span>}
            </h3>
          </div>

          {isSearching ? (
            <div className="flex flex-col divide-y divide-surface-container-high/60 bg-surface-container-low rounded-2xl border border-surface-container-high/40 p-2">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-surface-container-high shrink-0" />
                    <div className="flex flex-col gap-2">
                      <div className="w-36 h-3.5 bg-surface-container-high rounded" />
                      <div className="w-24 h-3 bg-surface-container-high rounded" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
                </div>
              ))}
            </div>
          ) : resultsToDisplay.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-surface-container-high/40">
              <span className="material-symbols-outlined text-outline text-4xl mb-2">search_off</span>
              <p className="text-sm font-semibold text-on-surface">No matching tracks found</p>
              <p className="text-xs text-outline mt-1">
                Try searching for another song, artist, or album
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-surface-container-high/60 bg-surface-container-low rounded-2xl border border-surface-container-high/40 p-2">
              {resultsToDisplay.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    addSearchHistory(track.title, 'Track');
                    playTrack(track);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 shadow-sm bg-surface-container-highest">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline-sm text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </span>
                      <p className="text-xs text-on-surface-variant truncate">
                        {track.artist} • {track.genre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-outline">{track.durationFormatted}</span>
                    <button
                      className="w-8 h-8 rounded-lg bg-surface-container-high group-hover:bg-primary-container group-hover:text-on-primary-container text-on-surface flex items-center justify-center transition-colors"
                      title="Play"
                    >
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recent Searches */}
      {searchHistory.length > 0 && searchQuery.trim().length === 0 && (
        <section className="flex flex-col gap-2 mt-4 bg-surface-container-low rounded-2xl p-4 border border-surface-container-high/40 shadow-md">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-outline text-lg">history</span>
              <h2 className="text-sm font-semibold text-on-surface tracking-wide uppercase">
                Recent Searches
              </h2>
            </div>
            <button
              onClick={clearSearchHistory}
              className="text-xs font-label-md text-outline hover:text-error transition-colors py-1 px-2 rounded uppercase tracking-wider cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-col divide-y divide-surface-container-high/60">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSearchQuery(item.query)}
                className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-surface-container/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary text-[20px] shrink-0 transition-colors">
                    {item.category === 'Artist' ? 'person' : 'schedule'}
                  </span>
                  <span className="text-sm font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                    {item.query}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[11px] text-outline font-label-sm hidden sm:inline px-2 py-0.5 rounded bg-surface-container-high">
                    {item.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearchHistory(item.id);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-highest active:scale-90 transition-all shrink-0 cursor-pointer"
                    aria-label="Remove search item"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Genres & Categories in Landscape */}
      {isLandscape && searchQuery.trim().length === 0 && (
        <section className="flex flex-col gap-3 mt-6">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-outline">
            Browse Popular Genres
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Synthwave & Retro', icon: 'electric_bolt', color: 'from-purple-900/60 to-indigo-900/60' },
              { name: 'Top 50 Global', icon: 'trending_up', color: 'from-cyan-900/60 to-teal-900/60' },
              { name: 'Chill & Focus', icon: 'spa', color: 'from-pink-900/60 to-purple-900/60' },
              { name: 'Deep Space Ambient', icon: 'dark_mode', color: 'from-blue-900/60 to-slate-900/60' },
            ].map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSearchQuery(cat.name)}
                className={`p-4 rounded-xl bg-gradient-to-br ${cat.color} border border-surface-container-high/50 flex items-center gap-3 hover:scale-102 transition-all text-left shadow-md cursor-pointer`}
              >
                <span className="material-symbols-outlined text-secondary text-2xl">{cat.icon}</span>
                <span className="text-xs font-bold text-on-surface">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
