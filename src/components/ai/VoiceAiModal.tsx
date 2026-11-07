import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';

export const VoiceAiModal: React.FC = () => {
  const { isVoiceAiOpen, setIsVoiceAiOpen, executeVoiceCommand } = usePlayer();
  const [transcript, setTranscript] = useState<string>('Listening for cockpit command...');
  const [isListening, setIsListening] = useState<boolean>(true);

  if (!isVoiceAiOpen) return null;

  const quickCommands = [
    'Play synthwave for highway cruising',
    'Match BPM to night pulse',
    'Queue chill vocalists',
    'Tune acoustic profile to late night driving',
    'Resume playback at 128 BPM',
    'Skip to next track',
  ];

  const handleCommandClick = (cmd: string) => {
    setTranscript(`"${cmd}"`);
    setIsListening(false);
    setTimeout(() => {
      executeVoiceCommand(cmd);
      setIsVoiceAiOpen(false);
    }, 1200);
  };

  const toggleMic = () => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      setTranscript('Listening for cockpit command...');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-low border border-surface-container-high p-6 shadow-2xl flex flex-col gap-5 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-primary-container/25 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-secondary opacity-40 animate-ping" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-[0_0_16px_rgba(76,215,246,0.8)]">
                <span className="material-symbols-outlined text-white text-[18px]">graphic_eq</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  Myra Voice Assistant
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                  "Hey Myra"
                </span>
              </div>
              <p className="text-xs text-secondary font-medium">
                {isListening ? 'Listening live... Speak now' : 'Processing Command...'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVoiceAiOpen(false)}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Pulsing Neural Visualizer Strip */}
        <div className="flex flex-col items-center justify-center py-6 gap-4 bg-surface-container-lowest/80 rounded-2xl border border-surface-container-high/40 relative z-10">
          <div className="flex items-end gap-1.5 h-12">
            {[40, 70, 95, 60, 85, 100, 75, 90, 50, 80, 100, 65, 45].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary transition-all"
                style={{
                  height: isListening ? `${Math.max(12, h * (0.4 + Math.random() * 0.6))}%` : '20%',
                  animation: isListening ? `pulse 1s ease-in-out infinite ${i * 0.08}s` : 'none',
                }}
              />
            ))}
          </div>

          <p className="text-sm font-medium text-on-surface text-center px-4 tracking-wide">
            {transcript}
          </p>

          <button
            onClick={toggleMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
              isListening
                ? 'bg-gradient-to-tr from-primary to-secondary text-surface-container-lowest shadow-[0_0_24px_rgba(76,215,246,0.6)]'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
            title="Tap to toggle microphone"
          >
            <span className="material-symbols-outlined text-2xl">
              {isListening ? 'mic' : 'mic_off'}
            </span>
          </button>
        </div>

        {/* Quick Automotive Driving Prompts */}
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-xs uppercase tracking-wider text-outline font-semibold">
            Suggested Voice Instructions
          </span>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommandClick(cmd)}
                className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-surface-container-highest/60 hover:border-secondary/40 transition-all active:scale-95 text-left"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
