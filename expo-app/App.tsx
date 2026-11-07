import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { PlayerProvider, usePlayer } from './src/context/PlayerContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { PlaylistsScreen } from './src/screens/PlaylistsScreen';
import { MyraAiScreen } from './src/screens/MyraAiScreen';
import { AuthModal } from './src/components/AuthModal';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { currentTrack, isPlaying, togglePlay } = usePlayer();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={(s) => setActiveTab(s)} />;
      case 'search':
        return <SearchScreen />;
      case 'player':
        return <PlayerScreen />;
      case 'playlists':
        return <PlaylistsScreen />;
      case 'myra-ai':
        return <MyraAiScreen />;
      default:
        return <HomeScreen onNavigate={(s) => setActiveTab(s)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#10131a" />
      <View style={styles.mainContainer}>
        {renderScreen()}

        {/* Bottom Mini Player */}
        {activeTab !== 'player' && currentTrack && (
          <TouchableOpacity style={styles.miniPlayer} onPress={() => setActiveTab('player')}>
            <View style={styles.miniInfo}>
              <Text style={styles.miniTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.miniArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
            <TouchableOpacity style={styles.miniPlayBtn} onPress={togglePlay}>
              <Text style={styles.miniPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Bottom Navigation Bar */}
        <View style={styles.navBar}>
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'search', label: 'Search', icon: '🔍' },
            { id: 'player', label: 'Player', icon: '🎵' },
            { id: 'playlists', label: 'Library', icon: '📚' },
            { id: 'myra-ai', label: 'Myra AI', icon: '🎙️' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} style={styles.navTab} onPress={() => setActiveTab(tab.id)}>
                <Text style={styles.navIcon}>{tab.icon}</Text>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <AuthModal />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#10131a' },
  mainContainer: { flex: 1, backgroundColor: '#10131a' },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76,215,246,0.2)',
  },
  miniInfo: { flex: 1 },
  miniTitle: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  miniArtist: { color: '#4cd7f6', fontSize: 11, marginTop: 2 },
  miniPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayIcon: { color: '#10131a', fontSize: 14, fontWeight: 'bold' },
  navBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#0d1017',
    borderTopWidth: 1,
    borderTopColor: '#1e2330',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navTab: { alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 16 },
  navLabel: { color: '#8e92a4', fontSize: 10, marginTop: 2 },
  navLabelActive: { color: '#4cd7f6', fontWeight: 'bold' },
});
