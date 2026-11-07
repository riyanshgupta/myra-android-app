import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '../context/PlayerContext';

export const PlaylistsScreen = () => {
  const { playlists, queue, playTrack } = usePlayer();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Library</Text>

      <Text style={styles.subTitle}>Current Queue ({queue.length} Tracks)</Text>
      {queue.map((track, i) => (
        <TouchableOpacity key={`${track.id}-${i}`} style={styles.card} onPress={() => playTrack(track)}>
          <Text style={styles.index}>{(i + 1).toString().padStart(2, '0')}</Text>
          <View style={styles.info}>
            <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
          </View>
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10131a' },
  content: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  subTitle: { fontSize: 14, fontWeight: 'bold', color: '#4cd7f6', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  index: { color: '#8e92a4', fontSize: 12, width: 24 },
  info: { flex: 1, marginLeft: 8 },
  trackTitle: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  trackArtist: { color: '#8e92a4', fontSize: 12, marginTop: 2 },
  playIcon: { color: '#4cd7f6', fontSize: 12 },
});
