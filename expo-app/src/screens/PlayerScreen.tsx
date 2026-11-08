import React, { useEffect, useRef, useState } from 'react';
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
  Platform,
  StatusBar,
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
    queue,
  } = usePlayer();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [scrubberWidth, setScrubberWidth] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Animations: Artwork pulse glow and tactile button spring
  const pulseValue = useRef(new Animated.Value(1)).current;
  const playScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.04,
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
    }
  }, [isPlaying]);

  const handlePlayPressIn = () => {
    Animated.spring(playScale, {
      toValue: 0.88,
      useNativeDriver: true,
    }).start();
  };

  const handlePlayPressOut = () => {
    Animated.spring(playScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

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
          activeOpacity={0.8}
        >
          <Text style={styles.browseBtnText}>Browse Trending Music</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked = Boolean(likedTracks[currentTrack.id]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleScrubberPress = (e: any) => {
    const { locationX } = e.nativeEvent;
    const barWidth = scrubberWidth > 0 ? scrubberWidth : isLandscape ? width * 0.45 : width - 40;
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

  const artworkSize = isLandscape ? Math.min(height - 120, 240) : Math.min(width - 48, 300);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isLandscape && styles.contentLandscape]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Top Header Strip with Safe Area Notch Margin */}
      <View style={styles.headerStrip}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setActiveScreen('home')}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="keyboard-arrow-down" size={26} color="#e1e2ec" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerCategory}>PLAYING FROM LIBRARY</Text>
          <Text style={styles.headerAlbum} numberOfLines={1}>
            {currentTrack.album || 'Lossless Stream'}
          </Text>
          <View style={styles.atmosPill}>
            <View style={styles.atmosDot} />
            <Text style={styles.atmosText}>Dolby Atmos 24-bit</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setActiveScreen('myra-ai')}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="graphic-eq" size={20} color="#4cd7f6" />
        </TouchableOpacity>
      </View>

      {/* 2. Audio Route Badges */}
      <View style={styles.badgesRow}>
        <View style={styles.deviceBadge}>
          <View style={styles.devicePulseDot} />
          <Text style={styles.deviceText}>Device Audio • Lossless</Text>
        </View>
        <View style={styles.spatialBadge}>
          <Icon name="spatial-audio" size={13} color="#a078ff" />
          <Text style={styles.spatialText}>Spatial Audio</Text>
        </View>
      </View>

      {/* 3. Main Player Body: Row in Landscape, Column in Portrait */}
      <View style={[styles.mainBody, isLandscape && styles.mainBodyLandscape]}>
        {/* Animated Artwork */}
        <View style={[styles.artworkContainer, isLandscape && styles.artworkContainerLandscape]}>
          <Animated.View
            style={[
              styles.artworkGlow,
              {
                width: artworkSize + 24,
                height: artworkSize + 24,
                borderRadius: (artworkSize + 24) / 2,
                transform: [{ scale: pulseValue }],
              },
            ]}
          />

          <View
            style={[
              styles.artworkWrapper,
              { width: artworkSize, height: artworkSize, borderRadius: 22 },
            ]}
          >
            <Image
              source={{ uri: currentTrack.coverUrl }}
              style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
            />

            {/* Live Frequency visualizer overlay at bottom of cover */}
            <View style={styles.waveformOverlay}>
              <View style={styles.barsRow}>
                {[4, 9, 6, 12, 7, 11, 5, 10, 8, 9, 6, 11, 7, 10].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: isPlaying ? h * 2.1 : 4,
                        backgroundColor: i % 2 === 0 ? '#4cd7f6' : '#a078ff',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.spatialOverlayLabel}>SPATIAL AUDIO</Text>
            </View>
          </View>
        </View>

        {/* Metadata, Scrubber & Controls */}
        <View style={[styles.controlsColumn, isLandscape && styles.controlsColumnLandscape]}>
          {/* Track Metadata & Favorite Button */}
          <View style={styles.infoRow}>
            <View style={styles.infoTextCol}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <View style={styles.artistRow}>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
                <View style={styles.bulletDot} />
                <Text style={styles.trackAlbum} numberOfLines={1}>
                  {currentTrack.album}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.likeBtn,
                isLiked ? styles.likeBtnActive : styles.likeBtnInactive,
              ]}
              onPress={() => toggleLike(currentTrack)}
              activeOpacity={0.7}
            >
              <Icon
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={22}
                color={isLiked ? '#ff516a' : '#8e92a4'}
              />
            </TouchableOpacity>
          </View>

          {/* Interactive Progress Bar Scrubber */}
          <View style={styles.scrubberContainer}>
            <TouchableOpacity
              style={styles.trackBackground}
              onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
              onPress={handleScrubberPress}
              activeOpacity={0.9}
            >
              <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
              <View
                style={[
                  styles.thumb,
                  { left: `${Math.max(0, Math.min(97, progressPercent))}%` },
                ]}
              >
                <View style={styles.thumbCenterDot} />
              </View>
            </TouchableOpacity>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.audioModesRow}>
                <Text style={styles.modeTag}>AUTO-SKIP</Text>
                <Text style={styles.modeTag}>CROSSFADE 4S</Text>
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Auxiliary Screen Actions Row (Lyrics, Queue, Add) */}
          <View style={styles.auxRow}>
            <TouchableOpacity
              style={styles.auxPill}
              onPress={() => setActiveScreen('myra-ai')}
              activeOpacity={0.7}
            >
              <Icon name="lyrics" size={15} color="#4cd7f6" />
              <Text style={styles.auxPillText}>Lyrics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.auxPill, styles.auxPillHighlight]}
              onPress={() => setActiveScreen('playlists')}
              activeOpacity={0.7}
            >
              <Icon name="queue-music" size={15} color="#e1e2ec" />
              <Text style={[styles.auxPillText, { color: '#e1e2ec' }]}>
                Queue ({queue.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.auxPill}
              onPress={() => setActiveScreen('playlists')}
              activeOpacity={0.7}
            >
              <Icon name="playlist-add" size={15} color="#a078ff" />
              <Text style={styles.auxPillText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Main Playback Control Bar with tactile animations */}
          <View style={styles.controlsRow}>
            {/* Shuffle */}
            <TouchableOpacity
              style={styles.sideControlBtn}
              onPress={() => setIsShuffle(!isShuffle)}
              activeOpacity={0.7}
            >
              <Icon
                name="shuffle"
                size={20}
                color={isShuffle ? '#4cd7f6' : '#8e92a4'}
              />
            </TouchableOpacity>

            {/* Rewind 10 */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={replay10}
              activeOpacity={0.7}
            >
              <Icon name="replay-10" size={20} color="#cbc3d7" />
            </TouchableOpacity>

            {/* Skip Previous */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={prevTrack}
              activeOpacity={0.7}
            >
              <Icon name="skip-previous" size={28} color="#ffffff" />
            </TouchableOpacity>

            {/* Grand Center Animated Play/Pause Action Button */}
            <Animated.View style={{ transform: [{ scale: playScale }] }}>
              <TouchableOpacity
                style={styles.playPauseBtn}
                onPress={togglePlay}
                onPressIn={handlePlayPressIn}
                onPressOut={handlePlayPressOut}
                activeOpacity={0.9}
              >
                <Icon
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={34}
                  color="#0b0e17"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Skip Next */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={nextTrack}
              activeOpacity={0.7}
            >
              <Icon name="skip-next" size={28} color="#ffffff" />
            </TouchableOpacity>

            {/* Forward 10 */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={forward10}
              activeOpacity={0.7}
            >
              <Icon name="forward-10" size={20} color="#cbc3d7" />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity
              style={styles.sideControlBtn}
              onPress={() => setIsRepeat(!isRepeat)}
              activeOpacity={0.7}
            >
              <Icon
                name="repeat"
                size={20}
                color={isRepeat ? '#4cd7f6' : '#8e92a4'}
              />
            </TouchableOpacity>
          </View>

          {/* Voice Recommendations Action Pill */}
          <TouchableOpacity
            style={styles.voiceAssistantPill}
            onPress={handleAskMyraQueue}
            activeOpacity={0.8}
          >
            <View style={styles.voiceAssistantLeft}>
              <View style={styles.voicePillIcon}>
                <Icon name="graphic-eq" size={14} color="#ffffff" />
              </View>
              <Text style={styles.voiceAssistantText}>
                Ask Myra: "Queue similar tracks"
              </Text>
            </View>
            <Icon name="play-arrow" size={14} color="#4cd7f6" />
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
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 24,
    paddingBottom: 28,
  },
  contentLandscape: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 16,
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 6,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272a32',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
    maxWidth: '65%',
  },
  headerCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4cd7f6',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerAlbum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e1e2ec',
    textAlign: 'center',
  },
  atmosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 215, 246, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
    marginTop: 2,
  },
  atmosDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4cd7f6',
  },
  atmosText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4cd7f6',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  devicePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4cd7f6',
  },
  deviceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#cbc3d7',
  },
  spatialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.3)',
  },
  spatialText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d0bcff',
  },
  mainBody: {
    alignItems: 'center',
    gap: 16,
  },
  mainBodyLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 4,
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  artworkContainerLandscape: {
    marginVertical: 0,
  },
  artworkGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(76, 215, 246, 0.08)',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
  },
  artworkWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1d1f27',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  artwork: {
    borderRadius: 22,
  },
  waveformOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: 'rgba(11, 14, 23, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3.5,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  spatialOverlayLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#4cd7f6',
    letterSpacing: 1.2,
  },
  controlsColumn: {
    width: '100%',
    gap: 14,
  },
  controlsColumnLandscape: {
    flex: 1,
    maxWidth: 420,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoTextCol: {
    flex: 1,
    marginRight: 14,
  },
  trackTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  trackArtist: {
    fontSize: 13,
    color: '#d0bcff',
    fontWeight: '600',
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8e92a4',
  },
  trackAlbum: {
    fontSize: 12,
    color: '#cbc3d7',
    flex: 1,
  },
  likeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  likeBtnActive: {
    backgroundColor: 'rgba(255, 81, 106, 0.15)',
    borderColor: 'rgba(255, 81, 106, 0.4)',
  },
  likeBtnInactive: {
    backgroundColor: '#1d1f27',
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
    elevation: 5,
    marginLeft: -7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbCenterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10131a',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    color: '#8e92a4',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  audioModesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeTag: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8e92a4',
    letterSpacing: 0.8,
  },
  auxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  auxPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  auxPillHighlight: {
    backgroundColor: '#272a32',
    borderColor: 'rgba(76, 215, 246, 0.3)',
  },
  auxPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbc3d7',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginVertical: 4,
  },
  sideControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#4cd7f6',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
  voiceAssistantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.35)',
    marginTop: 4,
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  voiceAssistantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voicePillIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAssistantText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e1e2ec',
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
