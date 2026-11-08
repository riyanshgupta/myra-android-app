import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';
import { ApiResponse } from '../types/music';

const WAVE_BARS = [18, 35, 55, 80, 100, 65, 85, 95, 70, 90, 60, 80, 100, 75, 50, 65, 40, 25];

export const MyraAiScreen: React.FC = () => {
  const {
    setActiveScreen,
    requestMicPermission,
    executeVoiceCommand,
  } = usePlayer();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveCaption, setLiveCaption] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<
    'idle' | 'listening' | 'pause_detected' | 'sending' | 'completed'
  >('idle');
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [waveformScale, setWaveformScale] = useState<number[]>(WAVE_BARS.map(() => 15));

  const waveTimerRef = useRef<any>(null);
  const streamTimerRef = useRef<any>(null);
  const textInputRef = useRef<TextInput | null>(null);

  // Check microphone permission on screen mount
  useEffect(() => {
    let isMounted = true;
    requestMicPermission().then((granted) => {
      if (isMounted && granted) {
        startListening();
      }
    });

    return () => {
      isMounted = false;
      stopWaveAnimation();
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  const startWaveAnimation = () => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    waveTimerRef.current = setInterval(() => {
      setWaveformScale(
        WAVE_BARS.map((base) => {
          const rand = Math.random() * 0.8 + 0.4;
          return Math.min(100, Math.max(15, base * rand));
        })
      );
    }, 120);
  };

  const stopWaveAnimation = () => {
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    setWaveformScale(WAVE_BARS.map(() => 12));
  };

  const startListening = () => {
    setIsRecording(true);
    setApiStatus('listening');
    setLiveCaption('');
    setFinalTranscript('');
    setApiResponse(null);
    startWaveAnimation();
  };

  const stopListening = () => {
    setIsRecording(false);
    setApiStatus('idle');
    stopWaveAnimation();
  };

  const toggleListening = async () => {
    if (isRecording) {
      stopListening();
    } else {
      const granted = await requestMicPermission();
      if (granted) {
        startListening();
        // Focus input so user can dictate or type immediately
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }
    }
  };

  const handleSimulateVoice = (phrase: string) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    setIsRecording(true);
    setApiStatus('listening');
    setApiResponse(null);
    setLiveCaption('');
    startWaveAnimation();

    const words = phrase.split(' ');
    let currentIdx = 0;

    streamTimerRef.current = setInterval(() => {
      currentIdx++;
      const partial = words.slice(0, currentIdx).join(' ');
      setLiveCaption(partial);

      if (currentIdx >= words.length) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        stopWaveAnimation();
        setApiStatus('pause_detected');

        setTimeout(async () => {
          setApiStatus('sending');
          setFinalTranscript(phrase);
          const res = await executeVoiceCommand(phrase);
          setApiResponse(res);
          setApiStatus('completed');
          setIsRecording(false);
        }, 1200);
      }
    }, 220);
  };

  const handleSendCustom = async () => {
    if (!customText.trim()) return;
    const prompt = customText.trim();
    setCustomText('');
    Keyboard.dismiss();
    handleSimulateVoice(prompt);
  };

  const handleWakeWordTest = () => {
    handleSimulateVoice('Hey Myra, play trending songs');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <Icon name="graphic-eq" size={20} color="#ffffff" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Myra Voice Assistant</Text>
              <View
                style={[
                  styles.statusBadge,
                  isRecording ? styles.statusBadgeActive : styles.statusBadgeReady,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isRecording ? styles.statusBadgeTextActive : styles.statusBadgeTextReady,
                  ]}
                >
                  {isRecording ? 'Listening Active' : 'Ready'}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSub}>
              Speech-to-Music Copilot & Recommendation Engine
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setActiveScreen('home')}
          activeOpacity={0.7}
        >
          <Icon name="close" size={20} color="#cbc3d7" />
        </TouchableOpacity>
      </View>

      {/* 2. Main Voice Stage Card */}
      <View style={styles.stageCard}>
        {/* Status Pill */}
        <View style={styles.statusChip}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  apiStatus === 'listening'
                    ? '#4cd7f6'
                    : apiStatus === 'pause_detected' || apiStatus === 'sending'
                    ? '#a078ff'
                    : apiStatus === 'completed'
                    ? '#10b981'
                    : '#8e92a4',
              },
            ]}
          />
          <Text style={styles.statusChipText}>
            {apiStatus === 'listening' && 'Listening live... Speak or type your request'}
            {apiStatus === 'pause_detected' && 'Pause detected! Silence finished -> Sending to API...'}
            {apiStatus === 'sending' && 'Connecting to Myra AI Backend...'}
            {apiStatus === 'completed' && 'Request fulfilled & queued!'}
            {apiStatus === 'idle' && 'Tap microphone below or say "Hey Myra"'}
          </Text>
        </View>

        {/* Audio Reactive Waveform */}
        <View style={styles.waveformContainer}>
          {waveformScale.map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: `${h}%`,
                  backgroundColor: i % 2 === 0 ? '#4cd7f6' : '#a078ff',
                },
              ]}
            />
          ))}
        </View>

        {/* PROMINENT LIVE CAPTIONS BOX */}
        <View style={styles.captionsBox}>
          <View style={styles.captionsBoxHeader}>
            <View style={styles.captionsTag}>
              <View
                style={[
                  styles.captionsDot,
                  { backgroundColor: isRecording ? '#4cd7f6' : '#8e92a4' },
                ]}
              />
              <Text style={styles.captionsTagText}>LIVE SPEECH CAPTION</Text>
            </View>
            {apiStatus === 'pause_detected' && (
              <View style={styles.pausePill}>
                <Text style={styles.pausePillText}>1.2s Pause Detected</Text>
              </View>
            )}
            {liveCaption.length > 0 && (
              <View style={styles.wordCountPill}>
                <Text style={styles.wordCountText}>
                  {liveCaption.split(/\s+/).filter(Boolean).length} words
                </Text>
              </View>
            )}
          </View>

          <View style={styles.captionsBody}>
            {liveCaption ? (
              <Text style={styles.liveCaptionText}>"{liveCaption}"</Text>
            ) : isRecording ? (
              <Text style={styles.listeningPlaceholder}>
                Listening live... speak now or tap any voice command below
              </Text>
            ) : (
              <Text style={styles.idlePlaceholder}>
                Tap the microphone button below to activate live voice listening
              </Text>
            )}
          </View>
        </View>

        {/* Center Big Microphone Button */}
        <View style={styles.centerMicCol}>
          <TouchableOpacity
            style={[
              styles.centerMicBtn,
              isRecording ? styles.centerMicBtnActive : styles.centerMicBtnIdle,
            ]}
            onPress={toggleListening}
            activeOpacity={0.8}
          >
            <Icon
              name="mic"
              size={36}
              color={isRecording ? '#0b0e17' : '#ffffff'}
            />
          </TouchableOpacity>
          <Text style={styles.micStatusLabel}>
            {isRecording
              ? 'Live Mic Active • Speak or type below'
              : 'Tap to Activate Microphone'}
          </Text>
          <Text style={styles.micSubLabel}>
            Say "Hey Myra" or select a prompt to stream live audio commands
          </Text>
        </View>

        {/* Quick Wake-up Trigger */}
        <TouchableOpacity
          style={styles.wakePill}
          onPress={handleWakeWordTest}
          activeOpacity={0.7}
        >
          <Icon name="bolt" size={14} color="#a078ff" />
          <Text style={styles.wakePillText}>Test "Hey Myra" Wake Word</Text>
        </TouchableOpacity>

        {/* API Response Display Card */}
        {apiResponse && (
          <View style={styles.apiResponseCard}>
            <View style={styles.apiResponseHeader}>
              <View style={styles.apiResponseTitleRow}>
                <View style={styles.apiResponseDot} />
                <Text style={styles.apiResponseTitle}>
                  Backend Result • Queue Updated
                </Text>
              </View>
              <Text style={styles.statusOkText}>Status 200 OK</Text>
            </View>

            <Text style={styles.apiSpeechText}>
              {apiResponse.responseSpeech || apiResponse.message}
            </Text>

            <View style={styles.responsePillsRow}>
              {apiResponse.action && (
                <View style={styles.actionPill}>
                  <Text style={styles.actionPillText}>Action: {apiResponse.action}</Text>
                </View>
              )}
              {apiResponse.suggestedTrackId && (
                <View style={styles.trackPill}>
                  <Text style={styles.trackPillText}>
                    Track: {apiResponse.suggestedTrackId}
                  </Text>
                </View>
              )}
              {finalTranscript ? (
                <Text style={styles.transcriptCaption}>
                  Transcript: "{finalTranscript}"
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </View>

      {/* 3. Text & Voice Dictation Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          ref={textInputRef}
          style={styles.inputField}
          placeholder="Speak or type (e.g. Play synthwave or Pause)..."
          placeholderTextColor="#8e92a4"
          value={customText}
          onChangeText={setCustomText}
          onSubmitEditing={handleSendCustom}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendCustom} activeOpacity={0.8}>
          <Icon name="play-arrow" size={16} color="#0b0e17" />
        </TouchableOpacity>
      </View>

      {/* 4. Quick Voice Prompts */}
      <View style={styles.promptsSection}>
        <View style={styles.promptsHeaderRow}>
          <Text style={styles.promptsHeaderTitle}>
            Quick Voice Prompts (Live Voice & Recommendations)
          </Text>
          <Text style={styles.promptsHeaderSub}>Auto-Pause & Play</Text>
        </View>

        <View style={styles.promptsGrid}>
          {[
            'Play synthwave for highway cruising',
            'Match BPM to night pulse',
            'Queue chill ambient vocalists',
            'Pause current playback',
            'Skip to the next track in queue',
          ].map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.promptCard}
              onPress={() => handleSimulateVoice(prompt)}
              activeOpacity={0.8}
            >
              <View style={styles.promptCardLeft}>
                <Icon name="mic" size={16} color="#4cd7f6" />
                <Text style={styles.promptCardText}>"{prompt}"</Text>
              </View>
              <Icon name="play-arrow" size={14} color="#8e92a4" />
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusBadgeReady: {
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusBadgeTextActive: {
    color: '#10b981',
  },
  statusBadgeTextReady: {
    color: '#d0bcff',
  },
  headerSub: {
    fontSize: 11,
    color: '#4cd7f6',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272a32',
  },
  stageCard: {
    backgroundColor: '#191b23',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#272a32',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e1e2ec',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: 56,
    width: '100%',
    paddingHorizontal: 12,
  },
  waveformBar: {
    width: 6,
    borderRadius: 3,
  },
  captionsBox: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#0b0e17',
    borderWidth: 2,
    borderColor: 'rgba(76, 215, 246, 0.5)',
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  captionsBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#272a32',
  },
  captionsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  captionsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  captionsTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4cd7f6',
    letterSpacing: 1.2,
  },
  pausePill: {
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  pausePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d0bcff',
  },
  wordCountPill: {
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wordCountText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#4cd7f6',
    fontWeight: '600',
  },
  captionsBody: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCaptionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  listeningPlaceholder: {
    fontSize: 12,
    color: 'rgba(76, 215, 246, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  idlePlaceholder: {
    fontSize: 12,
    color: '#8e92a4',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  centerMicCol: {
    alignItems: 'center',
    gap: 6,
  },
  centerMicBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMicBtnActive: {
    backgroundColor: '#4cd7f6',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
  centerMicBtnIdle: {
    backgroundColor: '#272a32',
    borderWidth: 2,
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  micStatusLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e1e2ec',
    marginTop: 4,
    textAlign: 'center',
  },
  micSubLabel: {
    fontSize: 10,
    color: '#8e92a4',
    textAlign: 'center',
  },
  wakePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.35)',
  },
  wakePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d0bcff',
  },
  apiResponseCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.35)',
    padding: 14,
    gap: 6,
  },
  apiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apiResponseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apiResponseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d0bcff',
  },
  apiResponseTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d0bcff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusOkText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  apiSpeechText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e1e2ec',
    lineHeight: 18,
  },
  responsePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  actionPill: {
    backgroundColor: 'rgba(76, 215, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  actionPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4cd7f6',
  },
  trackPill: {
    backgroundColor: '#272a32',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackPillText: {
    fontSize: 10,
    color: '#e1e2ec',
    fontFamily: 'monospace',
  },
  transcriptCaption: {
    fontSize: 10,
    color: '#cbc3d7',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
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
  promptsSection: {
    gap: 8,
  },
  promptsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  promptsHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbc3d7',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  promptsHeaderSub: {
    fontSize: 10,
    color: '#4cd7f6',
    fontFamily: 'monospace',
  },
  promptsGrid: {
    gap: 8,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#191b23',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  promptCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  promptCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e1e2ec',
    flex: 1,
  },
});
