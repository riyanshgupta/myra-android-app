import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icon';

export const NotificationCardOverlay: React.FC<{
  onClose?: () => void;
}> = ({ onClose }) => {
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
    requestMicPermission,
  } = usePlayer();

  const { width } = useWindowDimensions();

  if (!currentTrack) return null;

  const isLiked = Boolean(likedTracks[currentTrack.id]);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const replay10 = () => seekTo(Math.max(0, currentTime - 10));
  const forward10 = () => seekTo(Math.min(duration, currentTime + 10));

  const handleCopilotPress = async () => {
    await requestMicPermission();
    if (onClose) onClose();
    setActiveScreen('myra-ai');
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        {/* 1. Header Bar inside Card */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.headerBrand}>Myra</Text>
            <View style={styles.headerDot} />
            <Text style={styles.headerSubtitle}>Now Playing</Text>
          </View>

          <View style={styles.bluetoothPill}>
            <Icon name="bluetooth" size={13} color="#4cd7f6" />
            <Text style={styles.bluetoothText}>Car Bluetooth</Text>
          </View>
        </View>

        {/* 2. Middle Row: Track Metadata + Cover Artwork */}
        <View style={styles.trackContentRow}>
          <View style={styles.metadataCol}>
            <View style={styles.titleRow}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <View style={styles.aiRemixBadge}>
                <Text style={styles.aiRemixText}>AI REMIX</Text>
              </View>
            </View>

            <Text style={styles.artistName} numberOfLines={1}>
              {currentTrack.artist}
            </Text>

            <View style={styles.tuningRow}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.tuningText} numberOfLines={1}>
                Tuned for late night calm driving
              </Text>
            </View>
          </View>

          {/* Right Album Artwork with Glowing Audio Circles */}
          <View style={styles.artworkContainer}>
            <Image source={{ uri: currentTrack.coverUrl }} style={styles.artworkImage} />
            <View style={styles.artworkOverlayGlow}>
              <View style={styles.audioRingOuter}>
                <View style={styles.audioRingInner} />
              </View>
            </View>
          </View>
        </View>

        {/* 3. Wavy Scrubber Bar & Timers */}
        <View style={styles.scrubberSection}>
          <View style={styles.waveBarContainer}>
            {/* Background Wavy Bar Track */}
            <View style={styles.waveTrackBg}>
              <View style={[styles.waveTrackFill, { width: `${progressPercent}%` }]} />
            </View>
            {/* White Circular Thumb Knob */}
            <View style={[styles.scrubberThumb, { left: `${Math.max(0, Math.min(96, progressPercent))}%` }]} />
          </View>

          <View style={styles.timerRow}>
            <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timerText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* 4. Interactive Action Buttons Row */}
        <View style={styles.controlsRow}>
          {/* Heart / Favorite */}
          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={() => toggleLike(currentTrack.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={isLiked ? 'favorite' : 'favorite-border'}
              size={20}
              color={isLiked ? '#ff516a' : '#8e92a4'}
            />
          </TouchableOpacity>

          {/* Replay 10 */}
          <TouchableOpacity style={styles.iconActionBtn} onPress={replay10} activeOpacity={0.7}>
            <Icon name="replay-10" size={19} color="#cbc3d7" />
          </TouchableOpacity>

          {/* Skip Previous */}
          <TouchableOpacity style={styles.iconActionBtn} onPress={prevTrack} activeOpacity={0.7}>
            <Icon name="skip-previous" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Grand Cyan-Purple Gradient Play/Pause Pill Button */}
          <TouchableOpacity style={styles.mainPlayPill} onPress={togglePlay} activeOpacity={0.88}>
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={28}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Skip Next */}
          <TouchableOpacity style={styles.iconActionBtn} onPress={nextTrack} activeOpacity={0.7}>
            <Icon name="skip-next" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Forward 10 */}
          <TouchableOpacity style={styles.iconActionBtn} onPress={forward10} activeOpacity={0.7}>
            <Icon name="forward-10" size={19} color="#cbc3d7" />
          </TouchableOpacity>

          {/* Copilot Mic Pill Button */}
          <TouchableOpacity style={styles.copilotPill} onPress={handleCopilotPress} activeOpacity={0.8}>
            <Icon name="mic" size={14} color="#4cd7f6" />
            <Text style={styles.copilotText}>Copilot</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  cardContainer: {
    backgroundColor: '#161924',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(160, 120, 255, 0.45)',
    gap: 14,
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  headerBrand: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4cd7f6',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d0bcff',
  },
  bluetoothPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(76, 215, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
  },
  bluetoothText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4cd7f6',
  },
  trackContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metadataCol: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  trackTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  aiRemixBadge: {
    backgroundColor: 'rgba(76, 215, 246, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.45)',
  },
  aiRemixText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4cd7f6',
    letterSpacing: 0.8,
  },
  artistName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbc3d7',
  },
  tuningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  tuningText: {
    fontSize: 10,
    color: '#8e92a4',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  artworkContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1d1f27',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  artworkOverlayGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 23, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioRingOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioRingInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#a078ff',
  },
  scrubberSection: {
    gap: 4,
    marginTop: 2,
  },
  waveBarContainer: {
    height: 20,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  waveTrackBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#272a32',
    overflow: 'hidden',
    width: '100%',
  },
  waveTrackFill: {
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: '#4cd7f6',
  },
  scrubberThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
    marginLeft: -7,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  timerText: {
    fontSize: 10,
    color: '#8e92a4',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayPill: {
    width: 58,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4cd7f6',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  copilotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.45)',
  },
  copilotText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d0bcff',
  },
});
