import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { deviceTelemetry } from '../../utils/deviceTelemetry';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({ children }) => {
  const { orientationMode, setOrientationMode, isLandscape, activeScreen, setActiveScreen } = usePlayer();
  const [accurateTime, setAccurateTime] = React.useState<string>(deviceTelemetry.getFormattedTime());
  const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null);
  const [isCharging, setIsCharging] = React.useState<boolean>(false);

  React.useEffect(() => {
    const unsubTime = deviceTelemetry.subscribeTime((timeStr) => setAccurateTime(timeStr));
    const unsubBattery = deviceTelemetry.subscribeBattery((lvl, charging) => {
      setBatteryLevel(lvl);
      setIsCharging(charging);
    });
    return () => {
      unsubTime();
      unsubBattery();
    };
  }, []);

  const getBatteryIcon = () => {
    if (isCharging) return 'battery_charging_full';
    if (batteryLevel === null) return 'battery_full';
    if (batteryLevel > 80) return 'battery_full';
    if (batteryLevel > 50) return 'battery_5_bar';
    if (batteryLevel > 20) return 'battery_3_bar';
    return 'battery_alert';
  };

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-[#e1e2ec] flex flex-col items-center justify-start relative overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Emulator Control Header */}
      <header className="w-full bg-[#0d1017] border-b border-surface-container-high/60 px-4 py-2.5 z-50 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-lg">android</span>
            <span className="font-extrabold text-on-surface tracking-wide">
              Android OS Emulator
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
            Android 14 • API 34
          </span>
        </div>

        {/* Orientation & View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOrientationMode('portrait')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              orientationMode === 'portrait'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">smartphone</span>
            <span>Android Phone</span>
          </button>

          <button
            onClick={() => setOrientationMode('landscape')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              orientationMode === 'landscape'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">directions_car</span>
            <span>Android Auto (Automotive)</span>
          </button>
        </div>
      </header>

      {/* Emulator Workspace Canvas */}
      <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
        {orientationMode === 'portrait' ? (
          /* Android Phone Hardware Shell (Pixel 8 Pro / Galaxy S24) */
          <div className="relative w-full max-w-[412px] h-[840px] bg-[#090b10] rounded-[48px] border-[10px] border-[#1e2330] shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/10 my-auto">
            {/* Camera Punch Hole & Ear Speaker */}
            <div className="absolute top-0 inset-x-0 h-7 z-50 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-black border border-white/10 shadow-inner" />
            </div>

            {/* Native Android Status Bar */}
            <div className="h-8 bg-[#090b10]/95 backdrop-blur-md px-6 flex items-center justify-between text-[11px] font-semibold text-on-surface z-40 shrink-0 border-b border-white/5 select-none pt-1">
              <span className="font-mono text-xs font-bold text-on-surface">{accurateTime}</span>

              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="text-[10px] font-bold text-secondary font-mono">5G</span>
                <span className="material-symbols-outlined text-xs">wifi</span>
                <div className="flex items-center gap-0.5 text-on-surface">
                  <span className="material-symbols-outlined text-xs text-emerald-400">
                    {getBatteryIcon()}
                  </span>
                  <span className="text-[10px] font-mono font-bold">
                    {batteryLevel !== null ? `${batteryLevel}%` : '100%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Android Screen Viewport */}
            <div className="flex-1 w-full overflow-hidden relative flex flex-col bg-[#10131a]">
              {children}
            </div>

            {/* Native Android Bottom Gesture Pill Bar */}
            <div className="h-5 bg-[#090b10] flex items-center justify-center z-40 shrink-0 select-none pb-1">
              <div
                onClick={() => setActiveScreen('home')}
                className="w-32 h-1 bg-white/40 hover:bg-white/70 rounded-full cursor-pointer transition-colors"
                title="Android Home Gesture Bar"
              />
            </div>
          </div>
        ) : (
          /* Android Auto Car Head Unit Cockpit Shell (16:9 Automotive Display) */
          <div className="relative w-full max-w-[1400px] min-h-[750px] bg-[#090b10] rounded-[32px] border-[12px] border-[#1b202e] shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-white/10 my-auto">
            {/* Automotive Status Bar */}
            <div className="h-9 bg-[#0d1017] px-6 flex items-center justify-between text-xs font-semibold text-on-surface z-40 shrink-0 border-b border-white/10 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                  <span className="material-symbols-outlined text-base">directions_car</span>
                  Android Auto Cockpit
                </span>
                <span className="text-outline/40">|</span>
                <span className="text-secondary text-[11px] font-mono">Spatial Audio Active</span>
              </div>

              <div className="flex items-center gap-4 text-on-surface-variant">
                <div className="flex items-center gap-1 text-on-surface">
                  <span className="material-symbols-outlined text-sm text-emerald-400">
                    {getBatteryIcon()}
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {batteryLevel !== null ? `${batteryLevel}%` : '100%'}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-primary">{accurateTime}</span>
              </div>
            </div>

            {/* Android Auto Head Unit Content */}
            <div className="flex-1 w-full overflow-hidden relative flex flex-col bg-[#10131a]">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
