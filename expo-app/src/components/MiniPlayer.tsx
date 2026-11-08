import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icon';

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, currentTime, duration, setActiveScreen } =
    usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
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
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

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
            color="#0b0e17"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  artist: {
    color: '#d0bcff',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
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
