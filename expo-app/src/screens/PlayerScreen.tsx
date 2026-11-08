import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(width - 56, 310);

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
    const barWidth = width - 48;
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

  return (
    <View style={styles.container}>
      {/* Dynamic Ambient Background Glow */}
      <View style={styles.glowTop} />

      {/* Top Header Strip */}
      <View style={styles.headerStrip}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setActiveScreen('home')}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={20} color="#e1e2ec" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerCaption}>NOW PLAYING</Text>
          <View style={styles.atmosPill}>
            <View style={styles.atmosDot} />
            <Text style={styles.atmosText}>Dolby Atmos</Text>
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

      {/* Album Artwork Card */}
      <View style={styles.artworkContainer}>
        <Image source={{ uri: currentTrack.coverUrl }} style={styles.artwork} />

        {/* Live Frequency visualizer overlay at bottom of cover */}
        <View style={styles.waveformOverlay}>
          {[4, 8, 5, 10, 6, 9, 4, 8, 6, 7].map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: isPlaying ? h * 2 : 4,
                  backgroundColor: i % 2 === 0 ? '#4cd7f6' : '#a078ff',
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Track Metadata & Favorite Button */}
      <View style={styles.infoRow}>
        <View style={styles.infoTextCol}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
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
            color={isLiked ? '#4cd7f6' : '#cbc3d7'}
          />
        </TouchableOpacity>
      </View>

      {/* Interactive Progress Bar */}
      <View style={styles.scrubberSection}>
        <TouchableOpacity
          style={styles.scrubTouchable}
          onPress={handleProgressBarPress}
          activeOpacity={0.9}
        >
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            <View style={[styles.scrubberThumb, { left: `${progressPercent}%` }]} />
          </View>
        </TouchableOpacity>

        <View style={styles.timeLabelsRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Main Playback Controls Row */}
      <View style={styles.controlsRow}>
        {/* Replay 10s */}
        <TouchableOpacity style={styles.secondaryCtrl} onPress={replay10} activeOpacity={0.7}>
          <Icon name="replay-10" size={22} color="#cbc3d7" />
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity style={styles.primaryCtrl} onPress={prevTrack} activeOpacity={0.7}>
          <Icon name="skip-previous" size={28} color="#e1e2ec" />
        </TouchableOpacity>

        {/* Play / Pause Giant Button */}
        <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay} activeOpacity={0.8}>
          <Icon
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={34}
            color="#0b0e17"
          />
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.primaryCtrl} onPress={nextTrack} activeOpacity={0.7}>
          <Icon name="skip-next" size={28} color="#e1e2ec" />
        </TouchableOpacity>

        {/* Forward 10s */}
        <TouchableOpacity style={styles.secondaryCtrl} onPress={forward10} activeOpacity={0.7}>
          <Icon name="forward-10" size={22} color="#cbc3d7" />
        </TouchableOpacity>
      </View>

      {/* Bottom Telemetry Audio Mode */}
      <View style={styles.bottomTelemetryRow}>
        <TouchableOpacity
          style={styles.telemetryTag}
          onPress={handleAskMyraQueue}
          activeOpacity={0.8}
        >
          <Icon name="mic" size={14} color="#4cd7f6" />
          <Text style={styles.telemetryTagText}>Ask Myra to Queue Related</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131a',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  glowTop: {
    position: 'absolute',
    top: -20,
    left: '20%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(76, 215, 246, 0.08)',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#10131a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e1e2ec',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#cbc3d7',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: '#4cd7f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  browseBtnText: {
    color: '#0b0e17',
    fontSize: 13,
    fontWeight: '800',
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272a32',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerCaption: {
    fontSize: 10,
    fontWeight: '800',
    color: '#cbc3d7',
    letterSpacing: 1.5,
  },
  atmosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  atmosDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4cd7f6',
  },
  atmosText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4cd7f6',
  },
  artworkContainer: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(76, 215, 246, 0.25)',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: '#1d1f27',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  waveformOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(16, 19, 26, 0.8)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 6,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  infoTextCol: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  artist: {
    fontSize: 13,
    color: '#4cd7f6',
    marginTop: 3,
    fontWeight: '600',
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
  scrubberSection: {
    width: '100%',
  },
  scrubTouchable: {
    height: 24,
    justifyContent: 'center',
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#272a32',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4cd7f6',
    borderRadius: 3,
  },
  scrubberThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    marginLeft: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#cbc3d7',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  secondaryCtrl: {
    padding: 8,
  },
  primaryCtrl: {
    padding: 8,
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
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  bottomTelemetryRow: {
    alignItems: 'center',
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.25)',
  },
  telemetryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4cd7f6',
  },
});
