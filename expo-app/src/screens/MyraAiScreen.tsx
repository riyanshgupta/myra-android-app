import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { sendVoiceAssistantApi } from '../services/api';

export const MyraAiScreen = () => {
  const { playTrack, queue } = usePlayer();
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [responseMsg, setResponseMsg] = useState<string>('');

  const handlePrompt = async (promptText: string) => {
    setStatus('processing');
    setResponseMsg('');
    const res = await sendVoiceAssistantApi(promptText);
    setStatus('done');
    setResponseMsg(res.responseSpeech || res.message || 'Processed voice command.');
    if (res.action === 'play_track' && res.suggestedTrackId) {
      const match = queue.find((t) => t.id === res.suggestedTrackId);
      if (match) playTrack(match);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Myra Voice Assistant</Text>
      <Text style={styles.subTitle}>Select a quick prompt to dispatch voice command to API:</Text>

      {['Play synthwave for driving', 'Queue chill ambient soundscapes', 'Pause playback'].map((prompt) => (
        <TouchableOpacity key={prompt} style={styles.promptBtn} onPress={() => handlePrompt(prompt)}>
          <Text style={styles.promptText}>"{prompt}"</Text>
        </TouchableOpacity>
      ))}

      {status === 'processing' && (
        <View style={styles.box}>
          <ActivityIndicator size="small" color="#4cd7f6" />
          <Text style={styles.boxText}>Sending command to backend API...</Text>
        </View>
      )}

      {status === 'done' && (
        <View style={styles.box}>
          <Text style={styles.resText}>{responseMsg}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10131a', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subTitle: { fontSize: 12, color: '#8e92a4', marginBottom: 20 },
  promptBtn: {
    backgroundColor: '#1a1d29',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(76,215,246,0.2)',
  },
  promptText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  box: { marginTop: 20, padding: 16, backgroundColor: '#1e2330', borderRadius: 12, alignItems: 'center' },
  boxText: { color: '#8e92a4', fontSize: 12, marginTop: 8 },
  resText: { color: '#4cd7f6', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});
