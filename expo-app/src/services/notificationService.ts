import { Platform } from 'react-native';
import { Track } from '../types/music';

let isConfigured = false;

async function getNotificationsModule() {
  try {
    const mod = require('expo-notifications');
    return mod;
  } catch (_) {
    return null;
  }
}

/**
 * Configure Android notification channels for low-latency, silent media display
 */
export async function initNotificationService() {
  if (isConfigured) return;
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('myra-playback-channel', {
        name: 'Myra Media Playback',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0],
        enableLights: false,
        enableVibrate: false,
        showBadge: false,
        sound: null,
      });
    }
    isConfigured = true;
  } catch (err) {
    console.warn('[Myra] Notification channel init notice:', err);
  }
}

/**
 * Present or update the persistent Android playback notification in the drawer
 */
export async function updatePlaybackNotification(track: Track | null, isPlaying: boolean) {
  if (!track) {
    await clearPlaybackNotification();
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    await initNotificationService();

    // Check / request notification permissions on Android 13+
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) {
      await Notifications.requestPermissionsAsync();
    }

    // Dismiss previous notification to avoid duplicates
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (_) {}

    await Notifications.scheduleNotificationAsync({
      content: {
        title: track.title,
        body: `${track.artist} • ${isPlaying ? 'Now Playing' : 'Paused'}`,
        data: { trackId: track.id },
        color: '#4cd7f6',
        priority: Notifications.AndroidNotificationPriority.LOW,
        // Android specific parameters
        ...(Platform.OS === 'android'
          ? {
              channelId: 'myra-playback-channel',
              autoDismiss: false,
              sticky: isPlaying,
            }
          : {}),
      },
      trigger: null, // immediate display
    });
  } catch (err) {
    console.warn('[Myra] Playback notification update notice:', err);
  }
}

/**
 * Dismiss all active playback notifications
 */
export async function clearPlaybackNotification() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (_) {}
}
