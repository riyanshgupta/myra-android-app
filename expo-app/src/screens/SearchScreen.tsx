import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { searchMusicApi } from '../services/api';
import { Track } from '../types/music';

export const SearchScreen = () => {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const tracks = await searchMusicApi(text);
      setResults(tracks);
    } catch (_) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor="#8e92a4"
          autoCapitalize="none"
        />
      </View>

      {/* Results or Loading */}
      {isSearching ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#4cd7f6" />
          <Text style={styles.loaderText}>Searching JioSaavn Catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: Track) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            query.trim() ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No results found for "{query}".</Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Type above to search millions of tracks.</Text>
              </View>
            )
          }
          renderItem={({ item }: { item: Track }) => (
            <TouchableOpacity style={styles.card} onPress={() => playTrack(item)}>
              <Image source={{ uri: item.coverUrl }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {item.artist} • {item.durationFormatted}
                </Text>
              </View>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131a',
    padding: 16,
  },
  searchBox: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1e2330',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(76,215,246,0.2)',
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    color: '#8e92a4',
    fontSize: 12,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8e92a4',
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: '#8e92a4',
    fontSize: 12,
    marginTop: 2,
  },
  playIcon: {
    color: '#4cd7f6',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
});
