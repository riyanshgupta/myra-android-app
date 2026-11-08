import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { PlayerProvider, usePlayer } from './src/context/PlayerContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { PlaylistsScreen } from './src/screens/PlaylistsScreen';
import { MyraAiScreen } from './src/screens/MyraAiScreen';
import { loginApi, registerApi } from './src/services/api';

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = usePlayer();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await loginApi(username.trim().toLowerCase(), pin);
      } else {
        await registerApi(username.trim().toLowerCase(), pin);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Invalid username or PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isAuthModalOpen} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>{isLogin ? 'Sign In' : 'Register'}</Text>

          {error && <Text style={modalStyles.errorText}>{error}</Text>}

          <TextInput
            style={modalStyles.input}
            placeholder="Username"
            placeholderTextColor="#8e92a4"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={modalStyles.input}
            placeholder="6-Digit PIN"
            placeholderTextColor="#8e92a4"
            value={pin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            onChangeText={(t: string) => setPin(t.replace(/\D/g, ''))}
          />

          <TouchableOpacity style={modalStyles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={modalStyles.submitText}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
            <Text style={modalStyles.switchText}>
              {isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setIsAuthModalOpen(false)}>
            <Text style={modalStyles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
    <View style={styles.safeArea}>
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
    backgroundColor: '#10131a',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
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

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: '#1a1d29', borderRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  errorText: { color: '#ff6b6b', fontSize: 12, marginBottom: 12, fontWeight: 'bold' },
  input: { backgroundColor: '#10131a', borderRadius: 12, padding: 12, color: '#ffffff', marginBottom: 12 },
  submitBtn: { backgroundColor: '#4cd7f6', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#10131a', fontWeight: 'bold', fontSize: 14 },
  switchBtn: { marginTop: 12, alignItems: 'center' },
  switchText: { color: '#8e92a4', fontSize: 12 },
  closeBtn: { marginTop: 16, alignItems: 'center' },
  closeText: { color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' },
});
