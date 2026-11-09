import { Platform } from 'react-native';
import { Track } from '../types/music';

let isConfigured = false;
let notificationListenerAdded = false;

let actionHandlers: {
  onTogglePlay?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onCopilot?: () => void;
} = {};

export function setNotificationActionHandlers(handlers: {
  onTogglePlay?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onCopilot?: () => void;
}) {
  actionHandlers = handlers;
}

async function getNotificationsModule() {
  try {
    const mod = require('expo-notifications');
    return mod;
  } catch (_) {
    return null;
  }
}

/**
 * Helper to format seconds as mm:ss
 */
function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Generate a visual text progress bar for Android notification body
 */
function generateTextScrubber(currentSecs: number, durationSecs: number): string {
  const dur = durationSecs > 0 ? durationSecs : 180;
  const cur = Math.max(0, Math.min(dur, currentSecs));
  const totalDots = 12;
  const filledDots = Math.min(totalDots, Math.floor((cur / dur) * totalDots));
  
  let bar = '';
  for (let i = 0; i < totalDots; i++) {
    if (i === filledDots) {
      bar += '●';
    } else if (i < filledDots) {
      bar += '━';
    } else {
      bar += '─';
    }
  }
  return `[${bar}] ${formatTime(cur)} / ${formatTime(dur)}`;
}

/**
 * Configure Android notification channels and action categories
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
        name: 'Myra Media Playback Controls',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0],
        enableLights: true,
        lightColor: '#a078ff',
        enableVibrate: false,
        showBadge: true,
        sound: null,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Register Media Control Action Buttons for Android Notification Panel
      try {
        await Notifications.setNotificationCategoryAsync('media-playback-category', [
          {
            identifier: 'ACTION_TOGGLE_PLAY',
            buttonTitle: '⏯ Play / Pause',
            options: { isAuthenticationRequired: false },
          },
          {
            identifier: 'ACTION_NEXT',
            buttonTitle: '⏭ Skip Next',
            options: { isAuthenticationRequired: false },
          },
          {
            identifier: 'ACTION_PREV',
            buttonTitle: '⏮ Previous',
            options: { isAuthenticationRequired: false },
          },
          {
            identifier: 'ACTION_COPILOT',
            buttonTitle: '🎙 Ask Myra AI',
            options: { isAuthenticationRequired: false },
          },
        ]);
      } catch (_) {}
    }

    // Attach global listener for notification action button clicks
    if (!notificationListenerAdded) {
      notificationListenerAdded = true;
      try {
        Notifications.addNotificationResponseReceivedListener((response: any) => {
          const actionId = response?.actionIdentifier;
          if (actionId === 'ACTION_TOGGLE_PLAY') {
            actionHandlers.onTogglePlay?.();
          } else if (actionId === 'ACTION_NEXT') {
            actionHandlers.onNext?.();
          } else if (actionId === 'ACTION_PREV') {
            actionHandlers.onPrev?.();
          } else if (actionId === 'ACTION_COPILOT') {
            actionHandlers.onCopilot?.();
          }
        });
      } catch (_) {}
    }

    isConfigured = true;
  } catch (err) {
    console.warn('[Myra] Notification channel init notice:', err);
  }
}

/**
 * Present or update the persistent Android playback notification with progress bar and media actions
 */
export async function updatePlaybackNotification(
  track: Track | null,
  isPlaying: boolean,
  currentTimeSecs: number = 0,
  durationSecs: number = 180
) {
  if (!track) {
    await clearPlaybackNotification();
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    await initNotificationService();

    // Request notification permissions on Android 13+ if needed
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const { PermissionsAndroid } = require('react-native');
        const has = await PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS');
        if (!has) {
          await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS', {
            title: 'Myra Music Controls',
            message: 'Display media player controls in notification shade and lock screen.',
            buttonPositive: 'Allow',
          });
        }
      } catch (_) {}
    }

    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) {
      await Notifications.requestPermissionsAsync();
    }

    const progressBarText = generateTextScrubber(currentTimeSecs, durationSecs);
    const statusIcon = isPlaying ? '▶ Now Playing' : '⏸ Paused';
    const bodyContent = `${track.artist} • ${statusIcon}\n${progressBarText}`;

    // Dismiss previous notification to keep single persistent playback card
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (_) {}

    await Notifications.scheduleNotificationAsync({
      content: {
        title: track.title,
        subtitle: 'Myra AI Lossless • 24-bit Atmos',
        body: bodyContent,
        data: { trackId: track.id },
        color: '#a078ff',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android'
          ? {
              channelId: 'myra-playback-channel',
              categoryIdentifier: 'media-playback-category',
              autoDismiss: false,
              sticky: true,
            }
          : {}),
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[Myra] Playback notification update notice:', err);
  }
}

/**
 * Dismiss active playback notification
 */
export async function clearPlaybackNotification() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (_) {}
}

