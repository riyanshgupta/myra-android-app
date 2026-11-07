import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';

export const AddToPlaylistModal: React.FC = () => {
  const {
    isAddToPlaylistOpen,
    setIsAddToPlaylistOpen,
    targetTrackForPlaylist,
    currentTrack,
    playlists,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    createPlaylist,
  } = usePlayer();

  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddToPlaylistOpen(false);
    };
    if (isAddToPlaylistOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddToPlaylistOpen, setIsAddToPlaylistOpen]);

  if (!isAddToPlaylistOpen) return null;

  const track = targetTrackForPlaylist || currentTrack;
  if (!track) return null;

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const created = await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim(), track.id);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreatingNew(false);
    setFeedbackMessage(`Created "${created.title}" and added ${track.title}!`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleTogglePlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    const isAlreadyIn = playlist.tracks.some((t) => t.id === track.id);
    if (isAlreadyIn) {
      removeTrackFromPlaylist(playlistId, track.id);
      setFeedbackMessage(`Removed from "${playlist.title}"`);
    } else {
      addTrackToPlaylist(playlistId, track.id);
      setFeedbackMessage(`Added to "${playlist.title}"`);
    }
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAddToPlaylistOpen(false);
      }}
    >
      <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] cursor-default">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-surface-container-highest overflow-hidden shrink-0 shadow">
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                Add to Playlist
              </span>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface truncate">
                {track.title}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddToPlaylistOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="px-4 py-2 bg-primary/20 border-b border-primary/30 text-xs font-semibold text-primary flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Action: Create New Playlist Accordion */}
        <div className="p-3 border-b border-surface-container-high/40 bg-surface-container/40">
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-primary text-on-primary hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 font-bold text-xs shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">playlist_add</span>
              <span>+ Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNew} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">New Playlist</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-outline hover:text-on-surface"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name (e.g. Late Night Vibes)"
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary"
              />

              <input
                type="text"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary"
              />

              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-surface-container-lowest font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              >
                Create & Add "{track.title}"
              </button>
            </form>
          )}
        </div>

        {/* Playlists List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2 max-h-[350px]">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider px-1">
            Your Playlists
          </span>

          {playlists.map((playlist) => {
            const isAdded = playlist.tracks.some((t) => t.id === track.id);
            return (
              <div
                key={playlist.id}
                onClick={() => handleTogglePlaylist(playlist.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isAdded
                    ? 'bg-primary-container/20 border-primary/50 text-primary'
                    : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-on-surface truncate">
                      {playlist.title}
                    </h4>
                    <p className="text-[10px] text-outline truncate">
                      {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdded ? (
                    <span
                      className="material-symbols-outlined text-secondary text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-2xl hover:text-primary">
                      add_circle
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Done Button */}
        <div className="p-3 border-t border-surface-container-high/50 bg-surface-container-low">
          <button
            onClick={() => setIsAddToPlaylistOpen(false)}
            className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
