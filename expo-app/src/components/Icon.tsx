import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export type IconName =
  | 'home'
  | 'search'
  | 'explore'
  | 'play-arrow'
  | 'pause'
  | 'skip-next'
  | 'skip-previous'
  | 'queue-music'
  | 'library-music'
  | 'album'
  | 'mic'
  | 'account-circle'
  | 'favorite'
  | 'favorite-border'
  | 'graphic-eq'
  | 'auto-awesome'
  | 'history'
  | 'close'
  | 'replay-10'
  | 'forward-10'
  | 'shuffle'
  | 'repeat'
  | 'tune'
  | 'bolt'
  | 'directions-car'
  | 'psychology'
  | 'nightlife'
  | 'equalizer'
  | 'logout'
  | 'settings'
  | 'check'
  | 'arrow-back'
  | 'speed'
  | 'lock'
  | 'person';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
}

const MATERIAL_MAP: Record<string, string> = {
  home: 'home',
  search: 'search',
  explore: 'explore',
  'play-arrow': 'play-arrow',
  pause: 'pause',
  'skip-next': 'skip-next',
  'skip-previous': 'skip-previous',
  'queue-music': 'queue-music',
  'library-music': 'library-music',
  album: 'album',
  mic: 'mic',
  'account-circle': 'account-circle',
  favorite: 'favorite',
  'favorite-border': 'favorite-border',
  'graphic-eq': 'graphic-eq',
  'auto-awesome': 'auto-awesome',
  history: 'history',
  close: 'close',
  'replay-10': 'replay-10',
  'forward-10': 'forward-10',
  shuffle: 'shuffle',
  repeat: 'repeat',
  tune: 'tune',
  bolt: 'bolt',
  'directions-car': 'directions-car',
  psychology: 'psychology',
  nightlife: 'nightlife',
  equalizer: 'equalizer',
  logout: 'logout',
  settings: 'settings',
  check: 'check',
  'arrow-back': 'arrow-back',
  speed: 'speed',
  lock: 'lock',
  person: 'person',
};

// Safe unicode/symbol fallback if vector-icons is not loaded or missing glyph
const FALLBACK_SYMBOLS: Record<string, string> = {
  home: '⌂',
  search: '⚲',
  explore: '◎',
  'play-arrow': '▶',
  pause: '❚❚',
  'skip-next': '⏭',
  'skip-previous': '⏮',
  'queue-music': '♬',
  'library-music': '♬',
  album: '◉',
  mic: '🎙',
  'account-circle': '👤',
  favorite: '♥',
  'favorite-border': '♡',
  'graphic-eq': 'ılı',
  'auto-awesome': '✦',
  history: '⟲',
  close: '✕',
  'replay-10': '⟲10',
  'forward-10': '10⟳',
  shuffle: '⇄',
  repeat: '↻',
  tune: '⌥',
  bolt: '⚡',
  'directions-car': '🚗',
  psychology: '🧠',
  nightlife: '🌙',
  equalizer: 'ılı',
  logout: '⇦',
  settings: '⚙',
  check: '✓',
  'arrow-back': '←',
  speed: '⏱',
  lock: '🔒',
  person: '👤',
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#ffffff' }) => {
  try {
    const { MaterialIcons } = require('@expo/vector-icons');
    if (MaterialIcons) {
      const materialName = MATERIAL_MAP[name] || name;
      return <MaterialIcons name={materialName as any} size={size} color={color} />;
    }
  } catch (_) {}

  return (
    <Text
      style={{
        fontSize: size * 0.85,
        color,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: size,
      }}
    >
      {FALLBACK_SYMBOLS[name] || '•'}
    </Text>
  );
};
