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
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (alreadyGranted) {
        AsyncStorage.setItem('myra_mic_granted', 'true').catch(() => {});
        return true;
      }

      const granted = await PermissionsAndroid.request(
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

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      if (isGranted) {
        AsyncStorage.setItem('myra_mic_granted', 'true').catch(() => {});
      }
      return isGranted;
    } catch (err) {
      console.warn('Android Permissions error:', err);
    }
  }

  // Secondary check via expo-audio permission bridge if available
  try {
    const { requestRecordingPermissionsAsync } = require('expo-audio');
    if (requestRecordingPermissionsAsync) {
      const res = await requestRecordingPermissionsAsync();
      if (res && res.granted) {
        AsyncStorage.setItem('myra_mic_granted', 'true').catch(() => {});
        return true;
      }
    }
  } catch (_) {}

  return true;
}

export async function checkMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (has) return true;
    } catch (_) {}
  }
  const cached = await AsyncStorage.getItem('myra_mic_granted');
  return cached === 'true';
}

/**
 * Dispatch Voice Command to Myra AI Backend
 */
export async function processVoiceCommand(commandText: string): Promise<ApiResponse> {
  if (!commandText.trim()) {
    return { success: false, message: 'Please speak or enter a music request.' };
  }

  try {
    const response = await sendVoiceAssistantApi(commandText.trim());
    return response;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not connect to Myra Voice Assistant.',
    };
  }
}
