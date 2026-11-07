import React from 'react';
import { usePlayer } from '../../context/PlayerContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progressPercent,
    togglePlay,
    nextTrack,
    likedTracks,
    toggleLike,
    setActiveScreen,
    activeScreen,
  } = usePlayer();

  // If the full Now Playing screen is already open or no track is loaded, hide the floating mini-player
  if (activeScreen === 'player' || !currentTrack) {
    return null;
  }

  const isLiked = likedTracks[currentTrack.id] || false;

  return (
    <aside
      onClick={() => setActiveScreen('player')}
      className="fixed bottom-20 inset-x-3 z-40 max-w-md mx-auto rounded-xl bg-surface-container-high shadow-[0_12px_32px_rgba(0,0,0,0.6)] border border-surface-container-highest/60 overflow-hidden cursor-pointer active:scale-[0.99] transition-transform select-none"
      aria-label="Now Playing Mini Player"
    >
      <div className="flex items-center justify-between p-2.5 gap-3">
        {/* Art Miniature & Animated Frequency Bars */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest shadow-sm">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="w-0.5 bg-secondary h-3 animate-pulse" />
                <span className="w-0.5 bg-primary h-4.5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-0.5 bg-secondary h-2.5 animate-pulse" style={{ animationDelay: '0.1s' }} />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-sm font-bold text-on-surface truncate">
                {currentTrack.title}
              </span>
              <span className="material-symbols-outlined text-secondary text-[14px]">stream</span>
            </div>
            <span className="font-body-sm text-xs text-on-surface-variant truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Action Elements */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            aria-label="Like track"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isLiked ? 'text-tertiary-container' : 'text-outline hover:text-on-surface'
              }`}
              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary-container hover:bg-primary text-on-primary-container flex items-center justify-center shadow-[0_0_12px_rgba(160,120,255,0.4)] active:scale-90 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform"
            aria-label="Next track"
          >
            <span className="material-symbols-outlined text-[20px]">skip_next</span>
          </button>
        </div>
      </div>

      {/* Micro Progress Line */}
      <div className="w-full h-1 bg-surface-container-highest">
        <div
          className="h-full bg-gradient-to-r from-primary-container to-secondary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </aside>
  );
};
