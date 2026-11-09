import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icon';
import { NotificationCardOverlay } from './NotificationCardOverlay';

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, currentTime, duration, setActiveScreen } =
    usePlayer();
  const [showCardOverlay, setShowCardOverlay] = useState<boolean>(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.outerContainer}>
      {/* Expanded Custom Notification Card Overlay matching image_d894ba1c.png */}
      {showCardOverlay && (
        <NotificationCardOverlay onClose={() => setShowCardOverlay(false)} />
      )}

      <View style={styles.container}>
        {/* Micro progress line */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <TouchableOpacity
          style={styles.innerRow}
          onPress={() => setActiveScreen('player')}
          activeOpacity={0.9}
        >
          {/* Cover Art */}
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.coverArt} />

          {/* Track Metadata */}
          <View style={styles.metadata}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <View style={styles.aiTag}>
                <Text style={styles.aiTagText}>AI REMIX</Text>
              </View>
            </View>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist} • Tuned for late night calm
            </Text>
          </View>

          {/* Toggle Card Overlay View Button */}
          <TouchableOpacity
            style={styles.cardToggleBtn}
            onPress={(e) => {
              e.stopPropagation();
              setShowCardOverlay(!showCardOverlay);
            }}
            activeOpacity={0.8}
          >
            <Icon
              name={showCardOverlay ? 'keyboard-arrow-down' : 'dashboard'}
              size={18}
              color="#d0bcff"
            />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.playBtn}
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            activeOpacity={0.8}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#10131a',
  },
  container: {
    backgroundColor: '#1d1f27',
    borderTopWidth: 1,
    borderTopColor: 'rgba(160, 120, 255, 0.25)',
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a078ff',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  coverArt: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1e2436',
  },
  metadata: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  aiTag: {
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.35)',
  },
  aiTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#4cd7f6',
  },
  artist: {
    color: '#d0bcff',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  cardToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.3)',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});
