import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track, Playlist, SearchHistoryItem, ScreenType, OrientationMode } from '../types/music';
import { audioEngine } from '../utils/audioEngine';
import { wakeWordListener } from '../utils/wakeWordListener';
import {
  getTrendingApi,
  getFavoritesApi,
  addFavoriteTrackApi,
  removeFavoriteTrackApi,
  getPlaylistsApi,
  createPlaylistApi,
  addPlaylistTrackApi,
  removePlaylistTrackApi,
  updatePlayerStateApi,
  getTrackStreamApi,
  getCurrentUserApi,
  getStoredToken,
  getAuthToken,
  removeStoredToken,
  UserResp,
} from '../services/api';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progressPercent: number;
  formattedCurrentTime: string;
  formattedRemainingTime: string;
  isShuffle: boolean;
  isRepeat: boolean;
  volume: number;
  likedTracks: Record<string, boolean>;
  queue: Track[];
  trendingTracks: Track[];
  isLoadingTrending: boolean;
  isLoadingPlaylists: boolean;
  activeScreen: ScreenType;
  orientationMode: OrientationMode;
  isLandscape: boolean;
  isVoiceAiOpen: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  isAddToPlaylistOpen: boolean;
  isAuthModalOpen: boolean;
  currentUser: UserResp | null;
  targetTrackForPlaylist: Track | null;
  searchQuery: string;
  searchHistory: SearchHistoryItem[];
  activeMood: string;
  playlists: Playlist[];
  isWakeWordActive: boolean;
  wakeWordToast: string | null;
  togglePlay: () => void;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  replay10: () => void;
  forward10: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (val: number) => void;
  toggleLike: (trackId: string) => void;
  setActiveScreen: (screen: ScreenType) => void;
  setOrientationMode: (mode: OrientationMode) => void;
  setIsVoiceAiOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsAddToPlaylistOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  openAddToPlaylistModal: (track?: Track) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  createPlaylist: (title: string, description?: string, initialTrackId?: string) => Promise<Playlist>;
  setSearchQuery: (query: string) => void;
  addSearchHistory: (query: string, category?: SearchHistoryItem['category']) => void;
  removeSearchHistory: (id: string) => void;
  clearSearchHistory: () => void;
  setActiveMood: (moodId: string) => void;
  executeVoiceCommand: (cmd: string) => void;
  toggleWakeWord: () => boolean;
  requestWakeWordPermission: () => Promise<boolean>;
  triggerSimulatedWakeWord: (phrase?: string) => void;
  dismissWakeWordToast: () => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [isShuffle, setIsShuffle] = useState<boolean>(true);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.85);

  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});

  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(true);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);

  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [orientationMode, setOrientationMode] = useState<OrientationMode>('auto');
  const [windowIsLandscape, setWindowIsLandscape] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true
  );

  const [isVoiceAiOpen, setIsVoiceAiOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserResp | null>(null);

  const [targetTrackForPlaylist, setTargetTrackForPlaylist] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [activeMood, setActiveMood] = useState<string>('night-drive');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Wake Word "Hey Myra" State
  const [isWakeWordActive, setIsWakeWordActive] = useState<boolean>(true);
  const [wakeWordToast, setWakeWordToast] = useState<string | null>(null);

  // Fetch initial backend data (User, Trending, Favorites, Playlists)
  const refreshUser = async () => {
    const token = getStoredToken();
    if (token) {
      const user = await getCurrentUserApi();
      if (user) {
        setCurrentUser(user);
      }
    }
  };

  useEffect(() => {
    const loadBackendData = async () => {
      setIsLoadingTrending(true);
      setIsLoadingPlaylists(true);

      const token = getAuthToken();

      // 1. Check user token if present
      if (token) {
        await refreshUser();
      }

      // 2. Fetch trending tracks from API (public)
      try {
        const apiTrending = await getTrendingApi();
        if (apiTrending && apiTrending.length > 0) {
          setTrendingTracks(apiTrending);
          setQueue(apiTrending);
          setCurrentTrack(apiTrending[0]);
          setDuration(apiTrending[0].duration || 180);
        }
      } catch (err) {
        console.warn('Error fetching trending tracks:', err);
      } finally {
        setIsLoadingTrending(false);
      }

      // 3. Fetch favorites ONLY if authenticated
      if (token) {
        try {
          const favorites = await getFavoritesApi();
          if (favorites && favorites.length > 0) {
            const likedMap: Record<string, boolean> = {};
            favorites.forEach((t) => {
              likedMap[t.id] = true;
            });
            setLikedTracks((prev) => ({ ...prev, ...likedMap }));
          }
        } catch (err) {
          console.warn('Error fetching favorites:', err);
        }
      }

      // 4. Fetch playlists ONLY if authenticated
      if (token) {
        try {
          const apiPlaylists = await getPlaylistsApi();
          if (apiPlaylists && apiPlaylists.length > 0) {
            setPlaylists(apiPlaylists);
          }
        } catch (err) {
          console.warn('Error fetching playlists:', err);
        } finally {
          setIsLoadingPlaylists(false);
        }
      } else {
        setIsLoadingPlaylists(false);
      }
    };

    loadBackendData();
  }, []);

  const logout = () => {
    removeStoredToken();
    setCurrentUser(null);
  };

  // Pause wake-word listener when on MyraAiScreen so it doesn't conflict with mic
  useEffect(() => {
    if (activeScreen === 'myra-ai') {
      wakeWordListener.pause();
    } else {
      wakeWordListener.resume();
    }
  }, [activeScreen]);

  // Orientation listener
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const handleResize = () => {
      setWindowIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLandscape = orientationMode === 'landscape'
    ? true
    : orientationMode === 'portrait'
      ? false
      : windowIsLandscape;

  // Continuous Wake Word Listener ("Hey Myra")
  useEffect(() => {
    const unsubscribeWake = wakeWordListener.subscribe((detectedPhrase) => {
      setWakeWordToast(`"Hey Myra" detected! Opening Myra AI...`);
      setActiveScreen('myra-ai');

      setTimeout(() => {
        setWakeWordToast(null);
      }, 3500);
    });

    const unsubscribeStatus = wakeWordListener.subscribeStatus((listening, enabled) => {
      setIsWakeWordActive(enabled);
    });

    return () => {
      unsubscribeWake();
      unsubscribeStatus();
    };
  }, []);

  // Playback timer & audio engine sync
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying && currentTrack) {
      audioEngine.play();
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      audioEngine.pause();
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPlaying, duration, currentTrack]);

  const togglePlay = () => {
    if (!currentTrack) return;
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    updatePlayerStateApi({
      action: nextState ? 'play' : 'pause',
      track_id: currentTrack.id,
      position_ms: currentTime * 1000,
    });
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setDuration(track.duration || 180);
    setCurrentTime(0);
    setIsPlaying(true);

    // Sync player state with backend API
    updatePlayerStateApi({
      action: 'play',
      track_id: track.id,
      position_ms: 0,
    });

    // If stream encrypted URL exists, resolve real stream link from API
    if (track.encrypted_media_url) {
      try {
        const streamInfo = await getTrackStreamApi(track.encrypted_media_url);
        if (streamInfo && streamInfo.playback_url) {
          audioEngine.setAudioStreamUrl(streamInfo.playback_url);
        } else {
          console.warn('Backend stream API returned no valid playback_url');
          setIsPlaying(false);
          audioEngine.pause();
        }
      } catch (err) {
        console.warn('Error fetching stream URL from backend API:', err);
        setIsPlaying(false);
        audioEngine.pause();
      }
    }
  };

  const pauseTrack = () => {
    if (!currentTrack) return;
    setIsPlaying(false);
    updatePlayerStateApi({
      action: 'pause',
      track_id: currentTrack.id,
      position_ms: currentTime * 1000,
    });
  };

  const nextTrack = () => {
    const pool = queue.length > 0 ? queue : trendingTracks;
    if (pool.length === 0) return;
    const currentIndex = currentTrack ? pool.findIndex((t) => t.id === currentTrack.id) : -1;
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * pool.length);
      if (nextIndex === currentIndex && pool.length > 1) {
        nextIndex = (nextIndex + 1) % pool.length;
      }
    } else {
      nextIndex = (currentIndex + 1) % pool.length;
    }
    playTrack(pool[nextIndex] || pool[0]);
  };

  const prevTrack = () => {
    if (currentTime > 4) {
      setCurrentTime(0);
      return;
    }
    const pool = queue.length > 0 ? queue : trendingTracks;
    if (pool.length === 0) return;
    const currentIndex = currentTrack ? pool.findIndex((t) => t.id === currentTrack.id) : 0;
    const prevIndex = (currentIndex - 1 + pool.length) % pool.length;
    playTrack(pool[prevIndex] || pool[0]);
  };

  const seekTo = (seconds: number) => {
    if (!currentTrack) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(clamped);
    updatePlayerStateApi({
      action: isPlaying ? 'play' : 'pause',
      track_id: currentTrack.id,
      position_ms: clamped * 1000,
    });
  };

  const replay10 = () => {
    seekTo(currentTime - 10);
  };

  const forward10 = () => {
    seekTo(currentTime + 10);
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const toggleRepeat = () => {
    setIsRepeat((prev) => !prev);
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    audioEngine.setVolume(clamped);
  };

  const toggleLike = async (trackId: string) => {
    const currentlyLiked = !!likedTracks[trackId];
    setLikedTracks((prev) => ({
      ...prev,
      [trackId]: !currentlyLiked,
    }));

    if (currentlyLiked) {
      await removeFavoriteTrackApi(trackId);
    } else {
      await addFavoriteTrackApi(trackId);
    }
  };

  const openAddToPlaylistModal = (track?: Track) => {
    if (!track && !currentTrack) return;
    setTargetTrackForPlaylist(track || currentTrack);
    setIsAddToPlaylistOpen(true);
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    const pool = [...queue, ...trendingTracks];
    const targetTrack = pool.find((t) => t.id === trackId) || currentTrack;
    if (!targetTrack) return false;
    let added = false;

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.tracks.some((t) => t.id === trackId);
          if (exists) {
            return pl;
          }
          added = true;
          const updatedTracks = [...pl.tracks, targetTrack];
          return {
            ...pl,
            tracks: updatedTracks,
            trackCount: updatedTracks.length,
          };
        }
        return pl;
      })
    );

    await addPlaylistTrackApi(playlistId, trackId);
    return added;
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    let removed = false;
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const updatedTracks = pl.tracks.filter((t) => t.id !== trackId);
          removed = true;
          return {
            ...pl,
            tracks: updatedTracks,
            trackCount: updatedTracks.length,
          };
        }
        return pl;
      })
    );

    await removePlaylistTrackApi(playlistId, trackId);
    return removed;
  };

  const createPlaylist = async (
    title: string,
    description?: string,
    initialTrackId?: string
  ): Promise<Playlist> => {
    const pool = [...queue, ...trendingTracks];
    const initialTrack = initialTrackId
      ? pool.find((t) => t.id === initialTrackId) || currentTrack
      : currentTrack;

    const newId = `playlist-user-${Date.now()}`;
    const localPlaylist: Playlist = {
      id: newId,
      title: title.trim(),
      description: description?.trim() || 'Created in Myra Music',
      coverUrl: initialTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
      trackCount: initialTrack ? 1 : 0,
      durationFormatted: initialTrack ? initialTrack.durationFormatted : '0 tracks',
      mood: 'custom',
      tracks: initialTrack ? [initialTrack] : [],
      isCurated: false,
    };

    setPlaylists((prev) => [localPlaylist, ...prev]);

    const createdApiPlaylist = await createPlaylistApi({
      title: title.trim(),
      description: description?.trim(),
      tracks: initialTrack ? [initialTrack.id] : [],
    });

    if (createdApiPlaylist) {
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === newId ? createdApiPlaylist : pl))
      );
      return createdApiPlaylist;
    }

    return localPlaylist;
  };

  const addSearchHistory = (query: string, category: SearchHistoryItem['category'] = 'Track') => {
    if (!query.trim()) return;
    const newItem: SearchHistoryItem = {
      id: `sh-${Date.now()}`,
      query: query.trim(),
      category,
      timestamp: 'Just now',
    };
    setSearchHistory((prev) => [newItem, ...prev.filter((i) => i.query.toLowerCase() !== query.toLowerCase())]);
  };

  const removeSearchHistory = (id: string) => {
    setSearchHistory((prev) => prev.filter((i) => i.id !== id));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const toggleWakeWord = (): boolean => {
    const nextState = wakeWordListener.toggle();
    setIsWakeWordActive(nextState);
    return nextState;
  };

  const requestWakeWordPermission = async (): Promise<boolean> => {
    return await wakeWordListener.requestMicPermission();
  };

  const triggerSimulatedWakeWord = (phrase: string = 'Hey Myra') => {
    wakeWordListener.triggerWakeWordSimulated(phrase);
  };

  const dismissWakeWordToast = () => {
    setWakeWordToast(null);
  };

  const executeVoiceCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('play') || lower.includes('start')) {
      setIsPlaying(true);
    } else if (lower.includes('pause') || lower.includes('stop')) {
      setIsPlaying(false);
    } else if (lower.includes('next') || lower.includes('skip')) {
      nextTrack();
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formattedCurrentTime = formatSeconds(currentTime);
  const remaining = Math.max(0, duration - currentTime);
  const formattedRemainingTime = `-${formatSeconds(remaining)}`;

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        progressPercent,
        formattedCurrentTime,
        formattedRemainingTime,
        isShuffle,
        isRepeat,
        volume,
        likedTracks,
        queue,
        trendingTracks,
        isLoadingTrending,
        isLoadingPlaylists,
        activeScreen,
        orientationMode,
        isLandscape,
        isVoiceAiOpen,
        isLyricsOpen,
        isQueueOpen,
        isAddToPlaylistOpen,
        isAuthModalOpen,
        currentUser,
        targetTrackForPlaylist,
        searchQuery,
        searchHistory,
        activeMood,
        playlists,
        isWakeWordActive,
        wakeWordToast,
        togglePlay,
        playTrack,
        pauseTrack,
        nextTrack,
        prevTrack,
        seekTo,
        replay10,
        forward10,
        toggleShuffle,
        toggleRepeat,
        setVolume,
        toggleLike,
        setActiveScreen,
        setOrientationMode,
        setIsVoiceAiOpen,
        setIsLyricsOpen,
        setIsQueueOpen,
        setIsAddToPlaylistOpen,
        setIsAuthModalOpen,
        openAddToPlaylistModal,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        createPlaylist,
        setSearchQuery,
        addSearchHistory,
        removeSearchHistory,
        clearSearchHistory,
        setActiveMood,
        executeVoiceCommand,
        toggleWakeWord,
        requestWakeWordPermission,
        triggerSimulatedWakeWord,
        dismissWakeWordToast,
        refreshUser,
        logout,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
