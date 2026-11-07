import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Playlist } from '../types/music';

export const PlaylistsScreen: React.FC = () => {
  const { playTrack, isLandscape, likedTracks, playlists, isLoadingPlaylists, createPlaylist, trendingTracks } = usePlayer();
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'favorites' | 'albums'>('all');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');

  const favoriteTracks = trendingTracks.filter((t) => likedTracks[t.id]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    await createPlaylist(newPlaylistTitle.trim(), 'Custom playlist created in library.');
    setNewPlaylistTitle('');
    setIsCreateModalOpen(false);
  };

  return (
    <div
      className={`w-full ${
        isLandscape
          ? 'max-w-[1920px] mx-auto px-6 py-6 pb-28 min-h-[calc(100vh-140px)]'
          : 'px-4 pb-36 pt-2 max-w-md mx-auto min-h-[calc(100vh-140px)] select-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 pt-1">
        <div>
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">
            Playlists & Library
          </h2>
          <p className="text-xs text-on-surface-variant">Your personal acoustic sanctuary</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Playlist</span>
        </button>
      </div>

      {/* Library Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {[
          { id: 'all', label: 'All Library' },
          { id: 'playlists', label: `Playlists (${playlists.length})` },
          { id: 'favorites', label: `Liked Songs (${favoriteTracks.length})` },
          { id: 'albums', label: 'Master Albums' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              setSelectedPlaylist(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container shadow-[0_2px_12px_rgba(160,120,255,0.35)]'
                : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* If a playlist is selected: Playlist Drilldown View */}
      {selectedPlaylist ? (
        <div className="mt-4 flex flex-col gap-4">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center gap-1 text-xs text-secondary hover:underline self-start font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to all playlists</span>
          </button>

          {/* Playlist Detail Header */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-lg">
            <div className="w-28 h-28 rounded-xl overflow-hidden shadow-md shrink-0 mx-auto sm:mx-0 bg-surface-container-highest">
              <img
                src={selectedPlaylist.coverUrl}
                alt={selectedPlaylist.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
                  {selectedPlaylist.mood}
                </span>
                <h3 className="text-xl font-bold text-on-surface">{selectedPlaylist.title}</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {selectedPlaylist.description}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                {selectedPlaylist.tracks.length > 0 && (
                  <button
                    onClick={() => playTrack(selectedPlaylist.tracks[0])}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-surface-container-lowest font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                    <span>Play All</span>
                  </button>
                )}
                <span className="text-xs text-outline">
                  {selectedPlaylist.tracks.length} Tracks • {selectedPlaylist.durationFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Track List */}
          {selectedPlaylist.tracks.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-surface-container-high/40">
              <p className="text-sm font-semibold text-on-surface">This playlist is empty</p>
              <p className="text-xs text-outline mt-1">Add tracks to this playlist from player or search</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-surface-container-high/60 bg-surface-container-low rounded-2xl p-2 border border-surface-container-high/40">
              {selectedPlaylist.tracks.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-outline w-5 text-center">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="truncate min-w-0">
                      <p className="font-label-lg text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-outline">{track.durationFormatted}</span>
                    <button
                      className="w-8 h-8 rounded-lg bg-surface-container-high group-hover:bg-primary group-hover:text-on-primary text-on-surface flex items-center justify-center transition-colors"
                      title="Play"
                    >
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'favorites' ? (
        /* Liked Songs Tab View */
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-outline">
              Your Liked Songs ({favoriteTracks.length})
            </span>
          </div>

          {favoriteTracks.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-surface-container-high/40">
              <span className="material-symbols-outlined text-outline text-4xl mb-2">favorite_border</span>
              <p className="text-sm font-semibold text-on-surface">No liked songs yet</p>
              <p className="text-xs text-outline mt-1">Heart songs while listening to add them here</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-surface-container-high/60 bg-surface-container-low rounded-2xl p-2 border border-surface-container-high/40 shadow-md">
              {favoriteTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
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
                    <div className="truncate min-w-0">
                      <p className="font-label-lg text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="material-symbols-outlined text-tertiary-container text-lg">
                      favorite
                    </span>
                    <span className="font-mono text-xs text-outline">{track.durationFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Playlists Grid (Landscape 3 columns / Portrait 1-2 columns) */
        <div className="mt-4 flex flex-col gap-4">
          {isLoadingPlaylists ? (
            <div
              className={`grid gap-4 ${
                isLandscape ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 flex flex-col gap-3 animate-pulse">
                  <div className="aspect-video w-full rounded-xl bg-surface-container-high" />
                  <div className="w-32 h-4 bg-surface-container-high rounded" />
                  <div className="w-20 h-3 bg-surface-container-high rounded" />
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-surface-container-high/40 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-outline text-4xl">queue_music</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">No playlists found</p>
                <p className="text-xs text-outline mt-1">Create your first playlist using the button above</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-bold text-xs shadow-md active:scale-95 transition-transform"
              >
                + Create Playlist
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                isLandscape ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 hover:border-primary/40 shadow-md transition-all hover:scale-101 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 shadow-md bg-surface-container-highest">
                      <img
                        src={playlist.coverUrl}
                        alt={playlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                          {playlist.mood}
                        </span>
                        {playlist.tracks.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrack(playlist.tracks[0]);
                            }}
                            className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform"
                            title="Play"
                          >
                            <span
                              className="material-symbols-outlined text-[20px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              play_arrow
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="font-headline-sm text-base font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                      {playlist.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-surface-container-high/40 text-xs text-outline">
                    <span>{playlist.trackCount} Tracks</span>
                    <span>{playlist.durationFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-surface-container-low border border-surface-container-high p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <h3 className="text-base font-bold text-on-surface">Create New Playlist</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
              <label className="text-xs text-outline">Playlist Name</label>
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="e.g. Midnight Highway Odyssey"
                autoFocus
                className="w-full bg-surface-container px-3.5 py-2.5 rounded-xl border border-surface-container-highest text-sm text-on-surface focus:outline-none focus:border-primary"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
