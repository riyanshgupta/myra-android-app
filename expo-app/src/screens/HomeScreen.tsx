import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';

export const HomeScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  const {
    currentUser,
    setIsAuthModalOpen,
    trendingTracks,
    isLoadingTrending,
    playTrack,
  } = usePlayer();

  const curatedTracks = trendingTracks.slice(0, 4);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingTitle}>
            Good Evening{currentUser ? `, ${currentUser.username}` : ''}
          </Text>
          <Text style={styles.greetingSubtitle}>Myra Intelligent Music OS</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => setIsAuthModalOpen(true)}
        >
          <Text style={styles.profileBtnText}>
            {currentUser ? `@${currentUser.username}` : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Assistant Callout Banner */}
      <TouchableOpacity
        style={styles.aiBanner}
        onPress={() => onNavigate('myra-ai')}
      >
        <View style={styles.aiBannerHeader}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>HEY MYRA AI</Text>
          </View>
          <Text style={styles.aiPromptText}>"Play synthwave for driving"</Text>
        </View>
        <Text style={styles.aiDesc}>Tap to ask Myra Voice Assistant</Text>
      </TouchableOpacity>

      {/* Curated Recommendations Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Curated By Myra AI</Text>
        <Text style={styles.sectionSub}>For You</Text>
      </View>

      {isLoadingTrending ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4cd7f6" />
          <Text style={styles.loaderText}>Fetching Live Songs from API...</Text>
        </View>
      ) : curatedTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tracks received from API.</Text>
        </View>
      ) : (
        curatedTracks.map((track) => (
          <TouchableOpacity
            key={track.id}
            style={styles.trackCard}
            onPress={() => playTrack(track)}
          >
            <Image source={{ uri: track.coverUrl }} style={styles.trackCover} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.trackArtist} numberOfLines={1}>
                {track.artist} • {track.durationFormatted}
              </Text>
            </View>
            <View style={styles.playBadge}>
              <Text style={styles.playBadgeText}>▶</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#4cd7f6',
    marginTop: 2,
  },
  profileBtn: {
    backgroundColor: '#1e2330',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76,215,246,0.3)',
  },
  profileBtnText: {
    color: '#4cd7f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiBanner: {
    backgroundColor: '#1a1d29',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76,215,246,0.3)',
    marginBottom: 24,
  },
  aiBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiBadge: {
    backgroundColor: 'rgba(76,215,246,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: '#4cd7f6',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiPromptText: {
    color: '#a0a5b8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  aiDesc: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sectionSub: {
    fontSize: 12,
    color: '#8e92a4',
  },
  loaderContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loaderText: {
    color: '#8e92a4',
    fontSize: 12,
    marginTop: 10,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8e92a4',
    fontSize: 12,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackArtist: {
    color: '#8e92a4',
    fontSize: 12,
    marginTop: 2,
  },
  playBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadgeText: {
    color: '#10131a',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
