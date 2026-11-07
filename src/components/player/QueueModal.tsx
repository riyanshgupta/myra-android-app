import React, { useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';

export const QueueModal: React.FC = () => {
  const { isQueueOpen, setIsQueueOpen, currentTrack, queue, playTrack } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsQueueOpen(false);
    };
    if (isQueueOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQueueOpen, setIsQueueOpen]);

  if (!isQueueOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg select-none cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsQueueOpen(false);
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low border border-surface-container-high p-6 shadow-2xl flex flex-col h-[80vh] max-h-[700px] overflow-hidden cursor-default">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-2xl">queue_music</span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Playback Queue
              </h3>
              <p className="text-xs text-outline">{queue.length} Tracks in Queue</p>
            </div>
          </div>
          <button
            onClick={() => setIsQueueOpen(false)}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Current Playing Song Card */}
        {currentTrack ? (
          <div className="my-3 p-3 rounded-2xl bg-primary-container/20 border border-primary/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-0.5 bg-secondary h-3 animate-pulse" />
                  <span className="w-0.5 bg-primary h-5 animate-pulse" />
                  <span className="w-0.5 bg-secondary h-2.5 animate-pulse" />
                </div>
              </div>
              <div className="truncate min-w-0">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Now Playing
                </span>
                <p className="font-label-lg text-sm font-bold text-on-surface truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-on-surface-variant truncate">{currentTrack.artist}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-semibold shrink-0 ml-2">
              {currentTrack.durationFormatted}
            </span>
          </div>
        ) : (
          <div className="my-3 p-3 rounded-2xl bg-surface-container border border-surface-container-high text-xs text-outline text-center">
            No track currently playing
          </div>
        )}

        {/* Up Next List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 py-2 no-scrollbar">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider px-1">
            Up Next ({queue.length})
          </span>
          {queue.length === 0 ? (
            <div className="p-4 text-center text-xs text-outline italic">
              Queue is empty. Search for songs to add to queue!
            </div>
          ) : (
            queue.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                onClick={() => playTrack(track)}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group ${
                  currentTrack && track.id === currentTrack.id
                    ? 'bg-surface-container-high border border-primary/40'
                    : 'bg-surface-container/60 hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-outline w-5 text-center">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="font-label-lg text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs text-outline">{track.durationFormatted}</span>
                  <button
                    className="w-8 h-8 rounded-lg bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-outline-variant flex items-center justify-center transition-colors cursor-pointer"
                    title="Play Track"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
