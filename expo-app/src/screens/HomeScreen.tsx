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
import { Icon } from '../components/Icon';

const MOOD_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'auto-awesome' },
  { id: 'chill', name: 'Chill Drive', icon: 'directions-car' },
  { id: 'focus', name: 'Focus', icon: 'psychology' },
  { id: 'energy', name: 'High Energy', icon: 'bolt' },
  { id: 'night', name: 'Night Pulse', icon: 'nightlife' },
  { id: 'synth', name: 'Synthwave', icon: 'equalizer' },
];

export const HomeScreen: React.FC = () => {
  const {
    currentUser,
    trendingTracks,
    recentlyPlayed,
    isLoadingTrending,
    playTrack,
    activeMood,
    setActiveMood,
    setActiveScreen,
    currentTrack,
    isPlaying,
    requestMicPermission,
    executeVoiceCommand,
    setIsAuthModalOpen,
  } = usePlayer();

  const curatedTracks = trendingTracks.slice(0, 5);
  const recentTracks = recentlyPlayed.length > 0 ? recentlyPlayed : trendingTracks.slice(0, 6);

  const getFilteredTracks = () => {
    if (activeMood === 'all') return curatedTracks;
    return trendingTracks.filter((_, idx) => idx % 2 === 0).slice(0, 5);
  };

  const displayedTracks = getFilteredTracks();

  const handleAskMyraPress = async () => {
    await requestMicPermission();
    setActiveScreen('myra-ai');
  };

  const handleQuickPrompt = async (prompt: string) => {
    await executeVoiceCommand(prompt);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Top Greeting Header */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingTitleCol}>
          <View style={styles.greetingSubRow}>
            <Text style={styles.greetingTitle}>
              Good evening{currentUser ? `, @${currentUser.username}` : ''}
            </Text>
            <Icon name="auto-awesome" size={20} color="#a078ff" />
          </View>
          <Text style={styles.greetingSub}>Myra Intelligent Audio Copilot</Text>
        </View>

        <TouchableOpacity
          style={styles.profileChip}
          onPress={() => setIsAuthModalOpen(true)}
          activeOpacity={0.7}
        >
          <Icon name="account-circle" size={16} color="#d0bcff" />
          <Text style={styles.profileChipText}>
            {currentUser ? currentUser.username : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Mood Filters Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodsCarousel}
      >
        {MOOD_CATEGORIES.map((m) => {
          const isActive = activeMood === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.moodChip, isActive && styles.moodChipActive]}
              onPress={() => setActiveMood(m.id)}
              activeOpacity={0.8}
            >
              <Icon
                name={m.icon}
                size={14}
                color={isActive ? '#ffffff' : '#cbc3d7'}
              />
              <Text style={[styles.moodText, isActive && styles.moodTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. "Hey Myra" Voice Assistant Banner with "Ask Myra" Button */}
      <View style={styles.aiBanner}>
        <View style={styles.ambientGlowRight} />
        <View style={styles.ambientGlowLeft} />

        <View style={styles.aiBannerTop}>
          <View style={styles.aiBannerTitleRow}>
            <View style={styles.aiIconBadge}>
              <Icon name="graphic-eq" size={18} color="#d0bcff" />
              <View style={styles.aiIconDot} />
            </View>
            <View>
              <View style={styles.aiTagRow}>
                <Text style={styles.aiTitle}>Myra Voice Assistant</Text>
                <View style={styles.heyBadge}>
                  <Text style={styles.heyBadgeText}>"Hey Myra"</Text>
                </View>
              </View>
              <Text style={styles.aiSub}>Say "Hey Myra" or tap to speak</Text>
            </View>
          </View>

          {/* EXACT "Ask Myra" Purple Button */}
          <TouchableOpacity
            style={styles.askMyraBtn}
            onPress={handleAskMyraPress}
            activeOpacity={0.8}
          >
            <Icon name="mic" size={16} color="#ffffff" />
            <Text style={styles.askMyraBtnText}>Ask Myra</Text>
          </TouchableOpacity>
        </View>

        {/* Live Voice Equalizer Visualizer Strip */}
        <View style={styles.visualizerStrip}>
          <View style={styles.barsContainer}>
            <View style={[styles.visBar, { height: 8, backgroundColor: '#4cd7f6' }]} />
            <View style={[styles.visBar, { height: 16, backgroundColor: '#a078ff' }]} />
            <View style={[styles.visBar, { height: 11, backgroundColor: '#4cd7f6' }]} />
            <View style={[styles.visBar, { height: 18, backgroundColor: '#ffffff' }]} />
            <View style={[styles.visBar, { height: 9, backgroundColor: '#a078ff' }]} />
          </View>
          <Text style={styles.visualizerCaption} numberOfLines={1}>
            "Tuned for late night calm driving tempo"
          </Text>
          <Icon name="tune" size={14} color="#8e92a4" />
        </View>

        {/* Quick Context Prompt Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
          {[
            'Play synthwave for highway cruising',
            'Match BPM to night pulse',
            'Queue chill vocalists',
          ].map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.promptPill}
              onPress={() => handleQuickPrompt(prompt)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptPillText}>"{prompt}"</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. RECENTLY PLAYED SECTION (Dedicated Shelf) */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <Icon name="history" size={16} color="#4cd7f6" />
        </View>
        <TouchableOpacity onPress={() => setActiveScreen('playlists')} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {recentTracks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>No recently played songs yet.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shelfCarousel}
        >
          {recentTracks.map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <TouchableOpacity
                key={`recent-${track.id}`}
                style={styles.recentCard}
                onPress={() => playTrack(track)}
                activeOpacity={0.8}
              >
                <View style={styles.recentCoverWrapper}>
                  <Image source={{ uri: track.coverUrl }} style={styles.recentCover} />
                  <View style={[styles.recentPlayBadge, isThisPlaying && styles.recentPlayBadgeActive]}>
                    <Icon
                      name={isThisPlaying ? 'pause' : 'play-arrow'}
                      size={14}
                      color={isThisPlaying ? '#0b0e17' : '#ffffff'}
                    />
                  </View>
                </View>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.recentArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* 5. Curated by Myra AI Section */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Curated by Myra AI</Text>
          <View style={styles.pulsingSectionDot} />
        </View>
        <Text style={styles.sectionMeta}>For You</Text>
      </View>

      {isLoadingTrending ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.loaderText}>Connecting to Live Catalog...</Text>
        </View>
      ) : displayedTracks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>No curated tracks available right now.</Text>
        </View>
      ) : (
        displayedTracks.map((track) => {
          const isThisPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <TouchableOpacity
              key={track.id}
              style={[styles.trackCard, isThisPlaying && styles.trackCardActive]}
              onPress={() => playTrack(track)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: track.coverUrl }} style={styles.trackCover} />
              <View style={styles.trackInfo}>
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

              <View style={[styles.playPill, isThisPlaying && styles.playPillActive]}>
                <Icon
                  name={isThisPlaying ? 'pause' : 'play-arrow'}
                  size={14}
                  color={isThisPlaying ? '#ffffff' : '#a078ff'}
                />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131a',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingTitleCol: {
    gap: 4,
    flex: 1,
  },
  greetingSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e1e2ec',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 12,
    color: '#cbc3d7',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  profileChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d0bcff',
  },
  moodsCarousel: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  moodChipActive: {
    backgroundColor: '#a078ff',
    borderColor: '#a078ff',
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbc3d7',
  },
  moodTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  aiBanner: {
    backgroundColor: '#1d1f27',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.35)',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlowRight: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
  },
  ambientGlowLeft: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(160, 120, 255, 0.12)',
  },
  aiBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aiBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#272a32',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiIconDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d0bcff',
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  heyBadge: {
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.3)',
  },
  heyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d0bcff',
  },
  aiSub: {
    fontSize: 11,
    color: '#cbc3d7',
    marginTop: 2,
  },
  askMyraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#a078ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  askMyraBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  visualizerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10131a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 18,
  },
  visBar: {
    width: 3,
    borderRadius: 1.5,
  },
  visualizerCaption: {
    fontSize: 11,
    color: '#cbc3d7',
    flex: 1,
    marginHorizontal: 8,
  },
  promptScroll: {
    flexDirection: 'row',
  },
  promptPill: {
    backgroundColor: '#272a32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  promptPillText: {
    fontSize: 11,
    color: '#cbc3d7',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d0bcff',
  },
  pulsingSectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a078ff',
  },
  sectionMeta: {
    fontSize: 12,
    color: '#cbc3d7',
  },
  shelfCarousel: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  recentCard: {
    width: 124,
    gap: 4,
  },
  recentCoverWrapper: {
    width: 124,
    height: 124,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1d1f27',
  },
  recentCover: {
    width: '100%',
    height: '100%',
  },
  recentPlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 19, 26, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  recentPlayBadgeActive: {
    backgroundColor: '#a078ff',
    borderColor: '#d0bcff',
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e1e2ec',
    marginTop: 2,
  },
  recentArtist: {
    fontSize: 10,
    color: '#8e92a4',
  },
  loaderBox: {
    padding: 30,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 12,
    color: '#cbc3d7',
    marginTop: 8,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: '#1d1f27',
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyCardText: {
    fontSize: 12,
    color: '#cbc3d7',
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  trackCardActive: {
    backgroundColor: '#272a32',
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#272a32',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e1e2ec',
  },
  trackTitleActive: {
    color: '#d0bcff',
  },
  trackArtist: {
    fontSize: 11,
    color: '#cbc3d7',
    marginTop: 2,
  },
  playPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#272a32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPillActive: {
    backgroundColor: '#a078ff',
  },
});
