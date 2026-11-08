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
import { Icon } from '../components/Icon';

const GENRE_CHIPS = ['Synthwave', 'Chill Drive', 'Night Pulse', 'Lo-Fi', 'Bollywood', 'EDM'];

export const SearchScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
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

  const handleChipClick = (tag: string) => {
    handleSearch(tag);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#4cd7f6" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor="#8e92a4"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
            <Icon name="close" size={16} color="#cbc3d7" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggested Genre Pills */}
      <View style={styles.chipsRow}>
        {GENRE_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, query === chip && styles.chipActive]}
            onPress={() => handleChipClick(chip)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, query === chip && styles.chipTextActive]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Results */}
      {isSearching ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.loaderText}>Searching JioSaavn catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: Track, i: number) => `${item.id}-${i}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            query.trim() ? (
              <View style={styles.emptyBox}>
                <Icon name="search" size={32} color="#8e92a4" />
                <Text style={styles.emptyTitle}>No matching tracks found</Text>
                <Text style={styles.emptySub}>
                  Try another query or select a suggestion above.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Icon name="auto-awesome" size={36} color="#4cd7f6" />
                <Text style={styles.emptyTitle}>Discover Music</Text>
                <Text style={styles.emptySub}>
                  Search millions of lossless tracks across languages and genres.
                </Text>
              </View>
            )
          }
          renderItem={({ item }: { item: Track }) => {
            const isThisPlaying = currentTrack?.id === item.id && isPlaying;
            return (
              <TouchableOpacity
                style={[styles.resultCard, isThisPlaying && styles.resultCardActive]}
                onPress={() => playTrack(item)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.coverUrl }} style={styles.cover} />
                <View style={styles.info}>
                  <Text
                    style={[styles.title, isThisPlaying && styles.titleActive]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.artist} numberOfLines={1}>
                    {item.artist} • {item.durationFormatted}
                  </Text>
                </View>
                <View style={[styles.playBtn, isThisPlaying && styles.playBtnActive]}>
                  <Icon
                    name={isThisPlaying ? 'pause' : 'play-arrow'}
                    size={14}
                    color={isThisPlaying ? '#0b0e17' : '#4cd7f6'}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.25)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#e1e2ec',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#1d1f27',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  chipActive: {
    backgroundColor: '#4cd7f6',
    borderColor: '#4cd7f6',
  },
  chipText: {
    color: '#cbc3d7',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0b0e17',
    fontWeight: '800',
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    color: '#cbc3d7',
    fontSize: 12,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#e1e2ec',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySub: {
    color: '#cbc3d7',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultCardActive: {
    borderColor: 'rgba(76, 215, 246, 0.4)',
    backgroundColor: '#272a32',
  },
  cover: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#272a32',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: '#e1e2ec',
    fontSize: 13,
    fontWeight: '700',
  },
  titleActive: {
    color: '#4cd7f6',
  },
  artist: {
    color: '#cbc3d7',
    fontSize: 11,
    marginTop: 2,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#272a32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: '#4cd7f6',
  },
});
