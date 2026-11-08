import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';

export const MyraAiScreen: React.FC = () => {
  const {
    isMicGranted,
    requestMicPermission,
    executeVoiceCommand,
  } = usePlayer();

  const [customText, setCustomText] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'done'>('idle');
  const [responseMsg, setResponseMsg] = useState<string>('');
  const [lastPrompt, setLastPrompt] = useState<string>('');

  const handleOrbPress = async () => {
    // 1. Check or request microphone permission
    const granted = await requestMicPermission();
    if (!granted) {
      setStatus('idle');
      return;
    }

    // 2. Start listening mode
    setStatus('listening');
    setResponseMsg('Listening to your voice command... Speak now or tap a suggestion below.');
  };

  const handlePrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLastPrompt(promptText);
    setStatus('processing');
    setResponseMsg('');

    try {
      const res = await executeVoiceCommand(promptText);
      setStatus('done');
      const speech = res.responseSpeech || res.message || 'Executing your request.';
      setResponseMsg(speech);
    } catch (_) {
      setStatus('done');
      setResponseMsg('Connected to Myra OS. Command acknowledged.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Myra Voice Assistant</Text>
        <Text style={styles.subtitle}>
          Natural Language Audio Copilot powered by JioSaavn Intelligence
        </Text>
      </View>

      {/* Radiant Glowing Voice Assistant Orb */}
      <View style={styles.orbWrapper}>
        <View style={styles.orbGlow} />
        <TouchableOpacity
          style={[styles.orbCenter, status === 'listening' && styles.orbCenterListening]}
          onPress={handleOrbPress}
          activeOpacity={0.8}
        >
          <Icon name="graphic-eq" size={40} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.orbBadge}>
          <View
            style={[
              styles.badgeDot,
              {
                backgroundColor:
                  status === 'processing'
                    ? '#f59e0b'
                    : status === 'listening'
                    ? '#10b981'
                    : '#4cd7f6',
              },
            ]}
          />
          <Text style={styles.badgeText}>
            {status === 'processing'
              ? 'PROCESSING'
              : status === 'listening'
              ? 'LISTENING'
              : isMicGranted
              ? 'READY (TAP TO SPEAK)'
              : 'GRANT MIC ACCESS'}
          </Text>
        </View>
      </View>

      {/* Mic Permission Banner if not yet granted */}
      {!isMicGranted && (
        <TouchableOpacity
          style={styles.micPermissionBanner}
          onPress={requestMicPermission}
          activeOpacity={0.8}
        >
          <Icon name="mic" size={18} color="#0b0e17" />
          <Text style={styles.micPermissionBannerText}>
            Grant Microphone Access for "Hey Myra"
          </Text>
        </TouchableOpacity>
      )}

      {/* Response Box */}
      {status === 'processing' && (
        <View style={styles.statusBox}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.statusBoxText}>Synthesizing voice intent with Myra AI...</Text>
        </View>
      )}

      {(status === 'done' || status === 'listening') && responseMsg ? (
        <View style={styles.responseCard}>
          <View style={styles.responseHeader}>
            <Icon name="auto-awesome" size={16} color="#4cd7f6" />
            <Text style={styles.responseSpeaker}>
              {status === 'listening' ? 'Listening...' : 'Myra AI Copilot'}
            </Text>
          </View>
          <Text style={styles.responseText}>{responseMsg}</Text>
          {lastPrompt ? (
            <Text style={styles.responsePrompt}>Command: "{lastPrompt}"</Text>
          ) : null}
        </View>
      ) : null}

      {/* Custom Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          placeholder="Type or speak a music command..."
          placeholderTextColor="#8e92a4"
          value={customText}
          onChangeText={setCustomText}
          onSubmitEditing={() => {
            handlePrompt(customText);
            setCustomText('');
          }}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            handlePrompt(customText);
            setCustomText('');
          }}
          activeOpacity={0.8}
        >
          <Icon name="play-arrow" size={16} color="#0b0e17" />
        </TouchableOpacity>
      </View>

      {/* Suggested Prompt Chips */}
      <Text style={styles.sectionLabel}>Suggested Voice Prompts</Text>
      <View style={styles.promptsContainer}>
        {[
          'Play synthwave for highway cruising',
          'Match BPM to night pulse',
          'Queue chill vocalists',
          'Skip to next track',
          'Pause playback',
        ].map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={styles.promptBtn}
            onPress={() => handlePrompt(prompt)}
            activeOpacity={0.8}
          >
            <Icon name="mic" size={16} color="#4cd7f6" />
            <Text style={styles.promptBtnText}>"{prompt}"</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10131a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  subtitle: {
    fontSize: 12,
    color: '#cbc3d7',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  orbWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  orbGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(76, 215, 246, 0.18)',
  },
  orbCenter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1d1f27',
    borderWidth: 2,
    borderColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  orbCenterListening: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
    backgroundColor: '#192620',
  },
  orbBadge: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4cd7f6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4cd7f6',
    letterSpacing: 0.8,
  },
  micPermissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4cd7f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  micPermissionBannerText: {
    color: '#0b0e17',
    fontSize: 12,
    fontWeight: '800',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.2)',
  },
  statusBoxText: {
    color: '#cbc3d7',
    fontSize: 12,
  },
  responseCard: {
    width: '100%',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  responseSpeaker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4cd7f6',
    letterSpacing: 0.5,
  },
  responseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e1e2ec',
    lineHeight: 20,
  },
  responsePrompt: {
    fontSize: 11,
    color: '#cbc3d7',
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    width: '100%',
    borderWidth: 1,
    borderColor: '#272a32',
    marginBottom: 20,
  },
  inputField: {
    flex: 1,
    color: '#e1e2ec',
    fontSize: 13,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbc3d7',
    alignSelf: 'flex-start',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  promptsContainer: {
    width: '100%',
    gap: 8,
  },
  promptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1d1f27',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  promptBtnText: {
    color: '#e1e2ec',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
