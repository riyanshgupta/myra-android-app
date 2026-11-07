import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { Track, Playlist, UserResp } from '../types/music';
import {
  initApiStorage,
  getTrendingApi,
  getFavoritesApi,
  getTrackStreamApi,
  getAuthToken,
  getCurrentUser,
  setAuthToken,
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
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  pauseTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<UserResp | null>(getCurrentUser());
  const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);

  // Configure Audio Mode on startup
  useEffect(() => {
    async function configureAudio() {
      await initApiStorage();
      setCurrentUser(getCurrentUser());
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (_) {}

      // Load Initial Trending Songs
      setIsLoadingTrending(true);
      try {
        const trending = await getTrendingApi();
        if (trending && trending.length > 0) {
          setTrendingTracks(trending);
          setQueue(trending);
          setCurrentTrack(trending[0]);
          setDuration(trending[0].duration || 180);
        }
      } catch (_) {}
      setIsLoadingTrending(false);
    }
    configureAudio();
  }, []);

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setDuration(track.duration || 180);
    setCurrentTime(0);

    // Unload existing sound
    if (soundInstance) {
      try {
        await soundInstance.unloadAsync();
      } catch (_) {}
      setSoundInstance(null);
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
      // EXPO-AV AUDIO SOUND WITH JIOSAAVN REFERER HEADER
      const { sound } = await Audio.Sound.createAsync(
        {
          uri: playbackUrl,
          headers: {
            Referer: 'https://www.jiosaavn.com/',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36',
          },
        },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setCurrentTime(Math.floor((status.positionMillis || 0) / 1000));
          if (status.didJustFinish) {
            nextTrack();
          }
        }
      });

      setSoundInstance(sound);
      setIsPlaying(true);
    } catch (err) {
      console.warn('Expo Audio Playback Error:', err);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!soundInstance) {
      if (currentTrack) playTrack(currentTrack);
      return;
    }
    if (isPlaying) {
      await soundInstance.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundInstance.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseTrack = async () => {
    if (soundInstance) {
      await soundInstance.pauseAsync();
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
    if (soundInstance) {
      await soundInstance.setPositionAsync(seconds * 1000);
      setCurrentTime(seconds);
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
        playTrack,
        togglePlay,
        pauseTrack,
        nextTrack,
        prevTrack,
        seekTo,
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
