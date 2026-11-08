import React from 'react';
import { View, StyleSheet } from 'react-native';

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
  | 'lock'
  | 'person';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
}

// Exact Google Material Symbols SVG Path definitions (24x24 viewBox)
const SVG_PATHS: Record<string, string> = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  search:
    'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  explore:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z',
  'play-arrow': 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  'skip-next': 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
  'skip-previous': 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
  'queue-music':
    'M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z',
  'library-music':
    'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z',
  album:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z',
  mic: 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z',
  'account-circle':
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  person:
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  favorite:
    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  'favorite-border':
    'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
  'graphic-eq': 'M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z',
  'auto-awesome':
    'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
  'directions-car':
    'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  psychology:
    'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM12 18c-2.21 0-4-1.79-4-4 0-1.57.91-2.92 2.23-3.57.37-.18.77-.3 1.2-.36.19-.03.38-.07.57-.07s.38.04.57.07c.43.06.83.18 1.2.36C15.09 11.08 16 12.43 16 14c0 2.21-1.79 4-4 4z',
  bolt: 'M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C13.56 16.03 11 21 11 21z',
  nightlife:
    'M1 21h14v2H1zM18.5 5V1h-2v4.06c-1.73.54-3 2.14-3 4.04 0 2.33 1.89 4.22 4.22 4.22.42 0 .82-.07 1.2-.18V17c0 1.66-1.34 3-3 3-1.66 0-3-1.34-3-3s1.34-3 3-3c.35 0 .69.06 1 .17V12.1c-.32-.06-.66-.1-1-.1-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5V7h1V5h-2.42z',
  equalizer: 'M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z',
  'replay-10':
    'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.59l1.8-.63h.06V16zm4.29-1.83c0 .59-.14 1.05-.42 1.36-.28.32-.67.47-1.17.47-.51 0-.91-.16-1.19-.47-.28-.32-.42-.77-.42-1.36v-1.34c0-.59.14-1.04.42-1.35.28-.31.68-.47 1.19-.47.5 0 .89.16 1.17.47.28.31.42.76.42 1.35v1.34zm-.89-1.47c0-.44-.07-.76-.2-.96-.13-.2-.34-.3-.61-.3-.27 0-.47.1-.6.3-.13.2-.2.52-.2.96v1.6c0 .44.07.76.2.96.13.2.33.3.6.3.27 0 .48-.1.61-.3.13-.2.2-.52.2-.96v-1.6z',
  'forward-10':
    'M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.59l1.8-.63h.06V16zm4.29-1.83c0 .59-.14 1.05-.42 1.36-.28.32-.67.47-1.17.47-.51 0-.91-.16-1.19-.47-.28-.32-.42-.77-.42-1.36v-1.34c0-.59.14-1.04.42-1.35.28-.31.68-.47 1.19-.47.5 0 .89.16 1.17.47.28.31.42.76.42 1.35v1.34zm-.89-1.47c0-.44-.07-.76-.2-.96-.13-.2-.34-.3-.61-.3-.27 0-.47.1-.6.3-.13.2-.2.52-.2.96v1.6c0 .44.07.76.2.96.13.2.33.3.6.3.27 0 .48-.1.61-.3.13-.2.2-.52.2-.96v-1.6z',
  'arrow-back': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  close:
    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  settings:
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  logout:
    'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  shuffle:
    'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.42l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.12z',
  repeat:
    'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#ffffff' }) => {
  const pathData = SVG_PATHS[name] || SVG_PATHS['album'];

  // 1. Try rendering genuine crisp vector SVG via react-native-svg (built into Expo Go)
  try {
    const RNSvg = require('react-native-svg');
    if (RNSvg && RNSvg.Svg && RNSvg.Path) {
      const { Svg, Path } = RNSvg;
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={{ width: size, height: size }}>
          <Path d={pathData} fill={color} />
        </Svg>
      );
    }
  } catch (_) {}

  // 2. Try @expo/vector-icons MaterialIcons as native secondary bridge
  try {
    const { MaterialIcons } = require('@expo/vector-icons');
    if (MaterialIcons) {
      const iconMap: Record<string, string> = {
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
        person: 'person',
        favorite: 'favorite',
        'favorite-border': 'favorite-border',
        'graphic-eq': 'graphic-eq',
        'auto-awesome': 'auto-awesome',
        'directions-car': 'directions-car',
        psychology: 'psychology',
        bolt: 'bolt',
        nightlife: 'nightlife',
        equalizer: 'equalizer',
        'replay-10': 'replay-10',
        'forward-10': 'forward-10',
        'arrow-back': 'arrow-back',
        close: 'close',
        tune: 'tune',
        settings: 'settings',
        logout: 'logout',
        lock: 'lock',
        check: 'check',
        shuffle: 'shuffle',
        repeat: 'repeat',
      };
      const materialName = iconMap[name] || 'circle';
      return <MaterialIcons name={materialName as any} size={size} color={color} />;
    }
  } catch (_) {}

  // 3. Guaranteed Pure Vector Geometry Fallback (NO EMOJIS! Clean geometric shapes only)
  if (name === 'play-arrow') {
    return (
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: size * 0.4,
          borderBottomWidth: size * 0.4,
          borderLeftWidth: size * 0.65,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: color,
          marginLeft: size * 0.1,
        }}
      />
    );
  }

  if (name === 'pause') {
    return (
      <View style={{ flexDirection: 'row', gap: size * 0.2, alignItems: 'center' }}>
        <View style={{ width: size * 0.22, height: size * 0.7, backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: size * 0.22, height: size * 0.7, backgroundColor: color, borderRadius: 2 }} />
      </View>
    );
  }

  if (name === 'skip-next') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: size * 0.35,
            borderBottomWidth: size * 0.35,
            borderLeftWidth: size * 0.5,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: color,
          }}
        />
        <View style={{ width: size * 0.15, height: size * 0.7, backgroundColor: color, borderRadius: 1 }} />
      </View>
    );
  }

  if (name === 'skip-previous') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <View style={{ width: size * 0.15, height: size * 0.7, backgroundColor: color, borderRadius: 1 }} />
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: size * 0.35,
            borderBottomWidth: size * 0.35,
            borderRightWidth: size * 0.5,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderRightColor: color,
          }}
        />
      </View>
    );
  }

  // Equalizer / graphic-eq geometric fallback
  if (name === 'graphic-eq' || name === 'equalizer') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: size * 0.8 }}>
        <View style={{ width: 2.5, height: size * 0.45, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2.5, height: size * 0.8, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2.5, height: size * 0.55, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2.5, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
      </View>
    );
  }

  // Generic rounded shape
  return (
    <View
      style={{
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: size * 0.3,
        borderWidth: 2,
        borderColor: color,
      }}
    />
  );
};
