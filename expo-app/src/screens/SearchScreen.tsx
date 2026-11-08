import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { searchMusicApi, autocompleteApi } from '../services/api';
import { Track } from '../types/music';
import { Icon } from '../components/Icon';

const GENRE_CHIPS = ['Synthwave', 'Chill Drive', 'Night Pulse', 'Lo-Fi', 'Bollywood', 'EDM'];

// Memoized Track Item to ensure butter-smooth FlatList performance
const SearchTrackItem = React.memo(
  ({
    item,
    isThisPlaying,
    onPress,
  }: {
    item: Track;
    isThisPlaying: boolean;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        style={[styles.resultCard, isThisPlaying && styles.resultCardActive]}
        onPress={onPress}
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
  }
);

export const SearchScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchTimerRef = useRef<any>(null);
  const autoTimerRef = useRef<any>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  // Execute Search with Debounce (380ms)
  const triggerDebouncedSearch = (text: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);

    if (!text.trim()) {
      setResults([]);
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    // 1. Quick debounced autocomplete (180ms)
    autoTimerRef.current = setTimeout(async () => {
      try {
        const sugg = await autocompleteApi(text.trim());
        if (sugg && sugg.length > 0) {
          setSuggestions(sugg.slice(0, 5));
        }
      } catch (_) {}
    }, 180);

    // 2. Full catalog search debounced (380ms)
    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const tracks = await searchMusicApi(text.trim());
        setResults(tracks);
      } catch (_) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 380);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    triggerDebouncedSearch(text);
  };

  const handleChipClick = (tag: string) => {
    Keyboard.dismiss();
    setQuery(tag);
    setSuggestions([]);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);

    setIsSearching(true);
    searchMusicApi(tag)
      .then((tracks) => setResults(tracks))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  };

  const handleClear = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setIsSearching(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: Track }) => {
      const isThisPlaying = currentTrack?.id === item.id && isPlaying;
      return (
        <SearchTrackItem
          item={item}
          isThisPlaying={isThisPlaying}
          onPress={() => playTrack(item)}
        />
      );
    },
    [currentTrack?.id, isPlaying, playTrack]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 66,
      offset: 66 * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#4cd7f6" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleChangeText}
          placeholder="Search songs, artists, albums (debounced)..."
          placeholderTextColor="#8e92a4"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (query.trim()) {
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              setIsSearching(true);
              searchMusicApi(query.trim())
                .then((tracks) => setResults(tracks))
                .catch(() => setResults([]))
                .finally(() => setIsSearching(false));
            }
          }}
        />
        {isSearching && (
          <ActivityIndicator size="small" color="#4cd7f6" style={styles.spinner} />
        )}
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
            <Icon name="close" size={16} color="#cbc3d7" />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Suggestions Chips if available */}
      {suggestions.length > 0 && query.trim().length > 1 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((sugg) => (
            <TouchableOpacity
              key={sugg}
              style={styles.suggChip}
              onPress={() => handleChipClick(sugg)}
              activeOpacity={0.7}
            >
              <Icon name="search" size={12} color="#4cd7f6" />
              <Text style={styles.suggText} numberOfLines={1}>
                {sugg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Suggested Genre Filter Chips */}
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

      {/* Search Results List */}
      {isSearching && results.length === 0 ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.loaderText}>Searching catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: Track, i: number) => `${item.id}-${i}`}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            query.trim() && !isSearching ? (
              <View style={styles.emptyBox}>
                <Icon name="search" size={32} color="#8e92a4" />
                <Text style={styles.emptyTitle}>No matching tracks found</Text>
                <Text style={styles.emptySub}>
                  Try another keyword or select a genre above.
                </Text>
              </View>
            ) : !query.trim() ? (
              <View style={styles.emptyBox}>
                <Icon name="auto-awesome" size={36} color="#4cd7f6" />
                <Text style={styles.emptyTitle}>Discover Music</Text>
                <Text style={styles.emptySub}>
                  Search millions of lossless tracks across languages and genres.
                </Text>
              </View>
            ) : null
          }
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
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: '#e1e2ec',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  spinner: {
    marginRight: 6,
  },
  clearBtn: {
    padding: 6,
  },
  suggestionsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  suggChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(76, 215, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.25)',
  },
  suggText: {
    fontSize: 11,
    color: '#4cd7f6',
    fontWeight: '600',
    maxWidth: 160,
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
    height: 66,
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
