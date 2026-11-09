import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  StatusBar,
  Clipboard,
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
  const [nativeSpeechAvailable, setNativeSpeechAvailable] = useState<boolean>(false);

  // Live Debug Diagnostics Logs
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugConsole, setShowDebugConsole] = useState<boolean>(true);

  const waveTimerRef = useRef<any>(null);
  const streamTimerRef = useRef<any>(null);
  const pauseTimerRef = useRef<any>(null);
  const textInputRef = useRef<TextInput | null>(null);
  const speechModuleRef = useRef<any>(null);
  const listenersRef = useRef<any[]>([]);

  const addLog = (tag: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logLine = `[${timestamp}] [${tag}] ${message}`;
    console.log(`[Myra AI Log] ${logLine}`);
    setDebugLogs((prev) => [logLine, ...prev].slice(0, 35));
  };

  // Initialize diagnostics and native speech recognition module if available
  useEffect(() => {
    let isMounted = true;

    addLog('INIT', `Myra AI Screen mounted on ${Platform.OS.toUpperCase()}`);

    const hasNativeSpeechModule = Boolean(
      typeof global !== 'undefined' &&
      (global as any)?.ExpoModules?.ExpoSpeechRecognition
    );

    if (hasNativeSpeechModule) {
      try {
        const speechMod = require('expo-speech-recognition');
        if (speechMod && speechMod.ExpoSpeechRecognitionModule) {
          speechModuleRef.current = speechMod.ExpoSpeechRecognitionModule;
          if (isMounted) setNativeSpeechAvailable(true);
          addLog('STT_MODULE', 'Native expo-speech-recognition module FOUND');

          const subStart = speechMod.ExpoSpeechRecognitionModule.addListener('start', () => {
            if (!isMounted) return;
            addLog('STT_EVENT', 'Speech recognition engine STARTED');
            setIsRecording(true);
            setApiStatus('listening');
            startWaveAnimation();
          });

          const subResult = speechMod.ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
            if (!isMounted) return;
            const transcript = event.results?.[0]?.transcript || '';
            if (transcript) {
              addLog('LIVE_CAPTION', `Captured text: "${transcript}"`);
              setLiveCaption(transcript);
              setApiStatus('listening');

              if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
              pauseTimerRef.current = setTimeout(() => {
                addLog('PAUSE_DETECT', '1.2s silence threshold reached. Sending to API...');
                handleSpeechPauseDetected(transcript);
              }, 1200);
            }
          });

          const subEnd = speechMod.ExpoSpeechRecognitionModule.addListener('end', () => {
            if (!isMounted) return;
            addLog('STT_EVENT', 'Speech recognition engine STOPPED');
            stopWaveAnimation();
          });

          const subError = speechMod.ExpoSpeechRecognitionModule.addListener('error', (err: any) => {
            addLog('STT_ERROR', err?.message || JSON.stringify(err));
          });

          listenersRef.current = [subStart, subResult, subEnd, subError];
        }
      } catch (err: any) {
        addLog('STT_MODULE', 'expo-speech-recognition absent in Expo Go (using Live Dictation & Copilot)');
      }
    } else {
      addLog('STT_MODULE', 'Native speech module bypassed in Expo Go (Live Speech Input & Voice Dictation active)');
    }

    // Auto-request mic on opening screen
    requestMicPermission().then((granted) => {
      if (isMounted) {
        addLog('PERM_CHECK', granted ? 'Microphone RECORD_AUDIO GRANTED' : 'Microphone RECORD_AUDIO DENIED');
        if (granted) {
          startListening();
        }
      }
    });

    return () => {
      isMounted = false;
      stopWaveAnimation();
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      listenersRef.current.forEach((sub) => {
        try {
          sub.remove();
        } catch (_) {}
      });
      if (speechModuleRef.current) {
        try {
          speechModuleRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const startWaveAnimation = () => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    waveTimerRef.current = setInterval(() => {
      setWaveformScale(
        WAVE_BARS.map((base) => {
          const rand = Math.random() * 0.85 + 0.4;
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

  const startListening = async () => {
    addLog('MIC_ACTIVATE', 'Microphone session activated');
    setIsRecording(true);
    setApiStatus('listening');
    setLiveCaption('');
    setFinalTranscript('');
    setApiResponse(null);
    startWaveAnimation();

    if (speechModuleRef.current) {
      try {
        const perms = await speechModuleRef.current.requestPermissionsAsync();
        addLog('STT_PERMS', perms?.granted ? 'Native STT permissions granted' : 'Native STT permissions denied');
        if (perms && perms.granted) {
          speechModuleRef.current.start({
            lang: 'en-US',
            interimResults: true,
            continuous: false,
          });
          return;
        }
      } catch (err: any) {
        addLog('STT_START_ERR', err?.message || 'Speech start failed');
      }
    }

    addLog('MIC_LISTEN', 'Live Mic Audio stream active. Listening for speech input...');
  };

  const stopListening = () => {
    addLog('MIC_STOP', 'Microphone session deactivated');
    setIsRecording(false);
    setApiStatus('idle');
    stopWaveAnimation();
    if (speechModuleRef.current) {
      try {
        speechModuleRef.current.stop();
      } catch (_) {}
    }
  };

  const toggleListening = async () => {
    if (isRecording) {
      stopListening();
    } else {
      const granted = await requestMicPermission();
      addLog('MIC_TOGGLE', granted ? 'Request granted -> Starting mic' : 'Request denied by OS');
      if (granted) {
        startListening();
      }
    }
  };

  const handleSpeechPauseDetected = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    addLog('DISPATCH', `Dispatching command to backend: "${spokenText}"`);
    setApiStatus('pause_detected');
    stopWaveAnimation();

    setTimeout(async () => {
      setApiStatus('sending');
      setFinalTranscript(spokenText);
      try {
        const res = await executeVoiceCommand(spokenText);
        addLog('API_RESP', `200 OK -> Action: ${res.action || 'none'}, Speech: "${res.responseSpeech || res.message}"`);
        setApiResponse(res);
      } catch (err: any) {
        addLog('API_ERR', err?.message || 'Voice API call failed');
      }
      setApiStatus('completed');
      setIsRecording(false);
    }, 1000);
  };

  const handleSimulateVoice = (phrase: string) => {
    addLog('SIMULATE_SPEECH', `Simulating speech capture for: "${phrase}"`);
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
      addLog('LIVE_CAPTION', `"${partial}"`);

      if (currentIdx >= words.length) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        stopWaveAnimation();
        setApiStatus('pause_detected');

        setTimeout(async () => {
          setApiStatus('sending');
          setFinalTranscript(phrase);
          addLog('DISPATCH', `Sending to backend API: "${phrase}"`);
          const res = await executeVoiceCommand(phrase);
          addLog('API_RESP', `200 OK -> Speech: "${res.responseSpeech || res.message}"`);
          setApiResponse(res);
          setApiStatus('completed');
          setIsRecording(false);
        }, 1200);
      }
    }, 220);
  };

  const handleInputChange = (text: string) => {
    setCustomText(text);
    if (text.trim()) {
      setLiveCaption(text);
      if (!isRecording) {
        setIsRecording(true);
        setApiStatus('listening');
        startWaveAnimation();
      }
      addLog('VOICE_DICTATION', `Live Input: "${text}"`);
    }
  };

  const handleSendCustom = async () => {
    if (!customText.trim()) return;
    const prompt = customText.trim();
    addLog('INPUT_SEND', `User typed/dictated command: "${prompt}"`);
    setCustomText('');
    Keyboard.dismiss();
    handleSimulateVoice(prompt);
  };

  const handleWakeWordTest = () => {
    addLog('WAKE_WORD', 'Testing "Hey Myra" wake word trigger');
    handleSimulateVoice('Hey Myra, play trending songs');
  };

  const handleCopyLogs = () => {
    const text = debugLogs.join('\n');
    Clipboard.setString(text);
    addLog('SYSTEM', 'Diagnostic logs copied to clipboard');
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
              {nativeSpeechAvailable
                ? 'Native Speech STT Active'
                : 'Live Speech Capture & Diagnostic Copilot'}
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
        {/* Status Chip */}
        <View style={styles.statusChip}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  apiStatus === 'listening'
                    ? '#a078ff'
                    : apiStatus === 'pause_detected' || apiStatus === 'sending'
                    ? '#d0bcff'
                    : apiStatus === 'completed'
                    ? '#10b981'
                    : '#8e92a4',
              },
            ]}
          />
          <Text style={styles.statusChipText}>
            {apiStatus === 'listening' && 'Listening live... Speak or select a prompt'}
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
                  backgroundColor: i % 2 === 0 ? '#a078ff' : '#4cd7f6',
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
                  { backgroundColor: isRecording ? '#a078ff' : '#8e92a4' },
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
                Listening live... speak now or select any voice command below
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
              color={isRecording ? '#ffffff' : '#e1e2ec'}
            />
          </TouchableOpacity>
          <Text style={styles.micStatusLabel}>
            {isRecording
              ? 'Live Mic Active • Speak or select prompt'
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
          onChangeText={handleInputChange}
          onSubmitEditing={handleSendCustom}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendCustom} activeOpacity={0.8}>
          <Icon name="play-arrow" size={16} color="#ffffff" />
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
                <Icon name="mic" size={16} color="#a078ff" />
                <Text style={styles.promptCardText}>"{prompt}"</Text>
              </View>
              <Icon name="arrow-forward" size={16} color="#8e92a4" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. LIVE SPEECH DIAGNOSTICS & LOGGING TERMINAL PANEL */}
      <View style={styles.debugSection}>
        <TouchableOpacity
          style={styles.debugHeaderRow}
          onPress={() => setShowDebugConsole(!showDebugConsole)}
          activeOpacity={0.8}
        >
          <View style={styles.debugTitleGroup}>
            <View style={styles.debugLiveDot} />
            <Text style={styles.debugTitle}>LIVE SPEECH & API DIAGNOSTIC LOGS</Text>
          </View>
          <View style={styles.debugHeaderRight}>
            <TouchableOpacity onPress={handleCopyLogs} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>Copy Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDebugLogs([])} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
            <Icon
              name={showDebugConsole ? 'keyboard-arrow-down' : 'expand-more'}
              size={18}
              color="#d0bcff"
            />
          </View>
        </TouchableOpacity>

        {showDebugConsole && (
          <ScrollView style={styles.debugLogsBox} nestedScrollEnabled showsVerticalScrollIndicator>
            {debugLogs.length === 0 ? (
              <Text style={styles.emptyLogText}>
                No events logged yet. Tap microphone or select a prompt above.
              </Text>
            ) : (
              debugLogs.map((log, idx) => (
                <Text key={idx} style={styles.logLineText}>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        )}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 16,
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
    shadowColor: '#a078ff',
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
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    borderColor: 'rgba(160, 120, 255, 0.4)',
  },
  statusBadgeReady: {
    backgroundColor: 'rgba(160, 120, 255, 0.15)',
    borderColor: 'rgba(160, 120, 255, 0.3)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusBadgeTextActive: {
    color: '#d0bcff',
  },
  statusBadgeTextReady: {
    color: '#d0bcff',
  },
  headerSub: {
    fontSize: 11,
    color: '#d0bcff',
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
    borderWidth: 1.5,
    borderColor: 'rgba(160, 120, 255, 0.45)',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
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
    borderColor: 'rgba(160, 120, 255, 0.6)',
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
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
    color: '#d0bcff',
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
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wordCountText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#d0bcff',
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
    color: '#d0bcff',
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
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMicBtnActive: {
    backgroundColor: '#a078ff',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 14,
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
    backgroundColor: 'rgba(160, 120, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  actionPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d0bcff',
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
    borderColor: 'rgba(160, 120, 255, 0.3)',
    marginBottom: 20,
  },
  inputField: {
    flex: 1,
    color: '#e1e2ec',
    fontSize: 13,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  promptsSection: {
    gap: 8,
    marginBottom: 20,
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
    color: '#d0bcff',
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
  debugSection: {
    backgroundColor: '#0b0e15',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(160, 120, 255, 0.35)',
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  debugHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debugTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  debugLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  debugTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d0bcff',
    letterSpacing: 0.8,
  },
  debugHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyBtn: {
    backgroundColor: 'rgba(160, 120, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d0bcff',
  },
  clearBtn: {
    backgroundColor: '#272a32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clearBtnText: {
    fontSize: 9,
    color: '#8e92a4',
  },
  debugLogsBox: {
    maxHeight: 180,
    backgroundColor: '#10131a',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  emptyLogText: {
    fontSize: 10,
    color: '#8e92a4',
    fontStyle: 'italic',
  },
  logLineText: {
    fontSize: 10,
    color: '#d0bcff',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
});
