import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icon';

export const MobileNavbar: React.FC = () => {
  const { activeScreen, setActiveScreen, isPlaying } = usePlayer();

  return (
    <View style={styles.navContainer}>
      <View style={styles.navInner}>
        {/* Item 1: Home */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveScreen('home')}
          activeOpacity={0.7}
        >
          <Icon
            name="home"
            size={22}
            color={activeScreen === 'home' ? '#d0bcff' : '#958ea0'}
          />
          <Text
            style={[
              styles.navLabel,
              activeScreen === 'home' && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Item 2: Search */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveScreen('search')}
          activeOpacity={0.7}
        >
          <Icon
            name="explore"
            size={22}
            color={activeScreen === 'search' ? '#d0bcff' : '#958ea0'}
          />
          <Text
            style={[
              styles.navLabel,
              activeScreen === 'search' && styles.navLabelActive,
            ]}
          >
            Search
          </Text>
        </TouchableOpacity>

        {/* Center Raised Myra AI Trigger */}
        <View style={styles.centerButtonWrapper}>
          <TouchableOpacity
            style={[
              styles.centerButton,
              activeScreen === 'myra-ai' && styles.centerButtonActive,
            ]}
            onPress={() => setActiveScreen('myra-ai')}
            activeOpacity={0.8}
          >
            <Icon name="graphic-eq" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Item 4: Library / Playlists */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveScreen('playlists')}
          activeOpacity={0.7}
        >
          <Icon
            name="queue-music"
            size={22}
            color={activeScreen === 'playlists' ? '#d0bcff' : '#958ea0'}
          />
          <Text
            style={[
              styles.navLabel,
              activeScreen === 'playlists' && styles.navLabelActive,
            ]}
          >
            Library
          </Text>
        </TouchableOpacity>

        {/* Item 5: Player */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveScreen('player')}
          activeOpacity={0.7}
        >
          <View style={styles.playerIconContainer}>
            <Icon
              name="album"
              size={22}
              color={activeScreen === 'player' ? '#d0bcff' : '#958ea0'}
            />
            {isPlaying && <View style={styles.playingIndicatorDot} />}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeScreen === 'player' && styles.navLabelActive,
            ]}
          >
            Player
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#10131a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'android' ? 24 : 14,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 52,
    paddingHorizontal: 8,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    minHeight: 46,
    gap: 3,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#958ea0',
  },
  navLabelActive: {
    color: '#d0bcff',
    fontWeight: '800',
  },
  centerButtonWrapper: {
    position: 'relative',
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a078ff',
    borderWidth: 2,
    borderColor: '#d0bcff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  centerButtonActive: {
    backgroundColor: '#d0bcff',
    borderColor: '#ffffff',
    shadowColor: '#d0bcff',
  },
  playerIconContainer: {
    position: 'relative',
  },
  playingIndicatorDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#a078ff',
    borderWidth: 1,
    borderColor: '#10131a',
  },
});
