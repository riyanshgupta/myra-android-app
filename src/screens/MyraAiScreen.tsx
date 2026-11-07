import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { sendAssistantChatApi, sendVoiceQueryApi, ApiResponse } from '../services/api';
import { wakeWordListener } from '../utils/wakeWordListener';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const MyraAiScreen: React.FC = () => {
  const { playTrack, pauseTrack, nextTrack, prevTrack, seekTo, isLandscape, setActiveScreen, queue, trendingTracks } = usePlayer();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveCaption, setLiveCaption] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'listening' | 'pause_detected' | 'sending' | 'completed'>('idle');
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('prompt');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const simIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    wakeWordListener.pause();

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setMicPermissionState(permissionStatus.state as any);
          if (permissionStatus.state === 'granted') {
            startListening();
          }
          permissionStatus.onchange = () => {
            setMicPermissionState(permissionStatus.state as any);
          };
        })
        .catch(() => {
          setMicPermissionState('unknown');
        });
    }

    return () => {
      stopListening();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      wakeWordListener.resume();
    };
  }, []);

  const startListening = async () => {
    wakeWordListener.pause();

    setMicErrorMessage(null);
    setLiveCaption('');
    setFinalTranscript('');
    setApiResponse(null);
    setApiStatus('listening');
    setIsSimulating(false);

    let streamObtained: MediaStream | null = null;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio capture is not supported on this browser.');
      }

      streamObtained = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = streamObtained;
      setMicPermissionState('granted');

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(streamObtained);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(avg);

        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(streamObtained, options);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);
      } catch (recErr) {
        console.warn('MediaRecorder error, speech recognition continues:', recErr);
      }
    } catch (err: any) {
      console.warn('Microphone stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionState('denied');
        setMicErrorMessage(
          'Microphone permission blocked. Click the lock/tune icon in your browser URL bar to allow microphone access.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicErrorMessage('No physical microphone found on your laptop/device.');
      } else if (err.name === 'SecurityError') {
        setMicErrorMessage(
          'Security restriction: The embedded preview blocked mic access. Open preview in a new tab or test using the live simulator.'
        );
      } else {
        setMicErrorMessage(err.message || 'Could not access microphone.');
      }
    }

    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }

      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
          setApiStatus('listening');
        };

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }

          const currentText = fullTranscript.trim();
          if (currentText.length > 0) {
            setLiveCaption(currentText);

            if (pauseTimerRef.current) {
              window.clearTimeout(pauseTimerRef.current);
            }

            setApiStatus('listening');
            pauseTimerRef.current = window.setTimeout(() => {
              handleUserPauseDetected(currentText);
            }, 1200);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setMicPermissionState('denied');
          }
        };

        recognition.onend = () => {
          if (isRecording && apiStatus === 'listening') {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      } catch (e: any) {
        console.warn('SpeechRecognition failed to start:', e);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
      if (!micErrorMessage && streamObtained) {
        setMicErrorMessage(
          'Microphone audio is active, but SpeechRecognition is not natively supported in this browser (Chrome/Edge recommended).'
        );
      }
    }
  };

  const stopListening = () => {
    setIsRecording(false);
    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  const handleUserPauseDetected = async (spokenText: string, syntheticBlob?: Blob) => {
    setApiStatus('pause_detected');
    setFinalTranscript(spokenText);

    stopListening();
    setApiStatus('sending');

    let audioBlob: Blob | null = syntheticBlob || null;
    if (!audioBlob && audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    }

    // Call Assistant Chat API first (or fallback to voice query)
    const assistantResult = await sendAssistantChatApi({
      message: spokenText,
      session: chatSession,
    });

    let response: ApiResponse;

    if (assistantResult) {
      if (assistantResult.session) {
        setChatSession(assistantResult.session);
      }

      response = {
        success: true,
        message: assistantResult.content || 'Processed voice command.',
        responseSpeech: assistantResult.content || 'Executing your request.',
        action: assistantResult.action,
        suggestedTrackId: assistantResult.suggestedTrackId,
      };

      // Perform function_call actions if present
      if (assistantResult.function_call) {
        const fnName = assistantResult.function_call.name;
        const fnArgs = assistantResult.function_call.args || {};
        if (fnName === 'pause') {
          pauseTrack();
        } else if (fnName === 'resume' || fnName === 'play') {
          if (queue.length > 0) playTrack(queue[0]);
        } else if (fnName === 'next') {
          nextTrack();
        } else if (fnName === 'previous') {
          prevTrack();
        } else if (fnName === 'seek_to' && typeof fnArgs.seconds === 'number') {
          seekTo(fnArgs.seconds);
        }
      } else if (assistantResult.song) {
        playTrack(assistantResult.song);
      }
    } else {
      // Fallback to voice endpoint
      response = await sendVoiceQueryApi({
        transcript: spokenText,
        audioBlob,
        timestamp: new Date().toISOString(),
      });
    }

    setApiResponse(response);
    setApiStatus('completed');
    setIsSimulating(false);

    if (response.action === 'play_track' && response.suggestedTrackId) {
      const match = queue.find((t) => t.id === response.suggestedTrackId) || trendingTracks.find((t) => t.id === response.suggestedTrackId);
      if (match) playTrack(match);
    } else if (response.action === 'pause') {
      pauseTrack();
    } else if (response.action === 'next') {
      nextTrack();
    } else if (response.action === 'previous') {
      prevTrack();
    }
  };

  const handleSimulateVoice = (phrase: string) => {
    stopListening();
    setIsSimulating(true);
    setApiStatus('listening');
    setApiResponse(null);
    setLiveCaption('');
    setMicErrorMessage(null);

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    simIntervalRef.current = window.setInterval(() => {
      setMicVolume(Math.floor(30 + Math.random() * 50));
    }, 100);

    const words = phrase.split(' ');
    let currentWordIdx = 0;

    const streamWordsInterval = window.setInterval(() => {
      currentWordIdx++;
      const currentSentence = words.slice(0, currentWordIdx).join(' ');
      setLiveCaption(currentSentence);

      if (currentWordIdx >= words.length) {
        clearInterval(streamWordsInterval);
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setMicVolume(0);

        setApiStatus('pause_detected');

        setTimeout(() => {
          const dummyAudioData = new Uint8Array(44 + 8000);
          const syntheticBlob = new Blob([dummyAudioData], { type: 'audio/wav' });
          handleUserPauseDetected(phrase, syntheticBlob);
        }, 1200);
      }
    }, 250);
  };

  return (
    <div
      className={`w-full ${
        isLandscape
          ? 'max-w-4xl mx-auto px-6 py-4 pb-28 min-h-[calc(100vh-140px)]'
          : 'px-4 pb-36 pt-2 max-w-md mx-auto min-h-[calc(100vh-140px)] select-none'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <span
              className={`absolute inset-0 rounded-full bg-secondary opacity-40 ${
                isRecording || isSimulating ? 'animate-ping' : ''
              }`}
            />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-[0_0_16px_rgba(76,215,246,0.8)]">
              <span className="material-symbols-outlined text-white text-[18px]">graphic_eq</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                Myra Voice Assistant
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isRecording || isSimulating
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-primary/20 text-primary border border-primary/30'
                }`}
              >
                {isRecording || isSimulating ? 'Listening Active' : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-secondary font-medium">
              Real-time speech transcription & auto-pause API dispatch
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveScreen('home')}
          className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Permission & Diagnostic Banner */}
      {micErrorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-surface-container-high/90 border border-secondary/40 text-xs text-on-surface flex flex-col gap-2 shadow-lg">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
              shield_person
            </span>
            <div className="flex-1">
              <p className="font-semibold text-secondary">Microphone Notice</p>
              <p className="text-on-surface-variant text-[11px] mt-0.5">{micErrorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-surface-container-highest">
            <button
              onClick={startListening}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all shadow cursor-pointer"
            >
              Start Live Microphone
            </button>
            <button
              onClick={() => handleSimulateVoice('Play synthwave for highway cruising')}
              className="px-3 py-1.5 rounded-xl bg-surface-container-highest text-secondary text-[11px] font-bold hover:bg-surface-bright active:scale-95 transition-all cursor-pointer"
            >
              Test With Voice Simulation
            </button>
          </div>
        </div>
      )}

      {/* Main Voice Processing Stage */}
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-2xl relative overflow-hidden gap-5">
        <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />

        {/* Status Chip */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-surface-container-high relative z-10 shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              apiStatus === 'listening'
                ? 'bg-secondary animate-pulse'
                : apiStatus === 'pause_detected' || apiStatus === 'sending'
                ? 'bg-primary animate-ping'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-xs font-semibold text-on-surface font-label-md">
            {apiStatus === 'listening' && (isSimulating ? 'Simulating speech... Audio stream active' : 'Listening live... Speak now')}
            {apiStatus === 'pause_detected' && 'Pause detected! Silence finished -> Sending to API...'}
            {apiStatus === 'sending' && 'Packaging audio payload & sending to backend API...'}
            {apiStatus === 'completed' && 'API response received successfully!'}
            {apiStatus === 'idle' && 'Tap microphone below to start speaking'}
          </span>
        </div>

        {/* Live Audio Reactive Waveform */}
        <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-sm px-4 relative z-10">
          {[
            18, 35, 55, 80, 100, 65, 85, 95, 70, 90, 60, 80, 100, 75, 50, 65, 40, 25,
          ].map((barHeight, idx) => {
            const dynamicScale =
              isRecording || isSimulating ? Math.max(15, (micVolume / 50) * barHeight) : 10;
            return (
              <span
                key={idx}
                className="w-2 rounded-full bg-gradient-to-t from-primary-container to-secondary transition-all duration-75"
                style={{
                  height: `${Math.min(100, Math.max(10, dynamicScale))}%`,
                }}
              />
            );
          })}
        </div>

        {/* PROMINENT LIVE CAPTIONS BOX */}
        <div className="w-full rounded-2xl bg-[#0b0e17] border-2 border-secondary/50 p-4 min-h-[110px] flex flex-col justify-between relative z-10 shadow-[0_0_24px_rgba(76,215,246,0.2)]">
          <div className="flex items-center justify-between pb-1 border-b border-surface-container-high/60">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording || isSimulating ? 'bg-secondary animate-ping' : 'bg-outline'}`} />
              <span className="text-[11px] uppercase font-extrabold text-secondary tracking-widest">
                LIVE SPEECH CAPTION
              </span>
            </div>
            {apiStatus === 'pause_detected' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                1.2s Pause Detected
              </span>
            )}
            {liveCaption && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono">
                {liveCaption.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>

          <div className="py-2 flex items-center justify-center text-center flex-1">
            {liveCaption ? (
              <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-relaxed drop-shadow-[0_2px_12px_rgba(76,215,246,0.5)]">
                "{liveCaption}"
              </p>
            ) : isRecording || isSimulating ? (
              <p className="text-xs sm:text-sm font-medium text-secondary/80 italic animate-pulse">
                Listening live... speak now (e.g., "Play synthwave for highway cruising" or "Pause")
              </p>
            ) : (
              <p className="text-xs text-outline italic">
                Tap the microphone button below to start live transcription
              </p>
            )}
          </div>
        </div>

        {/* Center Microphone Button */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          <button
            onClick={isRecording ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              isRecording || isSimulating
                ? 'bg-gradient-to-tr from-primary to-secondary text-surface-container-lowest shadow-[0_0_32px_rgba(76,215,246,0.7)] scale-105'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-bright border-2 border-primary/30'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <span
              className="material-symbols-outlined text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isRecording || isSimulating ? 'mic' : 'mic_none'}
            </span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface font-label-md font-bold">
              {isRecording
                ? 'Live Mic Active • Speak and take a pause to trigger API'
                : isSimulating
                ? 'Simulating Voice Input...'
                : 'Tap to Allow & Start Live Microphone'}
            </span>
            <span className="text-[10px] text-outline mt-0.5">
              Speech is transcribed in real-time above and sent to API on pause
            </span>
          </div>
        </div>

        {/* API Response Display Card */}
        {apiResponse && (
          <div className="w-full rounded-2xl bg-primary-container/15 border border-primary/30 p-4 flex flex-col gap-2 relative z-10 text-left animate-fade-in shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Backend API Result (Payload Dispatched)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Status 200 OK</span>
            </div>

            <p className="text-sm font-semibold text-on-surface">
              {apiResponse.responseSpeech || apiResponse.message}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {apiResponse.action && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-bold">
                  Action: {apiResponse.action}
                </span>
              )}
              {apiResponse.suggestedTrackId && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono">
                  Track: {apiResponse.suggestedTrackId}
                </span>
              )}
              <span className="text-[10px] text-outline ml-auto">
                {finalTranscript ? `Transcript: "${finalTranscript}"` : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Driving Prompts */}
      <div className="mt-6 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-outline">
            Quick Voice Prompts (One-Click Voice & Auto-Pause Simulation)
          </span>
          <span className="text-[10px] text-secondary font-mono">Simulates Live Mic + Auto-Pause</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Play synthwave for highway cruising',
            'Match BPM to night pulse',
            'Queue chill ambient soundscapes',
            'Pause the current playback',
            'Skip to the next track in queue',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSimulateVoice(prompt)}
              className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/50 text-left text-xs font-medium text-on-surface hover:text-primary transition-all active:scale-98 flex items-center justify-between group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">record_voice_over</span>
                <span>"{prompt}"</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary text-base">
                arrow_forward
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
