import React from 'react';
import { usePlayer } from '../context/PlayerContext';

const MOOD_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'auto_awesome' },
  { id: 'chill', name: 'Chill Drive', icon: 'directions_car' },
  { id: 'focus', name: 'Focus', icon: 'psychology' },
  { id: 'energy', name: 'High Energy', icon: 'bolt' },
  { id: 'night', name: 'Night Pulse', icon: 'nightlife' },
  { id: 'synth', name: 'Synthwave', icon: 'equalizer' },
];

export const HomeScreen: React.FC = () => {
  const {
    playTrack,
    activeMood,
    setActiveMood,
    executeVoiceCommand,
    isLandscape,
    setActiveScreen,
    currentUser,
    setIsAuthModalOpen,
    trendingTracks,
    isLoadingTrending,
    queue,
  } = usePlayer();

  const recentlyPlayed = queue.slice(0, 4);
  const curatedTracks = trendingTracks.length > 3 ? trendingTracks.slice(0, 3) : trendingTracks;
  const heroTrack = trendingTracks[0] || null;

  const userName = currentUser ? currentUser.username : 'User';

  return (
    <div className={`w-full ${isLandscape ? 'max-w-[1920px] mx-auto px-6 py-6 pb-28' : 'px-4 pb-36 pt-2 max-w-md mx-auto select-none'}`}>
      {/* Greeting Section */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-2xl font-bold text-on-surface">
              Good evening{currentUser ? `, ${userName}` : ''}
            </h2>
            <span
              className="material-symbols-outlined text-secondary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-xs text-secondary font-semibold transition-all border border-secondary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">account_circle</span>
            <span>{currentUser ? currentUser.username : 'Sign In'}</span>
          </button>
        </div>

        {/* Mood Filters Carousel */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {MOOD_CATEGORIES.map((m) => {
            const isActive = activeMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMood(m.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-xs shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-semibold shadow-[0_2px_12px_rgba(160,120,255,0.35)] scale-105'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid container for Landscape / Flex for Portrait */}
      <div className={`mt-4 ${isLandscape ? 'grid grid-cols-12 gap-6 items-start' : 'flex flex-col gap-5'}`}>
        {/* Left Column in Landscape / Top item in Portrait: Myra Audio Copilot */}
        <div className={isLandscape ? 'col-span-12 lg:col-span-5 flex flex-col gap-5' : 'flex flex-col gap-5'}>
          {/* Hey Myra AI Floating Banner */}
          <section className="relative overflow-hidden rounded-2xl bg-surface-container p-4 shadow-lg shadow-black/40 border border-surface-container-high/50">
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-primary-container/20 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">
                      graphic_eq
                    </span>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-sm font-bold text-on-surface">
                        Myra Voice Assistant
                      </span>
                      <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                        "Hey Myra"
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Say "Hey Myra" or tap to speak
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveScreen('myra-ai')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-xs font-semibold shadow-[0_0_16px_rgba(160,120,255,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                  <span>Ask Myra</span>
                </button>
              </div>

              {/* Live Voice Equalizer Visualizer Strip */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-lowest/70 border border-surface-container-high/40">
                <div className="flex items-end gap-1 h-4">
                  <span className="w-1 bg-secondary rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 bg-secondary-fixed-dim rounded-full animate-bounce h-4" style={{ animationDelay: '0.25s' }} />
                  <span className="w-1 bg-primary rounded-full animate-bounce h-3" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 bg-primary-container rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 bg-secondary rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.05s' }} />
                </div>
                <span className="font-label-sm text-xs text-on-surface-variant truncate mx-2">
                  "Tuned for late night calm driving tempo"
                </span>
                <span className="material-symbols-outlined text-outline text-[16px]">tune</span>
              </div>

              {/* Quick Context Prompt Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  'Play synthwave for highway cruising',
                  'Match BPM to night pulse',
                  'Queue chill vocalists',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => executeVoiceCommand(prompt)}
                    className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface text-[11px] font-medium whitespace-nowrap active:scale-95 transition-transform"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Curated by Myra AI Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-base font-bold text-on-surface">
                  Curated by Myra AI
                </span>
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant">For you</span>
            </div>

            {/* Recommendations Track List with Skeleton Loading */}
            {isLoadingTrending ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-surface-container-high/40 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest shrink-0" />
                      <div className="flex flex-col gap-2">
                        <div className="w-32 h-3.5 bg-surface-container-highest rounded" />
                        <div className="w-20 h-3 bg-surface-container-highest rounded" />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
                  </div>
                ))}
              </div>
            ) : curatedTracks.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high text-center">
                <p className="text-xs text-on-surface-variant">No curated tracks received from API backend.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {curatedTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group border border-transparent hover:border-surface-container-highest"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm bg-surface-container-highest">
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
                        <p className="font-body-sm text-xs text-on-surface-variant truncate">
                          {track.artist} • {track.durationFormatted}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => playTrack(track)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                        title="Play"
                      >
                        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                      </button>
                      <button
                        onClick={() => setActiveScreen('player')}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                        title="Player View"
                      >
                        <span className="material-symbols-outlined text-[20px]">queue_music</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column in Landscape / Below in Portrait: Recently Played */}
        <div className={isLandscape ? 'col-span-12 lg:col-span-7 flex flex-col gap-5' : 'flex flex-col gap-5'}>
          {/* Recently Played */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-base font-bold text-on-surface">
                  Recently Played
                </span>
                <span className="material-symbols-outlined text-outline text-[18px]">history</span>
              </div>
              <button
                onClick={() => setActiveScreen('playlists')}
                className="font-label-md text-xs text-primary hover:underline font-semibold"
              >
                See all
              </button>
            </div>

            {/* Shelf (Skeleton vs Live API Tracks) */}
            {isLoadingTrending ? (
              <div
                className={
                  isLandscape
                    ? 'grid grid-cols-2 md:grid-cols-4 gap-4'
                    : 'flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-1'
                }
              >
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className={`flex flex-col gap-2 ${isLandscape ? 'w-full' : 'w-36 shrink-0'} animate-pulse`}>
                    <div className="aspect-square w-full rounded-xl bg-surface-container-high" />
                    <div className="w-24 h-3 bg-surface-container-high rounded" />
                    <div className="w-16 h-2.5 bg-surface-container-high rounded" />
                  </div>
                ))}
              </div>
            ) : recentlyPlayed.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high text-center">
                <p className="text-xs text-on-surface-variant">No recently played tracks in queue.</p>
              </div>
            ) : (
              <div
                className={
                  isLandscape
                    ? 'grid grid-cols-2 md:grid-cols-4 gap-4'
                    : 'flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-1'
                }
              >
                {recentlyPlayed.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex flex-col gap-2 group cursor-pointer ${isLandscape ? 'w-full' : 'w-36 shrink-0'}`}
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-container-high shadow-md">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_arrow
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Featured Album Hero Card in Landscape */}
          {isLandscape && (
            isLoadingTrending ? (
              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-surface-container-high" />
                  <div className="flex flex-col gap-2">
                    <div className="w-24 h-3 bg-surface-container-high rounded" />
                    <div className="w-40 h-4 bg-surface-container-high rounded" />
                    <div className="w-32 h-3 bg-surface-container-high rounded" />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-surface-container-high" />
              </div>
            ) : heroTrack ? (
              <div
                onClick={() => setActiveScreen('player')}
                className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex items-center justify-between cursor-pointer group hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg shrink-0">
                    <img
                      src={heroTrack.coverUrl}
                      alt={heroTrack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">
                      Trending Release
                    </span>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {heroTrack.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {heroTrack.artist} • {heroTrack.album}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-bold">
                        Dolby Atmos
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-bold">
                        Spatial Audio
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(heroTrack);
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-surface-container-lowest flex items-center justify-center shadow-[0_0_16px_rgba(76,215,246,0.5)] group-hover:scale-105 transition-transform shrink-0"
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};
