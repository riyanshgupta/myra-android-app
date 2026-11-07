import React from 'react';
import { usePlayer } from '../../context/PlayerContext';

export const CockpitNavbar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    likedTracks,
    toggleLike,
  } = usePlayer();

  const isLiked = currentTrack ? (likedTracks[currentTrack.id] || false) : false;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0e15]/95 backdrop-blur-2xl border-t border-surface-container-high/60 shadow-[0_-4px_24px_rgba(0,0,0,0.6)] select-none">
      <div className="h-20 w-full px-6 flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
        {/* Left: Scattered Current Track Teaser */}
        <div
          onClick={() => setActiveScreen('player')}
          className="flex items-center gap-3 w-1/4 min-w-[200px] cursor-pointer group"
          title="Open Cockpit Player"
        >
          <div className="relative w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden shrink-0 shadow-[0_0_12px_rgba(208,188,255,0.15)]">
            {currentTrack ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-lg">music_note</span>
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="w-0.5 bg-secondary h-3 animate-pulse" />
                <span className="w-0.5 bg-primary h-5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-0.5 bg-secondary h-2.5 animate-pulse" style={{ animationDelay: '0.1s' }} />
              </div>
            )}
          </div>
          <div className="truncate min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-label-lg text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                {currentTrack ? currentTrack.title : 'No track loaded'}
              </p>
              <span className="material-symbols-outlined text-secondary text-[14px]">stream</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant truncate">
              {currentTrack ? currentTrack.artist : 'Select a song to play'}
            </p>
          </div>
          {currentTrack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack.id);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-tertiary-container transition-colors shrink-0 cursor-pointer"
              aria-label="Like"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isLiked ? 'text-primary' : ''
                }`}
                style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          )}
        </div>

        {/* Center: Scattered Nav Links matching Mobile Navbar tabs (Without Profile) */}
        <nav
          className="flex items-center justify-center gap-1.5 md:gap-2.5 bg-surface-container-low/90 px-3.5 py-1.5 rounded-full border border-surface-container-high/50 shadow-inner"
          aria-label="Cockpit Main Navigation"
        >
          {/* Home */}
          <button
            onClick={() => setActiveScreen('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-semibold ${
              activeScreen === 'home'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">home</span>
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Search */}
          <button
            onClick={() => setActiveScreen('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-semibold ${
              activeScreen === 'search'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">search</span>
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Playlists & Library */}
          <button
            onClick={() => setActiveScreen('playlists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-semibold ${
              activeScreen === 'playlists'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">queue_music</span>
            <span className="hidden sm:inline">Playlists</span>
          </button>

          {/* Now Playing */}
          <button
            onClick={() => setActiveScreen('player')}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-full transition-all text-xs font-semibold ${
              activeScreen === 'player'
                ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container shadow-[0_0_20px_rgba(160,120,255,0.45)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">play_circle</span>
            <span className="hidden sm:inline">Now Playing</span>
            {activeScreen === 'player' && (
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            )}
          </button>

          {/* Myra AI Page Trigger */}
          <button
            onClick={() => setActiveScreen('myra-ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-semibold ${
              activeScreen === 'myra-ai'
                ? 'bg-gradient-to-r from-secondary-container to-primary-container text-on-secondary-container shadow-[0_0_20px_rgba(76,215,246,0.45)]'
                : 'text-secondary hover:text-secondary-fixed hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg animate-pulse text-secondary">
              auto_awesome
            </span>
            <span className="hidden sm:inline">Myra AI</span>
          </button>
        </nav>

        {/* Right: Tactile Quick Cockpit Audio Controls */}
        <div className="flex items-center justify-end gap-2 w-1/4 min-w-[160px]">
          <button
            onClick={prevTrack}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors active:scale-90"
            aria-label="Previous Track"
          >
            <span className="material-symbols-outlined text-xl">skip_previous</span>
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary-container hover:bg-primary text-on-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(160,120,255,0.4)] hover:scale-105 active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={nextTrack}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors active:scale-90"
            aria-label="Next Track"
          >
            <span className="material-symbols-outlined text-xl">skip_next</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
