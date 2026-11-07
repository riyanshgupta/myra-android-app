import React, { useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';

export const LyricsModal: React.FC = () => {
  const { isLyricsOpen, setIsLyricsOpen, currentTrack, currentTime } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLyricsOpen(false);
    };
    if (isLyricsOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLyricsOpen, setIsLyricsOpen]);

  if (!isLyricsOpen || !currentTrack) return null;

  const lyrics = currentTrack.lyrics || [
    { time: 0, text: 'Instrumental intro' },
    { time: 30, text: 'Feel the rhythm of the city night' },
    { time: 60, text: 'Neon lights reflecting bright' },
    { time: 90, text: 'Lost in sound, cruising far away' },
    { time: 120, text: 'Until the breaking of the day' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg select-none cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsLyricsOpen(false);
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low border border-surface-container-high p-6 shadow-2xl flex flex-col h-[75vh] max-h-[640px] overflow-hidden cursor-default">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">lyrics</span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-on-surface-variant">{currentTrack.artist}</p>
            </div>
          </div>
          <button
            onClick={() => setIsLyricsOpen(false)}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Lyrics Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 text-center no-scrollbar">
          {lyrics.map((line, idx) => {
            const nextLineTime = lyrics[idx + 1]?.time ?? 9999;
            const isCurrent = currentTime >= line.time && currentTime < nextLineTime;
            const isPast = currentTime >= nextLineTime;

            return (
              <p
                key={idx}
                className={`transition-all duration-300 text-lg md:text-xl font-bold leading-relaxed px-4 ${
                  isCurrent
                    ? 'text-secondary scale-105 filter drop-shadow-[0_0_12px_rgba(76,215,246,0.6)]'
                    : isPast
                    ? 'text-on-surface/40'
                    : 'text-on-surface/70'
                }`}
              >
                {line.text}
              </p>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-surface-container-high flex items-center justify-between text-xs text-outline shrink-0">
          <span>Real-time Synced Lyrics</span>
          <span className="font-mono">Time: {Math.floor(currentTime)}s</span>
        </div>
      </div>
    </div>
  );
};
