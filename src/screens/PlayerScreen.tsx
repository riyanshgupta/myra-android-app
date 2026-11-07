import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/music';

export const PlayerScreen: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progressPercent,
    formattedCurrentTime,
    formattedRemainingTime,
    isShuffle,
    isRepeat,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    replay10,
    forward10,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    likedTracks,
    toggleLike,
    isLandscape,
    setActiveScreen,
    setIsLyricsOpen,
    setIsQueueOpen,
    openAddToPlaylistModal,
    queue,
    isLoadingTrending,
  } = usePlayer();

  const [isCrossfadeActive, setIsCrossfadeActive] = useState<boolean>(true);
  const [isAutoSkipActive, setIsAutoSkipActive] = useState<boolean>(true);
  const [deviceModalOpen, setDeviceModalOpen] = useState<boolean>(false);
  const [currentDevice, setCurrentDevice] = useState<string>('AirPods Pro • Connected');

  if (!currentTrack) {
    return (
      <div className="w-full h-[calc(100dvh-64px)] flex items-center justify-center p-6 text-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high animate-pulse flex items-center justify-center border border-surface-container-highest">
            <span className="material-symbols-outlined text-primary text-2xl animate-spin">graphic_eq</span>
          </div>
          <p className="text-sm font-bold text-on-surface">
            {isLoadingTrending ? 'Loading Live Catalog from API...' : 'No Track Playing'}
          </p>
          <p className="text-xs text-outline">Select a track from Home or Search to start playback</p>
        </div>
      </div>
    );
  }

  const isLiked = (currentTrack && currentTrack.id && likedTracks[currentTrack.id]) || false;
  const safeQueue = (queue || []).filter((t): t is Track => Boolean(t && t.id));

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * currentTrack.duration);
  };

  // =========================================================================
  // LANDSCAPE WIDE / TABLET VIEW (STRICTLY NON-SCROLLABLE 100vh)
  // =========================================================================
  if (isLandscape) {
    return (
      <div className="w-full h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden px-4 md:px-6 py-2 select-none flex flex-col justify-between">
        <div className="grid grid-cols-12 gap-4 items-stretch h-full max-h-full overflow-hidden">
          {/* ==================== LEFT COLUMN: CURRENT SONG (58%) ==================== */}
          <section className="col-span-12 lg:col-span-7 flex flex-col justify-between bg-surface-container-low border border-surface-container-high/40 p-4 rounded-2xl shadow-xl relative overflow-hidden h-full max-h-full">
            {/* Ambient subtle background glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Telemetry Micro Strip */}
            <div className="flex items-center justify-between pb-1 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary font-label-sm text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Now Playing
                </span>
                <span className="text-on-surface-variant font-label-sm text-[11px] font-medium truncate max-w-[220px]">
                  {currentTrack.genre} • {currentTrack.bpm || 120} BPM
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-secondary font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span>Dolby Atmos</span>
              </div>
            </div>

            {/* Hero Song Card: Artwork beside Song Info */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-surface-container/60 p-3 rounded-xl border border-surface-container-high/50 relative z-10 overflow-hidden my-1">
              {/* Artwork with Realtime Visualizer */}
              <div className="md:col-span-5 relative aspect-square max-h-[170px] lg:max-h-[190px] w-full rounded-xl overflow-hidden shadow-lg group mx-auto shrink-0 bg-surface-container-highest">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[9px] uppercase tracking-wider font-extrabold shadow">
                    Popular
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-dim/80 backdrop-blur-md text-secondary font-label-sm text-[9px] uppercase tracking-wider font-bold">
                    Spatial
                  </span>
                </div>

                {/* Waveform Frequency Bars */}
                <div className="absolute bottom-1 left-1.5 right-1.5 flex items-end justify-between h-6 px-2 bg-surface-container-lowest/80 backdrop-blur-md rounded-lg py-0.5">
                  {[4, 7, 3, 6, 8, 5, 8, 4, 7, 5].map((val, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full ${i % 2 === 0 ? 'bg-secondary' : 'bg-primary'} ${
                        isPlaying ? 'animate-bounce' : 'h-1.5'
                      }`}
                      style={{
                        height: isPlaying ? `${val * 2}px` : '4px',
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Song Info Beside Artwork */}
              <div className="md:col-span-7 flex flex-col justify-center gap-1.5 min-w-0">
                <div>
                  <span className="font-label-sm text-[10px] text-secondary tracking-widest uppercase font-semibold">
                    Current Song
                  </span>
                  <h1 className="font-headline-lg text-lg lg:text-xl font-extrabold text-on-surface tracking-tight leading-tight truncate">
                    {currentTrack.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-headline-sm text-sm text-primary font-bold truncate">
                      {currentTrack.artist}
                    </span>
                    <span
                      className="material-symbols-outlined text-secondary text-[16px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant truncate mt-0.5">
                    Album: {currentTrack.album}
                  </p>
                </div>

                {/* Add to Playlist & Lyrics Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openAddToPlaylistModal(currentTrack)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-primary-container/20 border border-primary/30 text-primary font-label-md text-[11px] font-bold hover:bg-primary-container/30 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[15px]">playlist_add</span>
                    <span>Add to Playlist</span>
                  </button>
                  <button
                    onClick={() => setIsLyricsOpen(true)}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-surface-container-high border border-surface-container-highest text-on-surface font-label-md text-[11px] font-medium hover:bg-surface-bright transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-secondary text-[14px]">lyrics</span>
                    <span>Lyrics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tactile Scrubber & Time Stamp Module */}
            <div className="flex flex-col gap-1 my-1 relative z-10 shrink-0">
              <div
                onClick={handleScrubberClick}
                className="relative w-full py-1.5 cursor-pointer group"
              >
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-primary-container via-primary to-secondary rounded-full shadow-[0_0_10px_rgba(76,215,246,0.7)] transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-surface-bright shadow-[0_0_10px_rgba(208,188,255,0.9)] border-2 border-primary flex items-center justify-center pointer-events-none"
                  style={{ left: `${progressPercent}%` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-label-md text-on-surface-variant font-semibold px-0.5">
                <span className="text-on-surface font-mono">{formattedCurrentTime}</span>
                <span className="font-mono text-outline">{currentTrack.durationFormatted}</span>
              </div>
            </div>

            {/* Primary Large Touch Playback Controls Row */}
            <div className="flex flex-col gap-2 relative z-10 shrink-0">
              <div className="flex items-center justify-between gap-3 px-1">
                {/* Shuffle */}
                <button
                  onClick={toggleShuffle}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow cursor-pointer ${
                    isShuffle
                      ? 'bg-surface-container-highest text-secondary border border-secondary/40'
                      : 'bg-surface-container text-outline hover:text-on-surface'
                  }`}
                  aria-label="Shuffle"
                >
                  <span className="material-symbols-outlined text-[20px]">shuffle</span>
                </button>

                {/* Previous */}
                <button
                  onClick={prevTrack}
                  className="w-13 h-13 rounded-2xl bg-surface-container-high hover:bg-surface-bright active:scale-90 flex items-center justify-center text-on-surface shadow transition-all cursor-pointer"
                  aria-label="Previous Track"
                >
                  <span
                    className="material-symbols-outlined text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    skip_previous
                  </span>
                </button>

                {/* Grand Center Trigger */}
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-primary-container via-primary to-secondary text-on-primary-container shadow-[0_0_24px_rgba(160,120,255,0.55)] hover:brightness-110 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <span
                    className="material-symbols-outlined text-[36px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Next */}
                <button
                  onClick={nextTrack}
                  className="w-13 h-13 rounded-2xl bg-surface-container-high hover:bg-surface-bright active:scale-90 flex items-center justify-center text-on-surface shadow transition-all cursor-pointer"
                  aria-label="Next Track"
                >
                  <span
                    className="material-symbols-outlined text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    skip_next
                  </span>
                </button>

                {/* Repeat */}
                <button
                  onClick={toggleRepeat}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow cursor-pointer ${
                    isRepeat
                      ? 'bg-surface-container-highest text-secondary border border-secondary/40'
                      : 'bg-surface-container text-outline hover:text-on-surface'
                  }`}
                  aria-label="Repeat Mode"
                >
                  <span className="material-symbols-outlined text-[20px]">repeat</span>
                </button>
              </div>

              {/* Secondary Glanceable Bar */}
              <div className="grid grid-cols-4 gap-2 pt-0.5">
                <button
                  onClick={() => toggleLike(currentTrack.id)}
                  className="h-10 rounded-xl bg-surface-container border border-surface-container-high/40 flex items-center justify-center gap-1.5 hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isLiked ? 'text-tertiary-container' : 'text-outline'
                    }`}
                    style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  <span className="text-[11px] text-tertiary font-bold">12.4k</span>
                </button>

                {/* Direct Add to Playlist button */}
                <button
                  onClick={() => openAddToPlaylistModal(currentTrack)}
                  className="h-10 rounded-xl bg-surface-container border border-surface-container-high/40 flex items-center justify-center gap-1.5 text-on-surface hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                  title="Add to Playlist"
                >
                  <span className="material-symbols-outlined text-secondary text-[18px]">playlist_add</span>
                  <span className="text-[11px] text-on-surface font-semibold truncate">Add to Playlist</span>
                </button>

                <button
                  onClick={replay10}
                  className="h-10 rounded-xl bg-surface-container border border-surface-container-high/40 flex items-center justify-center gap-1 text-on-surface hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-outline text-[18px]">replay_10</span>
                  <span className="text-[11px] text-outline font-medium">-10s</span>
                </button>

                <button
                  onClick={forward10}
                  className="h-10 rounded-xl bg-surface-container border border-surface-container-high/40 flex items-center justify-center gap-1 text-on-surface hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-outline text-[18px]">forward_10</span>
                  <span className="text-[11px] text-outline font-medium">+10s</span>
                </button>
              </div>
            </div>
          </section>

          {/* ==================== RIGHT COLUMN: MYRA AI & UP NEXT QUEUE (42%) ==================== */}
          <section className="col-span-12 lg:col-span-5 flex flex-col justify-between gap-3 h-full max-h-full overflow-hidden">
            {/* Myra AI Assistant Card */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/40 shadow-xl flex flex-col gap-2.5 relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-full bg-secondary opacity-40 animate-ping" />
                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-[0_0_12px_rgba(76,215,246,0.9)]">
                      <span className="material-symbols-outlined text-surface-dim text-[16px]">auto_awesome</span>
                    </span>
                  </div>
                  <div>
                    <span className="font-headline-sm text-sm text-on-surface font-extrabold leading-none">
                      Myra Voice Assistant
                    </span>
                    <p className="text-[10px] text-secondary font-medium mt-0.5">
                      Say "Hey Myra" anytime or tap below
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest border border-secondary/30 text-secondary text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Tap-To-Speak Button */}
              <button
                onClick={() => setActiveScreen('myra-ai')}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-surface-container to-surface-container-high hover:from-surface-container-high hover:to-surface-bright text-on-surface flex items-center justify-center gap-3 border border-secondary/20 active:scale-98 transition-all shadow cursor-pointer px-3"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow shrink-0">
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="font-label-lg text-xs font-extrabold text-on-surface">
                    Ask Myra
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate">
                    "Play synthwave" • "Queue chill tracks"
                  </span>
                </div>
              </button>
            </div>

            {/* Up Next Queue Card (Scrollable only in this section as requested) */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/40 shadow-xl flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-1.5 border-b border-surface-container-high/50 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">queue_music</span>
                  <span className="font-headline-sm text-xs text-on-surface font-extrabold">
                    Up Next In Queue
                  </span>
                </div>
                <span className="text-[10px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {safeQueue.length} Upcoming
                </span>
              </div>

              {/* Scrollable queue track list only */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 py-1.5 pr-1.5 custom-scrollbar touch-pan-y">
                {safeQueue.map((qTrack, idx) => (
                  <div
                    key={`${qTrack.id}-${idx}`}
                    onClick={() => playTrack(qTrack)}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-container border border-surface-container-high hover:border-secondary/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest overflow-hidden shrink-0 shadow">
                        <img
                          src={qTrack.coverUrl}
                          alt={qTrack.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-xs text-on-surface font-bold truncate">
                          {qTrack.title}
                        </span>
                        <span className="text-[10px] text-secondary truncate">
                          {qTrack.artist}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-outline font-semibold">
                        {qTrack.durationFormatted}
                      </span>
                      <button
                        className="w-6 h-6 rounded-md bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-on-surface flex items-center justify-center transition-colors"
                        aria-label="Play Track"
                      >
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Full Queue Button */}
              <button
                onClick={() => setIsQueueOpen(true)}
                className="w-full flex items-center justify-center gap-1 text-xs text-secondary hover:text-primary transition-colors font-bold py-1.5 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 shrink-0 mt-1 cursor-pointer"
              >
                <span>Manage Queue ({safeQueue.length} Tracks)</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PORTRAIT MOBILE VIEW (STRICTLY NON-SCROLLABLE 100vh / 100dvh SINGLE SCREEN)
  // =========================================================================
  return (
    <div className="w-full h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden px-4 py-1.5 max-w-md mx-auto select-none flex flex-col justify-between">
      {/* Dynamic Ambient Glow Overlays */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[90px] -z-10" />
      <div className="pointer-events-none absolute top-48 right-0 w-[200px] h-[200px] bg-secondary/15 rounded-full blur-[70px] -z-10" />

      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <button
          onClick={() => setActiveScreen('home')}
          className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/40 transition-colors cursor-pointer"
          aria-label="Dismiss player"
        >
          <span className="material-symbols-outlined text-[24px]">keyboard_arrow_down</span>
        </button>

        <div className="flex flex-col items-center justify-center flex-1 px-2 text-center truncate">
          <span className="font-label-sm text-[9px] uppercase tracking-wider text-secondary font-bold">
            Playing from Library
          </span>
          <span className="font-headline-sm text-xs font-bold text-on-surface truncate max-w-[180px]">
            {currentTrack.album}
          </span>
        </div>

        <button
          onClick={() => setActiveScreen('myra-ai')}
          className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center shadow-sm cursor-pointer"
          aria-label="Voice Copilot"
          title="Open Voice AI"
        >
          <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
        </button>
      </div>

      {/* 2. Audio Route Badges */}
      <div className="flex items-center justify-between py-1 shrink-0">
        <button
          onClick={() => setDeviceModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/80 shadow-sm border border-surface-container-highest/40 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-[9px] text-secondary uppercase tracking-wider font-semibold truncate max-w-[150px]">
            {currentDevice}
          </span>
        </button>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low shadow-sm border border-surface-container-high/40">
          <span className="material-symbols-outlined text-[12px] text-primary">spatial_audio</span>
          <span className="font-label-sm text-[9px] text-primary uppercase tracking-wide font-semibold">
            Spatial Audio
          </span>
        </div>
      </div>

      {/* 3. Hero Artwork Section */}
      <div className="flex-1 min-h-[140px] max-h-[280px] flex items-center justify-center my-1 relative">
        <div className="relative aspect-square h-full max-h-[260px] w-auto rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-surface-container-high/40 group">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />

          {/* Top Vignette with Audio Badges */}
          <div className="absolute inset-x-0 top-0 pt-2 px-2.5 pb-6 bg-gradient-to-b from-surface-container-lowest/80 to-transparent flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/70 backdrop-blur-md text-on-surface-variant font-label-sm text-[9px] tracking-wide font-semibold">
              Dolby Atmos
            </span>
          </div>

          {/* Waveform EQ Visualizer */}
          <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/40 to-transparent flex items-end justify-between gap-1 h-10">
            <div className="flex items-end gap-1 flex-1 h-5">
              {[4, 7, 3, 6, 2, 5, 7, 3, 5, 4, 6, 2, 7].map((val, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${i % 2 === 0 ? 'bg-secondary' : 'bg-primary'} ${
                    isPlaying ? (i % 2 === 0 ? 'animate-pulse' : 'animate-bounce') : 'h-1'
                  }`}
                  style={{
                    height: isPlaying ? `${val * 2.5}px` : '3px',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
            <span className="font-label-sm text-[8px] text-secondary uppercase tracking-widest pl-1 font-bold">
              Spatial Audio
            </span>
          </div>
        </div>
      </div>

      {/* 4. Track Metadata & Action Buttons */}
      <div className="flex items-center justify-between gap-2 py-1 shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="font-headline-lg text-lg sm:text-xl font-bold text-on-surface truncate">
            {currentTrack.title}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-body-md text-xs text-primary font-medium truncate">
              {currentTrack.artist}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0" />
            <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
              {currentTrack.album}
            </span>
          </div>
        </div>

        {/* Action Buttons: Add to Playlist + Like */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => openAddToPlaylistModal(currentTrack)}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shadow active:scale-95 transition-transform cursor-pointer"
            aria-label="Add to Playlist"
            title="Add to Playlist"
          >
            <span className="material-symbols-outlined text-[20px]">playlist_add</span>
          </button>

          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary shadow active:scale-95 transition-transform cursor-pointer"
            aria-label="Like track"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                isLiked ? 'text-tertiary-container' : 'text-outline'
              }`}
              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* 5. Progress Scrubber Section */}
      <div className="flex flex-col gap-1 py-1 shrink-0">
        <div
          onClick={handleScrubberClick}
          className="relative w-full h-3.5 flex items-center cursor-pointer group"
          id="scrubber-bar"
        >
          <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
            <div className="w-3/4 h-full bg-surface-container-highest" />
          </div>
          <div
            className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-secondary to-primary pointer-events-none transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-on-surface shadow-[0_0_10px_rgba(208,188,255,0.8)] border-0 ring-0 group-hover:scale-125 transition-transform pointer-events-none flex items-center justify-center"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-1 h-1 rounded-full bg-background" />
          </div>
        </div>

        <div className="flex items-center justify-between font-label-md text-[11px] text-on-surface-variant">
          <span>{formattedCurrentTime}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAutoSkipActive(!isAutoSkipActive)}
              className={`px-1.5 py-0.5 rounded font-label-sm text-[8px] uppercase tracking-wider ${
                isAutoSkipActive ? 'bg-surface-container text-secondary font-bold' : 'bg-surface-container/40 text-outline'
              }`}
            >
              AUTO-SKIP
            </button>
            <button
              onClick={() => setIsCrossfadeActive(!isCrossfadeActive)}
              className={`px-1.5 py-0.5 rounded font-label-sm text-[8px] uppercase tracking-wider ${
                isCrossfadeActive ? 'bg-surface-container text-secondary font-bold' : 'bg-surface-container/40 text-outline'
              }`}
            >
              CROSSFADE 4S
            </button>
          </div>
          <span>{formattedRemainingTime}</span>
        </div>
      </div>

      {/* 6. Aux Buttons */}
      <div className="flex items-center justify-between text-on-surface-variant py-1 shrink-0">
        <button
          onClick={() => setIsLyricsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">lyrics</span>
          <span className="font-label-md text-xs font-semibold">Lyrics</span>
        </button>

        <button
          onClick={() => setIsQueueOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface hover:text-primary transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">queue_music</span>
          <span className="font-label-md text-xs font-bold">Queue ({queue.length})</span>
        </button>

        <button
          onClick={() => openAddToPlaylistModal(currentTrack)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
          title="Add to Playlist"
        >
          <span className="material-symbols-outlined text-[16px]">playlist_add</span>
          <span className="font-label-md text-xs font-medium">Add</span>
        </button>

        <button
          onClick={() => setDeviceModalOpen(true)}
          className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
          title="Audio Output Device"
        >
          <span className="material-symbols-outlined text-[16px]">devices</span>
        </button>
      </div>

      {/* 7. Tactile Playback Deck */}
      <div className="flex items-center justify-between py-1 shrink-0">
        <button
          onClick={toggleShuffle}
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center hover:bg-surface-container transition-colors relative cursor-pointer ${
            isShuffle ? 'text-secondary' : 'text-outline'
          }`}
          aria-label="Shuffle"
        >
          <span className="material-symbols-outlined text-[20px]">shuffle</span>
          {isShuffle && <span className="w-1 h-1 rounded-full bg-secondary mt-0.5" />}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={replay10}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Rewind 10 seconds"
          >
            <span className="material-symbols-outlined text-[18px]">replay_10</span>
          </button>
          <button
            onClick={prevTrack}
            className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-90 cursor-pointer"
            aria-label="Previous track"
          >
            <span className="material-symbols-outlined text-[28px]">skip_previous</span>
          </button>
        </div>

        <button
          onClick={togglePlay}
          className="w-15 h-15 rounded-full bg-gradient-to-tr from-primary to-secondary text-surface-container-lowest flex items-center justify-center shadow-[0_4px_20px_rgba(76,215,246,0.4)] active:scale-95 transition-transform cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <span
            className="material-symbols-outlined text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={nextTrack}
            className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-90 cursor-pointer"
            aria-label="Next track"
          >
            <span className="material-symbols-outlined text-[28px]">skip_next</span>
          </button>
          <button
            onClick={forward10}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Forward 10 seconds"
          >
            <span className="material-symbols-outlined text-[18px]">forward_10</span>
          </button>
        </div>

        <button
          onClick={toggleRepeat}
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center hover:bg-surface-container transition-colors cursor-pointer ${
            isRepeat ? 'text-secondary' : 'text-outline'
          }`}
          aria-label="Repeat"
        >
          <span className="material-symbols-outlined text-[20px]">repeat</span>
        </button>
      </div>

      {/* Device Picker Modal */}
      {deviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm rounded-3xl bg-surface-container-low border border-surface-container-high p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <span className="text-sm font-bold text-on-surface">Listening On</span>
              <button
                onClick={() => setDeviceModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            {[
              { name: 'AirPods Pro • Connected', icon: 'headphones', badge: 'Active Audio' },
              { name: 'Living Room Speaker', icon: 'speaker', badge: 'AirPlay / Cast' },
              { name: 'Phone Speaker', icon: 'smartphone', badge: 'Device' },
            ].map((d) => (
              <button
                key={d.name}
                onClick={() => {
                  setCurrentDevice(d.name);
                  setDeviceModalOpen(false);
                }}
                className={`p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                  currentDevice === d.name
                    ? 'bg-primary-container/20 border border-primary/40 text-primary'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg">{d.icon}</span>
                  <div>
                    <p className="text-xs font-bold">{d.name}</p>
                    <p className="text-[10px] text-outline">{d.badge}</p>
                  </div>
                </div>
                {currentDevice === d.name && (
                  <span className="material-symbols-outlined text-secondary text-base">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
