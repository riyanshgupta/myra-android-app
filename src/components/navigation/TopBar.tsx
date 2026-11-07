import React, { useEffect, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { deviceTelemetry } from '../../utils/deviceTelemetry';
import { wakeWordListener } from '../../utils/wakeWordListener';

export const TopBar: React.FC = () => {
  const {
    isLandscape,
    orientationMode,
    setOrientationMode,
    setActiveScreen,
    isWakeWordActive,
    toggleWakeWord,
    requestWakeWordPermission,
    triggerSimulatedWakeWord,
    wakeWordToast,
    dismissWakeWordToast,
    currentUser,
    setIsAuthModalOpen,
  } = usePlayer();

  // Authoritative Network Synchronized Time
  const [accurateTime, setAccurateTime] = useState<string>(deviceTelemetry.getFormattedTime());
  const [isTimeSynced, setIsTimeSynced] = useState<boolean>(false);

  // Real Hardware Battery Status
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isBatterySupported, setIsBatterySupported] = useState<boolean>(false);

  useEffect(() => {
    const unsubTime = deviceTelemetry.subscribeTime((timeStr, synced) => {
      setAccurateTime(timeStr);
      setIsTimeSynced(synced);
    });

    const unsubBattery = deviceTelemetry.subscribeBattery((lvl, charging, supported) => {
      setBatteryLevel(lvl);
      setIsCharging(charging);
      setIsBatterySupported(supported);
    });

    return () => {
      unsubTime();
      unsubBattery();
    };
  }, []);

  const handleOrientationToggle = () => {
    if (orientationMode === 'auto') {
      setOrientationMode('portrait');
    } else if (orientationMode === 'portrait') {
      setOrientationMode('landscape');
    } else {
      setOrientationMode('auto');
    }
  };

  const getOrientationLabel = () => {
    if (orientationMode === 'portrait') return '📱 Mobile';
    if (orientationMode === 'landscape') return '💻 Wide Mode';
    return '⚡ Auto Responsive';
  };

  const getBatteryIcon = () => {
    if (isCharging) return 'battery_charging_full';
    if (batteryLevel === null) return 'battery_unknown';
    if (batteryLevel > 90) return 'battery_full';
    if (batteryLevel > 70) return 'battery_6_bar';
    if (batteryLevel > 50) return 'battery_5_bar';
    if (batteryLevel > 30) return 'battery_3_bar';
    if (batteryLevel > 15) return 'battery_2_bar';
    return 'battery_alert';
  };

  return (
    <>
      {/* Toast Notification when "Hey Myra" is triggered */}
      {wakeWordToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-surface-container-lowest font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce cursor-pointer">
          <span className="material-symbols-outlined text-base">mic</span>
          <span>{wakeWordToast}</span>
          <button
            onClick={dismissWakeWordToast}
            className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 ml-1"
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      )}

      {/* Landscape Header */}
      {isLandscape ? (
        <header className="fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/40 shadow-sm select-none">
          <div className="h-16 w-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
            {/* Brand + Clean Streaming Quality */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => setActiveScreen('home')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-lg font-extrabold tracking-tight text-on-surface leading-none">
                    Myra
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant leading-none mt-1">
                    Music
                  </span>
                </div>
              </div>

              {/* Clean Streaming Audio Badge */}
              <div className="hidden lg:flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full border border-surface-container-high/40 shadow-inner">
                <span className="material-symbols-outlined text-secondary text-sm">spatial_audio</span>
                <span className="font-label-md text-xs text-on-surface-variant font-medium">Dolby Atmos</span>
                <span className="text-outline text-xs">•</span>
                <span className="font-label-md text-xs text-secondary font-medium">Spatial Audio</span>
              </div>
            </div>

            {/* Center: Wake Word "Hey Myra" Badge + Test Button + Orientation Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  requestWakeWordPermission();
                  toggleWakeWord();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm cursor-pointer ${
                  isWakeWordActive
                    ? 'bg-secondary/15 text-secondary border-secondary/40 hover:bg-secondary/25'
                    : 'bg-surface-container text-outline border-surface-container-high hover:text-on-surface'
                }`}
                title="Continuous background wake word listener. Speak 'Hey Myra' anytime. Click to toggle & enable mic."
              >
                <span className="material-symbols-outlined text-[15px] animate-pulse">
                  {isWakeWordActive ? 'hearing' : 'hearing_disabled'}
                </span>
                <span>
                  {isWakeWordActive ? 'Listening: "Hey Myra"' : 'Wake Word Paused'}
                </span>
              </button>

              <button
                onClick={() => triggerSimulatedWakeWord('Hey Myra')}
                className="px-2.5 py-1.5 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-[11px] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                title="Simulate speaking 'Hey Myra' to test instant screen opening"
              >
                <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                <span>Test "Hey Myra"</span>
              </button>

              <button
                onClick={handleOrientationToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-primary border border-primary/20 transition-all hover:scale-105 shadow-sm cursor-pointer"
                title="Click to toggle between Mobile and Wide layouts"
              >
                <span className="material-symbols-outlined text-[16px]">devices</span>
                <span>{getOrientationLabel()}</span>
              </button>
            </div>

            {/* Right: Real Hardware Battery, Time & Profile/API Auth */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="hidden sm:flex items-center gap-3 text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container-high/40 shadow-inner"
                title={
                  isTimeSynced
                    ? 'Time synchronized with server atomic clock'
                    : 'Time calculated from server'
                }
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isCharging
                        ? 'text-emerald-400'
                        : batteryLevel && batteryLevel < 20
                        ? 'text-red-400'
                        : 'text-secondary'
                    }`}
                  >
                    {getBatteryIcon()}
                  </span>
                  <span className="font-label-md text-xs text-on-surface font-semibold">
                    {batteryLevel !== null ? `${batteryLevel}%` : isBatterySupported ? '...' : '100%'}
                  </span>
                </div>

                <span className="text-outline/40">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                  <span className="font-label-md text-xs text-on-surface font-mono font-semibold">
                    {accurateTime}
                  </span>
                  {isTimeSynced && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      title="Authoritative network time synchronized"
                    />
                  )}
                </div>
              </div>

              {/* Auth / Account Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-xs text-secondary font-semibold transition-all border border-secondary/20 shadow-sm cursor-pointer"
                title="Manage Account & API Base URL"
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                <span className="hidden md:inline">{currentUser ? currentUser.username : 'Sign In'}</span>
              </button>

              {/* Myra AI Voice Button */}
              <button
                onClick={() => setActiveScreen('myra-ai')}
                className="w-10 h-10 rounded-full bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
                aria-label="Myra AI Assistant"
                title="Open Myra Voice Assistant"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* Portrait Mobile TopBar */
        <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)] shadow-sm border-b border-white/5 select-none">
          <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto">
            {/* Brand Logo & Name */}
            <div
              onClick={() => setActiveScreen('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-base">graphic_eq</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-xl font-bold tracking-tight text-on-surface">
                  Myra
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
              </div>
            </div>

            {/* Quick Actions + Real Device Time & Battery + Auth */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container border border-surface-container-high/40 text-[11px] font-mono">
                <div className="flex items-center gap-1 text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-[13px] text-secondary">
                    {getBatteryIcon()}
                  </span>
                  <span>{batteryLevel !== null ? `${batteryLevel}%` : '100%'}</span>
                </div>
                <span className="text-outline/40">|</span>
                <span className="text-on-surface font-bold">{accurateTime}</span>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Account / Auth API settings"
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
              </button>

              <button
                onClick={() => setActiveScreen('search')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>

              <button
                onClick={() => setActiveScreen('myra-ai')}
                className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                aria-label="Myra AI Voice"
                title="Open Myra AI"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
              </button>
            </div>
          </div>
        </header>
      )}
    </>
  );
};
