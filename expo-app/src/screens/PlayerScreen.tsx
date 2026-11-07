import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '../context/PlayerContext';

export const PlayerScreen = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
  } = usePlayer();

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No track selected to play.</Text>
      </View>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Album Cover Art */}
      <View style={styles.coverWrapper}>
        <Image source={{ uri: currentTrack.coverUrl }} style={styles.coverImage} />
      </View>

      {/* Track Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {currentTrack.artist} • {currentTrack.album}
        </Text>
      </View>

      {/* Scrub Bar */}
      <View style={styles.scrubContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlBtn} onPress={prevTrack}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay}>
          <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={nextTrack}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131a',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#10131a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8e92a4',
    fontSize: 14,
  },
  coverWrapper: {
    width: 260,
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  trackArtist: {
    fontSize: 14,
    color: '#4cd7f6',
    marginTop: 6,
    textAlign: 'center',
  },
  scrubContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1e2330',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4cd7f6',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#8e92a4',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlBtn: {
    padding: 12,
  },
  controlIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIcon: {
    fontSize: 26,
    color: '#10131a',
  },
});
