import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendVoiceAssistantApi } from './api';
import { ApiResponse } from '../types/music';

/**
 * Native Android + Expo Microphone Permission Handler
 * Checks if already granted first to avoid prompting every time.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (isGranted) {
        await AsyncStorage.setItem('myra_mic_granted', 'true');
        return true;
      }

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Myra Voice Assistant Microphone Access',
          message:
            'Myra needs microphone access to listen for "Hey Myra" and execute voice music commands.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow Microphone',
        }
      );

      const granted = status === PermissionsAndroid.RESULTS.GRANTED;
      await AsyncStorage.setItem('myra_mic_granted', granted ? 'true' : 'false');
      return granted;
    } catch (err) {
      console.warn('Android Permissions error:', err);
    }
  }

  // Secondary check via expo-audio permission bridge if available
  try {
    const { requestRecordingPermissionsAsync } = require('expo-audio');
    if (typeof requestRecordingPermissionsAsync === 'function') {
      const res = await requestRecordingPermissionsAsync();
      const granted = Boolean(res && res.granted);
      await AsyncStorage.setItem('myra_mic_granted', granted ? 'true' : 'false');
      return granted;
    }
  } catch (_) {}

  return false;
}

export async function checkMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      await AsyncStorage.setItem('myra_mic_granted', has ? 'true' : 'false');
      return has;
    } catch (_) {}
  }
  const cached = await AsyncStorage.getItem('myra_mic_granted');
  return cached === 'true';
}

/**
 * Dispatch Voice Command to Myra AI Backend
 */
export async function processVoiceCommand(
  commandText: string,
  metaData?: { current_track_id?: string | null; is_playing?: boolean; position_seconds?: number }
): Promise<ApiResponse & { song?: any }> {
  if (!commandText.trim()) {
    return { success: false, message: 'Please speak or enter a music request.' };
  }

  try {
    const response = await sendVoiceAssistantApi(commandText.trim(), metaData);
    return response;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not connect to Myra Voice Assistant.',
    };
  }
}
