import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { PlayerProvider, usePlayer } from './src/context/PlayerContext';
import { TopBar } from './src/components/TopBar';
import { MobileNavbar } from './src/components/MobileNavbar';
import { MiniPlayer } from './src/components/MiniPlayer';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { PlaylistsScreen } from './src/screens/PlaylistsScreen';
import { MyraAiScreen } from './src/screens/MyraAiScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { Icon } from './src/components/Icon';

const AppContent: React.FC = () => {
  const { currentUser, isAuthChecking, activeScreen } = usePlayer();

  // 1. Loading splash while initializing AsyncStorage and stored auth
  if (isAuthChecking) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0e17" />
        <View style={styles.splashBadge}>
          <Icon name="graphic-eq" size={36} color="#ffffff" />
        </View>
        <Text style={styles.splashTitle}>Myra</Text>
        <Text style={styles.splashSubtitle}>Intelligent Music OS</Text>
        <ActivityIndicator size="small" color="#4cd7f6" style={styles.splashLoader} />
      </View>
    );
  }

  // 2. Unauthenticated: Render ONLY AuthScreen (no navbars, no player, no main tabs)
  if (!currentUser) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0e17" />
        <AuthScreen />
      </View>
    );
  }

  // 3. Authenticated: Render full application with TopBar, Active Screen, MiniPlayer, and Elevated Navbar
  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'player':
        return <PlayerScreen />;
      case 'playlists':
        return <PlaylistsScreen />;
      case 'myra-ai':
        return <MyraAiScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isPlayerScreen = activeScreen === 'player';

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0c0f18" />

      {/* Top Bar for Mobile */}
      {!isPlayerScreen && <TopBar />}

      {/* Main Screen Content Viewport */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Mini Player (Visible when not on full Player screen) */}
      {!isPlayerScreen && <MiniPlayer />}

      {/* Bottom Navigation Bar (Elevated above Android hardware/gesture nav bar) */}
      <MobileNavbar />
    </View>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#0c0f18',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#0c0f18',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0b0e17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#1b2234',
    borderWidth: 2,
    borderColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4cd7f6',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  splashLoader: {
    marginTop: 28,
  },
});
