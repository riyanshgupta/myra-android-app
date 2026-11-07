/**
 * Device Telemetry & Time Synchronization Service
 * Provides real hardware battery level via Battery Status API and authoritative
 * network/server synchronized time (independent of client system clock inaccuracies).
 */

class DeviceTelemetryService {
  private serverTimeOffset: number = 0;
  private isTimeSynced: boolean = false;
  private batteryLevel: number | null = null;
  private isCharging: boolean = false;
  private isBatterySupported: boolean = false;
  private timeListeners: Set<(formattedTime: string, isSynced: boolean) => void> = new Set();
  private batteryListeners: Set<(level: number | null, charging: boolean, supported: boolean) => void> = new Set();
  private timerId: number | null = null;

  constructor() {
    this.initTimeSync();
    this.initBattery();
    this.startClockLoop();
  }

  // 1. Authoritative Time Synchronization
  public async initTimeSync() {
    try {
      const t0 = performance.now();
      const res = await fetch('/api/time', { cache: 'no-store' });
      const t1 = performance.now();
      
      if (res.ok) {
        const data = await res.json();
        const latency = (t1 - t0) / 2;
        const authoritativeServerMs = data.epochMs + latency;
        this.serverTimeOffset = authoritativeServerMs - performance.now();
        this.isTimeSynced = true;
        this.notifyTime();
        return;
      }
    } catch (e) {
      console.warn('Local /api/time fetch failed, trying HEAD date header fallback:', e);
    }

    // Fallback: read Date header from server response
    try {
      const t0 = performance.now();
      const headRes = await fetch('/', { method: 'HEAD', cache: 'no-store' });
      const t1 = performance.now();
      const dateHeader = headRes.headers.get('date');
      if (dateHeader) {
        const headerMs = new Date(dateHeader).getTime();
        const latency = (t1 - t0) / 2;
        this.serverTimeOffset = headerMs + latency - performance.now();
        this.isTimeSynced = true;
        this.notifyTime();
        return;
      }
    } catch (fallbackErr) {
      console.warn('Date header fallback failed:', fallbackErr);
    }

    // Fallback to local clock if completely offline
    this.serverTimeOffset = Date.now() - performance.now();
    this.notifyTime();
  }

  // Returns accurate real-world Date independent of user's device system clock
  public getAccurateDate(): Date {
    return new Date(performance.now() + this.serverTimeOffset);
  }

  public getFormattedTime(): string {
    const d = this.getAccurateDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private startClockLoop() {
    this.timerId = window.setInterval(() => {
      this.notifyTime();
    }, 1000);
  }

  public subscribeTime(callback: (formattedTime: string, isSynced: boolean) => void): () => void {
    this.timeListeners.add(callback);
    callback(this.getFormattedTime(), this.isTimeSynced);
    return () => this.timeListeners.delete(callback);
  }

  private notifyTime() {
    const formatted = this.getFormattedTime();
    this.timeListeners.forEach((cb) => cb(formatted, this.isTimeSynced));
  }

  // 2. Real Hardware Battery Status
  public async initBattery() {
    const nav = navigator as any;
    if (nav.getBattery && typeof nav.getBattery === 'function') {
      try {
        const battery = await nav.getBattery();
        this.isBatterySupported = true;
        this.batteryLevel = Math.round(battery.level * 100);
        this.isCharging = battery.charging;
        this.notifyBattery();

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = Math.round(battery.level * 100);
          this.notifyBattery();
        });

        battery.addEventListener('chargingchange', () => {
          this.isCharging = battery.charging;
          this.notifyBattery();
        });
      } catch (err) {
        console.warn('Battery status access rejected:', err);
        this.isBatterySupported = false;
        this.notifyBattery();
      }
    } else {
      // Browser does not support getBattery (e.g. Safari iOS privacy constraint)
      this.isBatterySupported = false;
      this.notifyBattery();
    }
  }

  public subscribeBattery(
    callback: (level: number | null, charging: boolean, supported: boolean) => void
  ): () => void {
    this.batteryListeners.add(callback);
    callback(this.batteryLevel, this.isCharging, this.isBatterySupported);
    return () => this.batteryListeners.delete(callback);
  }

  private notifyBattery() {
    this.batteryListeners.forEach((cb) => cb(this.batteryLevel, this.isCharging, this.isBatterySupported));
  }
}

export const deviceTelemetry = new DeviceTelemetryService();
