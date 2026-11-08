import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Track, Playlist, UserResp } from '../types/music';
import {
  initApiStorage,
  getTrendingApi,
  getTrackStreamApi,
  getCurrentUser,
  logoutApi,
  getFavoritesApi,
  addFavoriteTrackApi,
  removeFavoriteTrackApi,
} from '../services/api';

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

  const playerRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  // Initialize storage, auth check, audio mode, and initial songs
  useEffect(() => {
    async function initApp() {
      try {
        await initApiStorage();
        const user = getCurrentUser();
        setCurrentUser(user);
      } catch (_) {}
      setIsAuthChecking(false);

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
      // Revert if API fails
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
      // EXPO-AUDIO PLAYER WITH JIOSAAVN REFERER HEADER
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
