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
import { sendVoiceAssistantApi } from '../services/api';
import { Icon } from '../components/Icon';

export const MyraAiScreen: React.FC = () => {
  const { playTrack, pauseTrack, nextTrack, prevTrack, queue } = usePlayer();
  const [customText, setCustomText] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [responseMsg, setResponseMsg] = useState<string>('');
  const [lastPrompt, setLastPrompt] = useState<string>('');

  const handlePrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLastPrompt(promptText);
    setStatus('processing');
    setResponseMsg('');

    try {
      const res = await sendVoiceAssistantApi(promptText);
      setStatus('done');
      const speech = res.responseSpeech || res.message || 'Executing your request.';
      setResponseMsg(speech);

      // Perform local client actions based on returned action intent
      if (res.action === 'play_track' && res.suggestedTrackId) {
        const match = queue.find((t) => t.id === res.suggestedTrackId);
        if (match) playTrack(match);
      } else if (res.action === 'pause') {
        pauseTrack();
      } else if (res.action === 'next') {
        nextTrack();
      } else if (res.action === 'prev') {
        prevTrack();
      } else if (promptText.toLowerCase().includes('pause') || promptText.toLowerCase().includes('stop')) {
        pauseTrack();
      } else if (promptText.toLowerCase().includes('next') || promptText.toLowerCase().includes('skip')) {
        nextTrack();
      }
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
        <View style={styles.orbCenter}>
          <Icon name="graphic-eq" size={44} color="#ffffff" />
        </View>
        <View style={styles.orbBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            {status === 'processing' ? 'PROCESSING' : 'LISTENING'}
          </Text>
        </View>
      </View>

      {/* Response Box */}
      {status === 'processing' && (
        <View style={styles.statusBox}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.statusBoxText}>Synthesizing voice intent...</Text>
        </View>
      )}

      {status === 'done' && (
        <View style={styles.responseCard}>
          <View style={styles.responseHeader}>
            <Icon name="auto-awesome" size={16} color="#4cd7f6" />
            <Text style={styles.responseSpeaker}>Myra AI Copilot</Text>
          </View>
          <Text style={styles.responseText}>{responseMsg}</Text>
          <Text style={styles.responsePrompt}>Prompt: "{lastPrompt}"</Text>
        </View>
      )}

      {/* Custom Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          placeholder="Type or speak a music command..."
          placeholderTextColor="#6b7280"
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
        >
          <Icon name="play-arrow" size={18} color="#0b0e17" />
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
    backgroundColor: '#0c0f18',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#8e92a4',
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
    marginBottom: 24,
  },
  orbGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(76, 215, 246, 0.2)',
  },
  orbCenter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1b263b',
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
  orbBadge: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#131825',
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
    letterSpacing: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131825',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.2)',
  },
  statusBoxText: {
    color: '#8e92a4',
    fontSize: 12,
  },
  responseCard: {
    width: '100%',
    backgroundColor: '#131825',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    color: '#ffffff',
    lineHeight: 20,
  },
  responsePrompt: {
    fontSize: 11,
    color: '#8e92a4',
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131825',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  inputField: {
    flex: 1,
    color: '#ffffff',
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
    color: '#cad0e0',
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
    backgroundColor: '#131825',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  promptBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
