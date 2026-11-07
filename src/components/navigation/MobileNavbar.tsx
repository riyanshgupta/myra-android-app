import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { ScreenType } from '../../types/music';

export const MobileNavbar: React.FC = () => {
  const { activeScreen, setActiveScreen, isPlaying } = usePlayer();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom,0px)] bg-[#0c101b]/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.5)] border-t border-white/5 select-none"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
        {/* Item 1: Home */}
        <button
          onClick={() => setActiveScreen('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] gap-1 transition-all ${
            activeScreen === 'home'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Home"
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-label-sm text-[10px] tracking-wide">Home</span>
        </button>

        {/* Item 2: Search */}
        <button
          onClick={() => setActiveScreen('search')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] gap-1 transition-all ${
            activeScreen === 'search'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Search"
        >
          <span className="material-symbols-outlined text-[24px]">explore</span>
          <span className="font-label-sm text-[10px] tracking-wide">Search</span>
        </button>

        {/* Center Raised Myra AI Assistant Trigger */}
        <div className="flex items-center justify-center relative -top-3">
          <button
            onClick={() => setActiveScreen('myra-ai')}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-primary-container via-primary to-secondary flex items-center justify-center shadow-[0_0_24px_rgba(160,120,255,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer ${
              activeScreen === 'myra-ai' ? 'ring-3 ring-secondary' : ''
            }`}
            aria-label="Myra AI Assistant"
            title="Myra AI Speech & Assistant"
          >
            <span className="material-symbols-outlined text-on-primary text-[28px] animate-pulse">
              graphic_eq
            </span>
          </button>
        </div>

        {/* Item 4: Playlists & Library */}
        <button
          onClick={() => setActiveScreen('playlists')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] gap-1 transition-all ${
            activeScreen === 'playlists'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Playlists & Library"
        >
          <span className="material-symbols-outlined text-[24px]">queue_music</span>
          <span className="font-label-sm text-[10px] tracking-wide">Playlists</span>
        </button>

        {/* Item 5: Now Playing Single Screen */}
        <button
          onClick={() => setActiveScreen('player')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] gap-1 transition-all ${
            activeScreen === 'player'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Now Playing"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[24px]">album</span>
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary animate-pulse" />
            )}
          </div>
          <span className="font-label-sm text-[10px] tracking-wide">Player</span>
        </button>
      </div>
    </nav>
  );
};
