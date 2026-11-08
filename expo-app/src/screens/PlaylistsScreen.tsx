import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';
import { Track } from '../types/music';

// Memoized Queue Item to eliminate VirtualizedList slow update warnings
const QueueItem = React.memo(
  ({
    item,
    index,
    isThisPlaying,
    onPress,
  }: {
    item: Track;
    index: number;
    isThisPlaying: boolean;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        style={[styles.card, isThisPlaying && styles.cardActive]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.index, isThisPlaying && styles.indexActive]}>
          {(index + 1).toString().padStart(2, '0')}
        </Text>
        <Image source={{ uri: item.coverUrl }} style={styles.cover} />
        <View style={styles.info}>
          <Text
            style={[styles.trackTitle, isThisPlaying && styles.trackTitleActive]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist} • {item.durationFormatted}
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isThisPlaying === nextProps.isThisPlaying &&
      prevProps.index === nextProps.index
    );
  }
);

export const PlaylistsScreen: React.FC = () => {
  const {
    queue,
    playTrack,
    currentTrack,
    isPlaying,
    trendingTracks,
    likedTracks,
    loadMoreQueue,
    isLoadingMoreQueue,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'queue' | 'favorites'>('queue');

  const favoriteTracks = trendingTracks.filter((t) => likedTracks[t.id]);

  const handleTrackPress = useCallback(
    (track: Track) => {
      playTrack(track, { keepCurrentQueue: true });
    },
    [playTrack]
  );

  const renderQueueItem = useCallback(
    ({ item, index }: { item: Track; index: number }) => {
      const isThisPlaying = currentTrack?.id === item.id && isPlaying;
      return (
        <QueueItem
          item={item}
          index={index}
          isThisPlaying={isThisPlaying}
          onPress={() => handleTrackPress(item)}
        />
      );
    },
    [currentTrack?.id, isPlaying, handleTrackPress]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 68,
      offset: 68 * index,
      index,
    }),
    []
  );

  const handleEndReached = useCallback(() => {
    if (!isLoadingMoreQueue) {
      loadMoreQueue();
    }
  }, [isLoadingMoreQueue, loadMoreQueue]);

  const renderFooter = () => {
    if (isLoadingMoreQueue) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.footerLoaderText}>Fetching next page of lossless tracks...</Text>
        </View>
      );
    }
    return (
      <View style={styles.footerActionRow}>
        <TouchableOpacity
          style={styles.loadMoreManualBtn}
          onPress={loadMoreQueue}
          activeOpacity={0.8}
        >
          <Icon name="auto-awesome" size={14} color="#4cd7f6" />
          <Text style={styles.loadMoreManualText}>Load More Songs</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <Text style={styles.subtitle}>Saved Tracks & Infinite Playback Queue</Text>

        {/* Tab Toggle */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'queue' && styles.tabBtnActive]}
            onPress={() => setActiveTab('queue')}
            activeOpacity={0.8}
          >
            <Icon
              name="queue-music"
              size={14}
              color={activeTab === 'queue' ? '#ffffff' : '#cbc3d7'}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'queue' && styles.tabBtnTextActive]}
            >
              Up Next ({queue.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'favorites' && styles.tabBtnActive]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.8}
          >
            <Icon
              name="favorite"
              size={14}
              color={activeTab === 'favorites' ? '#ffffff' : '#cbc3d7'}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'favorites' && styles.tabBtnTextActive]}
            >
              Favorites ({favoriteTracks.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      {activeTab === 'queue' ? (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.25}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Queue is empty. Select a song to begin.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={favoriteTracks}
          keyExtractor={(item) => `fav-${item.id}`}
          renderItem={renderQueueItem}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No favorite tracks saved yet.</Text>
            </View>
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
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
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
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#1d1f27',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#a078ff',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbc3d7',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    height: 64,
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
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
    marginRight: 6,
  },
  indexActive: {
    color: '#4cd7f6',
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#272a32',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e1e2ec',
  },
  trackTitleActive: {
    color: '#4cd7f6',
  },
  trackArtist: {
    fontSize: 11,
    color: '#cbc3d7',
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
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 12,
    color: '#cbc3d7',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  footerLoaderText: {
    fontSize: 11,
    color: '#4cd7f6',
    fontWeight: '600',
  },
  footerActionRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
  },
  loadMoreManualText: {
    fontSize: 12,
    color: '#4cd7f6',
    fontWeight: '700',
  },
});
