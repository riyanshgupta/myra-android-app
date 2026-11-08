import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { sendVoiceAssistantApi } from './api';
import { ApiResponse } from '../types/music';

let isMicrophoneGranted = false;

/**
 * Native Android + Expo Microphone Permission Handler
 * Guaranteed to trigger the official Android OS system permission modal:
 * "Allow Myra to record audio?"
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  // 1. Android Native Permission Request
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Myra Voice Assistant Microphone Access',
          message:
            'Myra needs microphone access to listen for "Hey Myra" and execute your voice music commands.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow Microphone',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        isMicrophoneGranted = true;
        return true;
      }
    } catch (err) {
      console.warn('Android Permissions error:', err);
    }
  }

  // 2. Secondary check via expo-audio permission bridge if available
  try {
    const { requestRecordingPermissionsAsync } = require('expo-audio');
    if (requestRecordingPermissionsAsync) {
      const res = await requestRecordingPermissionsAsync();
      if (res && res.granted) {
        isMicrophoneGranted = true;
        return true;
      }
    }
  } catch (_) {}

  return isMicrophoneGranted;
}

export async function checkMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (has) isMicrophoneGranted = true;
      return has;
    } catch (_) {}
  }
  return isMicrophoneGranted;
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
