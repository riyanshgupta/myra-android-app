import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';
import { Track } from '../types/music';

export const PlaylistsScreen: React.FC = () => {
  const { queue, playTrack, currentTrack, isPlaying, trendingTracks, likedTracks } = usePlayer();

  const favoriteTracks = trendingTracks.filter((t) => likedTracks[t.id]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <Text style={styles.subtitle}>Saved Tracks & Playback Queue</Text>
      </View>

      {/* Liked Favorites Shelf if any */}
      {favoriteTracks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Icon name="favorite" size={16} color="#4cd7f6" />
            <Text style={styles.sectionTitle}>
              Favorites ({favoriteTracks.length})
            </Text>
          </View>
          {favoriteTracks.map((track) => (
            <TouchableOpacity
              key={`fav-${track.id}`}
              style={styles.card}
              onPress={() => playTrack(track)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: track.coverUrl }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist} • {track.durationFormatted}
                </Text>
              </View>
              <View style={styles.playIcon}>
                <Icon name="play-arrow" size={14} color="#4cd7f6" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Playback Queue Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Icon name="queue-music" size={16} color="#4cd7f6" />
          <Text style={styles.sectionTitle}>Up Next in Queue ({queue.length})</Text>
        </View>

        {queue.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Queue is empty. Select a song to begin.</Text>
          </View>
        ) : (
          queue.map((track: Track, i: number) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <TouchableOpacity
                key={`${track.id}-${i}`}
                style={[styles.card, isThisPlaying && styles.cardActive]}
                onPress={() => playTrack(track)}
                activeOpacity={0.8}
              >
                <Text style={[styles.index, isThisPlaying && styles.indexActive]}>
                  {(i + 1).toString().padStart(2, '0')}
                </Text>
                <Image source={{ uri: track.coverUrl }} style={styles.cover} />
                <View style={styles.info}>
                  <Text
                    style={[styles.trackTitle, isThisPlaying && styles.trackTitleActive]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist} • {track.durationFormatted}
                  </Text>
                </View>
                <View style={[styles.playIcon, isThisPlaying && styles.playIconActive]}>
                  <Icon
                    name={isThisPlaying ? 'pause' : 'play-arrow'}
                    size={14}
                    color={isThisPlaying ? '#0b0e17' : '#4cd7f6'}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  subtitle: {
    fontSize: 12,
    color: '#cbc3d7',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e1e2ec',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardActive: {
    backgroundColor: '#272a32',
    borderColor: 'rgba(76, 215, 246, 0.4)',
  },
  index: {
    color: '#cbc3d7',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: 24,
    textAlign: 'center',
  },
  indexActive: {
    color: '#4cd7f6',
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#272a32',
    marginLeft: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  trackTitle: {
    color: '#e1e2ec',
    fontSize: 13,
    fontWeight: '700',
  },
  trackTitleActive: {
    color: '#4cd7f6',
  },
  trackArtist: {
    color: '#cbc3d7',
    fontSize: 11,
    marginTop: 2,
  },
  playIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#272a32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconActive: {
    backgroundColor: '#4cd7f6',
  },
  emptyBox: {
    padding: 24,
    backgroundColor: '#1d1f27',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#cbc3d7',
    fontSize: 12,
  },
});
