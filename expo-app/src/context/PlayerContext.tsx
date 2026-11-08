import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Playlist, UserResp, ApiResponse } from '../types/music';
import {
  initApiStorage,
  getTrendingApi,
  getRecommendedApi,
  getTrackStreamApi,
  getCurrentUser,
  logoutApi,
  getFavoritesApi,
  addFavoriteTrackApi,
  removeFavoriteTrackApi,
  searchMusicApi,
} from '../services/api';
import { updatePlaybackNotification, clearPlaybackNotification } from '../services/notificationService';
import {
  requestMicrophonePermission,
  checkMicrophonePermission,
  processVoiceCommand,
} from '../services/voiceAssistant';

const DISCOVERY_PAGES = ['top hits', 'bollywood hits', 'punjabi', 'arijit singh', 'lo-fi beats', 'synthwave'];
let discoveryIdx = 0;

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trendingTracks: Track[];
  queue: Track[];
  recentlyPlayed: Track[];
  playlists: Playlist[];
  isLoadingTrending: boolean;
  isLoadingMoreQueue: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  currentUser: UserResp | null;
  setCurrentUser: (user: UserResp | null) => void;
  isAuthChecking: boolean;
  logout: () => void;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  activeMood: string;
  setActiveMood: (mood: string) => void;
  likedTracks: Record<string, boolean>;
  toggleLike: (trackOrId: Track | string) => Promise<void>;
  playTrack: (track: Track, options?: { explicitQueue?: Track[]; keepCurrentQueue?: boolean }) => Promise<void>;
  togglePlay: () => Promise<void>;
  pauseTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  refreshTrending: () => Promise<void>;
  loadMoreQueue: () => Promise<void>;
  // Microphone & Hey Myra Assistant
  isMicGranted: boolean;
  requestMicPermission: () => Promise<boolean>;
  executeVoiceCommand: (command: string) => Promise<ApiResponse>;
  voiceToast: string | null;
  dismissVoiceToast: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(true);
  const [isLoadingMoreQueue, setIsLoadingMoreQueue] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserResp | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [activeMood, setActiveMood] = useState<string>('all');
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});
  const [isMicGranted, setIsMicGranted] = useState<boolean>(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // Mutable refs to prevent stale closure bugs in event listeners
  const playerRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);
  const toastTimeoutRef = useRef<any>(null);
  const queueRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const isAdvancingRef = useRef<boolean>(false);
  const queueOffsetRef = useRef<number>(20);

  // Sync mutable refs
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize storage, auth check, audio mode, mic check, and initial songs
  useEffect(() => {
    async function initApp() {
      try {
        await initApiStorage();
        const user = getCurrentUser();
        setCurrentUser(user);
      } catch (_) {}
      setIsAuthChecking(false);

      // Load recently played from AsyncStorage
      try {
        const savedRecent = await AsyncStorage.getItem('myra_recently_played');
        if (savedRecent) {
          const parsed = JSON.parse(savedRecent);
          if (Array.isArray(parsed)) {
            setRecentlyPlayed(parsed);
          }
        }
      } catch (_) {}

      // Check microphone permission state on launch
      try {
        const hasMic = await checkMicrophonePermission();
        setIsMicGranted(hasMic);
      } catch (_) {}

      // Configure background audio mode for Android lock screen & notification controls
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          staysActiveInBackground: true,
          interruptionMode: 'doNotMix',
          playThroughEarpieceAndroid: false,
        });
      } catch (_) {}

      // Load initial trending catalog
      await refreshTrending();

      // Load user favorites if logged in
      if (getCurrentUser()) {
        loadUserFavorites();
      }
    }

    initApp();

    return () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.remove();
        } catch (_) {}
      }
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (_) {}
      }
    };
  }, []);

  const requestMic = async (): Promise<boolean> => {
    const granted = await requestMicrophonePermission();
    setIsMicGranted(granted);
    return granted;
  };

  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setVoiceToast(null);
    }, 4500);
  };

  const dismissVoiceToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setVoiceToast(null);
  };

  const executeVoiceCommand = async (command: string): Promise<ApiResponse> => {
    showVoiceToast(`"Hey Myra": ${command}`);
    try {
      const res = await processVoiceCommand(command, {
        current_track_id: currentTrackRef.current?.id || null,
        is_playing: isPlayingRef.current,
        position_seconds: currentTime,
      });

      const speech = res.responseSpeech || res.message || 'Executing your request.';
      showVoiceToast(`Myra: ${speech}`);

      const lower = command.toLowerCase().trim();

      // If backend returned a mapped song object
      if ((res as any).song) {
        await playTrack((res as any).song);
        return res;
      }

      if (res.action === 'play_track' && res.suggestedTrackId) {
        const match = queueRef.current.find((t) => t.id === res.suggestedTrackId);
        if (match) {
          await playTrack(match);
        } else {
          const found = await searchMusicApi(lower.replace(/^(play|queue|start)\s+/i, ''));
          if (found && found.length > 0) {
            await playTrack(found[0]);
          }
        }
      } else if (res.action === 'pause' || lower.includes('pause') || lower.includes('stop')) {
        await pauseTrack();
      } else if (res.action === 'next' || lower.includes('next') || lower.includes('skip')) {
        await nextTrack();
      } else if (res.action === 'prev' || lower.includes('previous') || lower.includes('back')) {
        await prevTrack();
      } else if (lower.includes('play')) {
        const query = lower.replace(/^play\s+/i, '').trim();
        if (query) {
          const found = await searchMusicApi(query);
          if (found && found.length > 0) {
            await playTrack(found[0]);
          }
        } else {
          await togglePlay();
        }
      }
      return res;
    } catch (err: any) {
      showVoiceToast('Myra Voice: Command executed.');
      return { success: false, message: err.message };
    }
  };

  const refreshTrending = async () => {
    setIsLoadingTrending(true);
    try {
      const trending = await getTrendingApi(0, 20);
      if (trending && trending.length > 0) {
        setTrendingTracks(trending);
        setQueue(trending);
        queueRef.current = trending;
        queueOffsetRef.current = 20;
        if (!currentTrackRef.current) {
          setCurrentTrack(trending[0]);
          setDuration(trending[0].duration || 180);
        }
      }
    } catch (_) {}
    setIsLoadingTrending(false);
  };

  const loadMoreQueue = async () => {
    if (isLoadingMoreQueue) return;
    setIsLoadingMoreQueue(true);
    try {
      const offset = queueOffsetRef.current;
      let moreTracks = await getTrendingApi(offset, 20);

      // If trending endpoint returns empty or few tracks, fallback to popular discovery queries
      if (!moreTracks || moreTracks.length < 5) {
        const query = DISCOVERY_PAGES[discoveryIdx % DISCOVERY_PAGES.length];
        discoveryIdx++;
        const page = Math.floor(offset / 20) + 1;
        moreTracks = await searchMusicApi(query, page, 20);
      }

      if (moreTracks && moreTracks.length > 0) {
        queueOffsetRef.current = offset + moreTracks.length;
        setQueue((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const filtered = moreTracks.filter((t) => !existingIds.has(t.id));
          const updated = [...prev, ...filtered];
          queueRef.current = updated;
          return updated;
        });
        setTrendingTracks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const filtered = moreTracks.filter((t) => !existingIds.has(t.id));
          return [...prev, ...filtered];
        });
      } else {
        queueOffsetRef.current = offset + 20;
      }
    } catch (_) {}
    setIsLoadingMoreQueue(false);
  };

  const loadUserFavorites = async () => {
    try {
      const map: Record<string, boolean> = {};
      
      // 1. Load from AsyncStorage first (instant offline & local persistence)
      const cachedFavs = await AsyncStorage.getItem('myra_liked_tracks');
      if (cachedFavs) {
        const parsed = JSON.parse(cachedFavs);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.assign(map, parsed);
        }
      }

      // 2. Sync with backend API if logged in
      if (getCurrentUser()) {
        const favs = await getFavoritesApi();
        (favs || []).forEach((t) => {
          if (t && t.id) map[t.id] = true;
        });
      }

      setLikedTracks(map);
      await AsyncStorage.setItem('myra_liked_tracks', JSON.stringify(map));
    } catch (_) {}
  };

  const toggleLike = async (trackOrId: Track | string) => {
    if (!trackOrId) return;
    const id = typeof trackOrId === 'string' ? trackOrId : trackOrId.id;
    if (!id) return;

    const isCurrentlyLiked = Boolean(likedTracks[id]);
    const nextState = !isCurrentlyLiked;

    // Instant optimistic state & local AsyncStorage update
    setLikedTracks((prev) => {
      const updated = { ...prev, [id]: nextState };
      AsyncStorage.setItem('myra_liked_tracks', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Sync with backend API asynchronously
    try {
      if (isCurrentlyLiked) {
        await removeFavoriteTrackApi(id);
      } else {
        await addFavoriteTrackApi(id);
      }
    } catch (_) {
      // Retain optimistic local state so user's favorite choice is never lost
    }
  };

  const logout = () => {
    logoutApi();
    setCurrentUser(null);
    setLikedTracks({});
  };

  // Safe track transition handler that avoids stale closures
  const advanceNextTrack = async () => {
    const currentQ = queueRef.current;
    const current = currentTrackRef.current;
    if (!currentQ || currentQ.length === 0) return;

    const curIdx = current ? currentQ.findIndex((t) => t.id === current.id) : -1;
    const nextIdx = (curIdx + 1) % currentQ.length;
    const nextSong = currentQ[nextIdx];

    if (nextSong) {
      await playTrack(nextSong, { keepCurrentQueue: true });
    }
  };

  const playRequestIdRef = useRef<number>(0);

  const playTrack = async (
    track: Track,
    options?: { explicitQueue?: Track[]; keepCurrentQueue?: boolean }
  ) => {
    if (!track) return;

    // Immediately stop and destroy any existing player to prevent double playback
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        if (typeof playerRef.current.remove === 'function') playerRef.current.remove();
        if (typeof playerRef.current.release === 'function') playerRef.current.release();
      } catch (_) {}
      playerRef.current = null;
    }
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (_) {}
      subscriptionRef.current = null;
    }

    const currentRequestId = ++playRequestIdRef.current;

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setDuration(track.duration || 180);
    setCurrentTime(0);
    setIsPlaying(true);
    isPlayingRef.current = true;

    // 1. Add to Recently Played and persist to AsyncStorage
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 20);
      AsyncStorage.setItem('myra_recently_played', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // 2. Queue handling & dynamic recommendations
    if (options?.explicitQueue && options.explicitQueue.length > 0) {
      setQueue(options.explicitQueue);
      queueRef.current = options.explicitQueue;
    } else if (!options?.keepCurrentQueue) {
      getRecommendedApi(track.id, 20)
        .then((recs) => {
          if (recs && recs.length > 0) {
            const uniqueRecs = recs.filter((r) => r.id !== track.id);
            const newQ = [track, ...uniqueRecs];
            setQueue(newQ);
            queueRef.current = newQ;
          } else {
            const exists = queueRef.current.some((t) => t.id === track.id);
            if (!exists) {
              const newQ = [track, ...queueRef.current];
              setQueue(newQ);
              queueRef.current = newQ;
            }
          }
        })
        .catch(() => {});
    }

    let playbackUrl: string | null = null;
    if (track.encrypted_media_url) {
      const streamInfo = await getTrackStreamApi(track.encrypted_media_url);
      playbackUrl = streamInfo?.playback_url || null;
    }

    // If another playTrack request was initiated while awaiting stream URL, abort this one
    if (currentRequestId !== playRequestIdRef.current) {
      return;
    }

    if (!playbackUrl) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    try {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          staysActiveInBackground: true,
          interruptionMode: 'doNotMix',
          playThroughEarpieceAndroid: false,
        });
      } catch (_) {}

      // Double-check no stale player remains
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch (_) {}
      }

      const player = createAudioPlayer({
        uri: playbackUrl,
        headers: {
          Referer: 'https://www.jiosaavn.com/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36',
        },
      });

      playerRef.current = player;

      if (player.addListener) {
        subscriptionRef.current = player.addListener('playbackStatusUpdate', (status: any) => {
          if (status) {
            if (typeof status.isPlaying === 'boolean') {
              setIsPlaying(status.isPlaying);
              isPlayingRef.current = status.isPlaying;
            }
            if (typeof status.currentTime === 'number') {
              // Smooth real-time sub-second tracking without Math.floor lag
              setCurrentTime(status.currentTime);
            }

            // Reliable song completion check across expo-audio status variations
            const isFinished =
              status.didJustFinish === true ||
              status.playbackState === 'ended' ||
              (typeof status.duration === 'number' &&
                status.duration > 5 &&
                typeof status.currentTime === 'number' &&
                status.currentTime >= status.duration - 0.75);

            if (isFinished && !isAdvancingRef.current) {
              isAdvancingRef.current = true;
              advanceNextTrack();
              setTimeout(() => {
                isAdvancingRef.current = false;
              }, 2000);
            }
          }
        });
      }

      await player.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      updatePlaybackNotification(track, true).catch(() => {});
    } catch (err) {
      console.warn('Expo Audio Playback Error:', err);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const togglePlay = async () => {
    if (!playerRef.current) {
      if (currentTrackRef.current) await playTrack(currentTrackRef.current);
      return;
    }
    try {
      if (isPlayingRef.current) {
        await playerRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
        updatePlaybackNotification(currentTrackRef.current, false).catch(() => {});
      } else {
        await playerRef.current.play();
        setIsPlaying(true);
        isPlayingRef.current = true;
        updatePlaybackNotification(currentTrackRef.current, true).catch(() => {});
      }
    } catch (_) {}
  };

  const pauseTrack = async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.pause();
      } catch (_) {}
      setIsPlaying(false);
      isPlayingRef.current = false;
      updatePlaybackNotification(currentTrackRef.current, false).catch(() => {});
    }
  };

  const nextTrack = async () => {
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;
    const curIdx = currentTrackRef.current ? currentQ.findIndex((t) => t.id === currentTrackRef.current?.id) : -1;
    const nextIdx = (curIdx + 1) % currentQ.length;
    await playTrack(currentQ[nextIdx] || currentQ[0], { keepCurrentQueue: true });
  };

  const prevTrack = async () => {
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;
    const curIdx = currentTrackRef.current ? currentQ.findIndex((t) => t.id === currentTrackRef.current?.id) : 0;
    const prevIdx = (curIdx - 1 + currentQ.length) % currentQ.length;
    await playTrack(currentQ[prevIdx] || currentQ[0], { keepCurrentQueue: true });
  };

  const seekTo = async (seconds: number) => {
    if (playerRef.current) {
      try {
        await playerRef.current.seekTo(seconds);
        setCurrentTime(seconds);
      } catch (_) {}
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        trendingTracks,
        queue,
        recentlyPlayed,
        playlists,
        isLoadingTrending,
        isLoadingMoreQueue,
        isAuthModalOpen,
        setIsAuthModalOpen,
        currentUser,
        setCurrentUser,
        isAuthChecking,
        logout,
        activeScreen,
        setActiveScreen,
        activeMood,
        setActiveMood,
        likedTracks,
        toggleLike,
        playTrack,
        togglePlay,
        pauseTrack,
        nextTrack,
        prevTrack,
        seekTo,
        refreshTrending,
        loadMoreQueue,
        isMicGranted,
        requestMicPermission: requestMic,
        executeVoiceCommand,
        voiceToast,
        dismissVoiceToast,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
