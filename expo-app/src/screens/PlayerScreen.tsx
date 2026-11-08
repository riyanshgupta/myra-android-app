import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';

export const PlayerScreen: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    likedTracks,
    toggleLike,
    setActiveScreen,
    executeVoiceCommand,
    requestMicPermission,
  } = usePlayer();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Animations: Spinning record, pulse glow, and entry scale
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      spinLoopRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 16000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoopRef.current.start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (spinLoopRef.current) {
        spinLoopRef.current.stop();
      }
    }
  }, [isPlaying]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="graphic-eq" size={32} color="#4cd7f6" />
        </View>
        <Text style={styles.emptyTitle}>No Track Playing</Text>
        <Text style={styles.emptySub}>
          Select a song from Home or Search to begin streaming.
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => setActiveScreen('home')}
        >
          <Text style={styles.browseBtnText}>Browse Trending Music</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked = Boolean(likedTracks[currentTrack.id]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarPress = (e: any) => {
    const { locationX } = e.nativeEvent;
    const barWidth = isLandscape ? width * 0.45 : width - 48;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    seekTo(ratio * duration);
  };

  const replay10 = () => {
    seekTo(Math.max(0, currentTime - 10));
  };

  const forward10 = () => {
    seekTo(Math.min(duration, currentTime + 10));
  };

  const handleAskMyraQueue = async () => {
    await requestMicPermission();
    if (currentTrack) {
      await executeVoiceCommand(`Queue songs similar to ${currentTrack.title} by ${currentTrack.artist}`);
    }
  };

  const artworkSize = isLandscape ? Math.min(height - 120, 260) : Math.min(width - 64, 320);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isLandscape && styles.contentLandscape]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Strip */}
      <View style={styles.headerStrip}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setActiveScreen('home')}
          activeOpacity={0.7}
        >
          <Icon name="keyboard-arrow-down" size={24} color="#e1e2ec" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerCaption}>NOW PLAYING</Text>
          <View style={styles.atmosPill}>
            <View style={styles.atmosDot} />
            <Text style={styles.atmosText}>Dolby Atmos 24-bit</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setActiveScreen('playlists')}
          activeOpacity={0.7}
        >
          <Icon name="queue-music" size={20} color="#e1e2ec" />
        </TouchableOpacity>
      </View>

      {/* Main Player Body: Row in Landscape, Column in Portrait */}
      <View style={[styles.mainBody, isLandscape && styles.mainBodyLandscape]}>
        {/* Left / Top: Animated Artwork */}
        <View style={[styles.artworkContainer, isLandscape && styles.artworkContainerLandscape]}>
          <Animated.View
            style={[
              styles.artworkGlow,
              {
                width: artworkSize + 30,
                height: artworkSize + 30,
                borderRadius: (artworkSize + 30) / 2,
                transform: [{ scale: pulseValue }],
              },
            ]}
          />

          <View
            style={[
              styles.artworkWrapper,
              { width: artworkSize, height: artworkSize, borderRadius: 24 },
            ]}
          >
            <Image
              source={{ uri: currentTrack.coverUrl }}
              style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
            />

            {/* Live Frequency visualizer overlay at bottom of cover */}
            <View style={styles.waveformOverlay}>
              {[4, 9, 6, 12, 7, 11, 5, 10, 8, 9, 6, 11].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: isPlaying ? h * 2.2 : 4,
                      backgroundColor: i % 2 === 0 ? '#4cd7f6' : '#a078ff',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Right / Bottom: Metadata, Scrubber & Controls */}
        <View style={[styles.controlsColumn, isLandscape && styles.controlsColumnLandscape]}>
          {/* Track Metadata & Favorite Button */}
          <View style={styles.infoRow}>
            <View style={styles.infoTextCol}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.trackArtist} numberOfLines={1}>
                {currentTrack.artist} • {currentTrack.album}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.likeBtn}
              onPress={() => toggleLike(currentTrack)}
              activeOpacity={0.7}
            >
              <Icon
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={22}
                color={isLiked ? '#4cd7f6' : '#8e92a4'}
              />
            </TouchableOpacity>
          </View>

          {/* Interactive Progress Bar Scrubber */}
          <View style={styles.scrubberContainer}>
            <TouchableOpacity
              style={styles.trackBackground}
              onPress={handleProgressBarPress}
              activeOpacity={0.9}
            >
              <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.thumb, { left: `${Math.max(0, Math.min(97, progressPercent))}%` }]} />
            </TouchableOpacity>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Main Playback Control Bar */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={replay10} activeOpacity={0.7}>
              <Icon name="replay-10" size={22} color="#cbc3d7" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={prevTrack} activeOpacity={0.7}>
              <Icon name="skip-previous" size={28} color="#ffffff" />
            </TouchableOpacity>

            {/* Glowing Big Play/Pause Action Button */}
            <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay} activeOpacity={0.8}>
              <Icon
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={34}
                color="#0b0e17"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={nextTrack} activeOpacity={0.7}>
              <Icon name="skip-next" size={28} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={forward10} activeOpacity={0.7}>
              <Icon name="forward-10" size={22} color="#cbc3d7" />
            </TouchableOpacity>
          </View>

          {/* Voice Recommendations Action Pill */}
          <TouchableOpacity
            style={styles.voiceAssistantPill}
            onPress={handleAskMyraQueue}
            activeOpacity={0.8}
          >
            <View style={styles.voiceAssistantLeft}>
              <Icon name="graphic-eq" size={16} color="#a078ff" />
              <Text style={styles.voiceAssistantText}>
                Ask Myra: "Queue similar tracks"
              </Text>
            </View>
            <Icon name="play-arrow" size={14} color="#a078ff" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  contentLandscape: {
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272a32',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 3,
  },
  headerCaption: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8e92a4',
    letterSpacing: 1.5,
  },
  atmosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
  },
  atmosDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4cd7f6',
  },
  atmosText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4cd7f6',
  },
  mainBody: {
    alignItems: 'center',
    gap: 20,
  },
  mainBodyLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginTop: 8,
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  artworkContainerLandscape: {
    marginVertical: 0,
  },
  artworkGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(76, 215, 246, 0.08)',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
  },
  artworkWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1d1f27',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  artwork: {
    borderRadius: 24,
  },
  waveformOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: 'rgba(11, 14, 23, 0.8)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 6,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },
  controlsColumn: {
    width: '100%',
    gap: 16,
  },
  controlsColumnLandscape: {
    flex: 1,
    maxWidth: 440,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoTextCol: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  trackArtist: {
    fontSize: 13,
    color: '#cbc3d7',
    marginTop: 3,
    fontWeight: '500',
  },
  likeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272a32',
  },
  scrubberContainer: {
    width: '100%',
    gap: 6,
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#272a32',
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4cd7f6',
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    color: '#8e92a4',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  secondaryBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  voiceAssistantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.3)',
    marginTop: 6,
  },
  voiceAssistantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceAssistantText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d0bcff',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#10131a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e1e2ec',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#cbc3d7',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: '#a078ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
  },
  browseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
