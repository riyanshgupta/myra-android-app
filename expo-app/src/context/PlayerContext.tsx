import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Track, Playlist, UserResp, ApiResponse } from '../types/music';
import {
  initApiStorage,
  getTrendingApi,
  getTrackStreamApi,
  getCurrentUser,
  logoutApi,
  getFavoritesApi,
  addFavoriteTrackApi,
  removeFavoriteTrackApi,
  searchMusicApi,
} from '../services/api';
import {
  requestMicrophonePermission,
  checkMicrophonePermission,
  processVoiceCommand,
} from '../services/voiceAssistant';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trendingTracks: Track[];
  queue: Track[];
  playlists: Playlist[];
  isLoadingTrending: boolean;
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
  toggleLike: (track: Track) => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  pauseTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  refreshTrending: () => Promise<void>;
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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserResp | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [activeMood, setActiveMood] = useState<string>('all');
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});
  const [isMicGranted, setIsMicGranted] = useState<boolean>(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Initialize storage, auth check, audio mode, mic check, and initial songs
  useEffect(() => {
    async function initApp() {
      try {
        await initApiStorage();
        const user = getCurrentUser();
        setCurrentUser(user);
      } catch (_) {}
      setIsAuthChecking(false);

      // Check microphone permission state on launch
      try {
        const hasMic = await checkMicrophonePermission();
        setIsMicGranted(hasMic);
      } catch (_) {}

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
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
      const res = await processVoiceCommand(command);
      const speech = res.responseSpeech || res.message || 'Executing your request.';
      showVoiceToast(`Myra: ${speech}`);

      const lower = command.toLowerCase().trim();
      if (res.action === 'play_track' && res.suggestedTrackId) {
        const match = queue.find((t) => t.id === res.suggestedTrackId);
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
      const trending = await getTrendingApi();
      if (trending && trending.length > 0) {
        setTrendingTracks(trending);
        setQueue(trending);
        if (!currentTrack) {
          setCurrentTrack(trending[0]);
          setDuration(trending[0].duration || 180);
        }
      }
    } catch (_) {}
    setIsLoadingTrending(false);
  };

  const loadUserFavorites = async () => {
    try {
      const favs = await getFavoritesApi();
      const map: Record<string, boolean> = {};
      favs.forEach((t) => {
        if (t.id) map[t.id] = true;
      });
      setLikedTracks(map);
    } catch (_) {}
  };

  const toggleLike = async (track: Track) => {
    if (!track || !track.id) return;
    const isCurrentlyLiked = Boolean(likedTracks[track.id]);
    setLikedTracks((prev) => ({
      ...prev,
      [track.id]: !isCurrentlyLiked,
    }));

    try {
      if (isCurrentlyLiked) {
        await removeFavoriteTrackApi(track.id);
      } else {
        await addFavoriteTrackApi(track.id);
      }
    } catch (_) {
      setLikedTracks((prev) => ({
        ...prev,
        [track.id]: isCurrentlyLiked,
      }));
    }
  };

  const logout = () => {
    logoutApi();
    setCurrentUser(null);
    setLikedTracks({});
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setDuration(track.duration || 180);
    setCurrentTime(0);

    // Clean up previous player
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (_) {}
      subscriptionRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch (_) {}
      playerRef.current = null;
    }

    let playbackUrl: string | null = null;
    if (track.encrypted_media_url) {
      const streamInfo = await getTrackStreamApi(track.encrypted_media_url);
      playbackUrl = streamInfo?.playback_url || null;
    }

    if (!playbackUrl) {
      setIsPlaying(false);
      return;
    }

    try {
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
            }
            if (typeof status.currentTime === 'number') {
              setCurrentTime(Math.floor(status.currentTime));
            }
            if (status.didJustFinish) {
              nextTrack();
            }
          }
        });
      }

      await player.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Expo Audio Playback Error:', err);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!playerRef.current) {
      if (currentTrack) await playTrack(currentTrack);
      return;
    }
    try {
      if (isPlaying) {
        await playerRef.current.pause();
        setIsPlaying(false);
      } else {
        await playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (_) {}
  };

  const pauseTrack = async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.pause();
      } catch (_) {}
      setIsPlaying(false);
    }
  };

  const nextTrack = async () => {
    if (queue.length === 0) return;
    const curIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
    const nextIdx = (curIdx + 1) % queue.length;
    await playTrack(queue[nextIdx] || queue[0]);
  };

  const prevTrack = async () => {
    if (queue.length === 0) return;
    const curIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : 0;
    const prevIdx = (curIdx - 1 + queue.length) % queue.length;
    await playTrack(queue[prevIdx] || queue[0]);
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
        playlists,
        isLoadingTrending,
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
