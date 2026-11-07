import React, { useState, useEffect } from 'react';
import {
  loginApi,
  registerApi,
  getMeApi,
  changePinApi,
  getAuthToken,
  getCurrentUser,
  setAuthToken,
  getApiBaseUrl,
  setApiBaseUrl,
  getHealthApi,
} from '../../services/api';
import { UserResp } from '../../types/music';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthChange }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'settings'>('login');
  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [apiUrl, setApiUrlInput] = useState<string>(getApiBaseUrl());
  const [currentUser, setCurrentUserState] = useState<UserResp | null>(getCurrentUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const user = getCurrentUser();
      const token = getAuthToken();
      if (token && user) {
        setMode('profile');
        setCurrentUserState(user);
      } else if (token) {
        getMeApi()
          .then((u) => {
            setCurrentUserState(u);
            setMode('profile');
          })
          .catch(() => {
            setMode('login');
          });
      } else {
        setMode('login');
      }
      checkHealth();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const checkHealth = async () => {
    try {
      const res = await getHealthApi();
      setHealthStatus(`Connected (${res.status})`);
    } catch (_) {
      setHealthStatus('Offline / Unreachable');
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await loginApi(username.toLowerCase().trim(), pin);
      setCurrentUserState(res.user);
      setSuccessMessage(`Logged in as @${res.user.username}`);
      setMode('profile');
      if (onAuthChange) onAuthChange();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Check username and 6-digit PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!/^[a-z0-9_]{3,30}$/.test(username.toLowerCase().trim())) {
      setErrorMessage('Username must be 3-30 lowercase letters, numbers, or underscores.');
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage('PIN must be exactly 6 digits (e.g. 123456).');
      setLoading(false);
      return;
    }

    try {
      const res = await registerApi(username.toLowerCase().trim(), pin);
      setCurrentUserState(res.user);
      setSuccessMessage(`Account created for @${res.user.username}!`);
      setMode('profile');
      if (onAuthChange) onAuthChange();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!/^\d{6}$/.test(newPin)) {
      setErrorMessage('New PIN must be exactly 6 digits.');
      setLoading(false);
      return;
    }

    try {
      await changePinApi(currentPin, newPin);
      setSuccessMessage('PIN changed successfully!');
      setCurrentPin('');
      setNewPin('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl.trim());
    setSuccessMessage('API Base URL saved!');
    checkHealth();
  };

  const handleLogout = () => {
    setAuthToken(null, null);
    setCurrentUserState(null);
    setSuccessMessage('Signed out');
    setMode('login');
    if (onAuthChange) onAuthChange();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-lg">
                {mode === 'profile' ? 'person' : mode === 'settings' ? 'settings' : 'lock'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {mode === 'login' && 'Account Login'}
                {mode === 'register' && 'Create Account'}
                {mode === 'profile' && 'User Account'}
                {mode === 'settings' && 'API Configuration'}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Backend API: {healthStatus || 'Checking...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'settings' ? (currentUser ? 'profile' : 'login') : 'settings')}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
              title="API Settings"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Mode Tabs if unauthenticated */}
          {!currentUser && mode !== 'settings' && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-container border border-surface-container-high text-xs font-bold">
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && !currentUser && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-outline">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. riyansh_123"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-outline">6-Digit PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs font-mono tracking-widest text-on-surface placeholder-outline focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim() || pin.length !== 6}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-surface-container-lowest font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && !currentUser && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-outline">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. riyansh_123 (3-30 letters/numbers/_)"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-outline">Create 6-Digit PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs font-mono tracking-widest text-on-surface placeholder-outline focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim() || pin.length !== 6}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-surface-container-lowest font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Create Account & Sign In'}
              </button>
            </form>
          )}

          {/* Profile View */}
          {mode === 'profile' && currentUser && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary text-surface-container-lowest flex items-center justify-center font-bold text-lg">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">@{currentUser.username}</h4>
                    <p className="text-[10px] text-outline font-mono mt-0.5">
                      User ID: {currentUser.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

              {/* Change PIN Accordion */}
              <div className="p-4 rounded-2xl bg-surface-container/60 border border-surface-container-high">
                <h5 className="font-bold text-xs text-on-surface mb-3">Change 6-Digit PIN</h5>
                <form onSubmit={handleChangePin} className="flex flex-col gap-2.5">
                  <input
                    type="password"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Current PIN"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs font-mono text-on-surface"
                  />
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="New 6-digit PIN"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs font-mono text-on-surface"
                  />
                  <button
                    type="submit"
                    disabled={loading || currentPin.length !== 6 || newPin.length !== 6}
                    className="w-full py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-xs font-bold text-secondary disabled:opacity-50"
                  >
                    Update PIN
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* API Settings View */}
          {mode === 'settings' && (
            <form onSubmit={handleSaveApiUrl} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-outline">Backend API Domain Base URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrlInput(e.target.value)}
                  placeholder="https://your-backend-domain.com"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-surface-container-highest border border-surface-container-high text-xs font-mono text-on-surface placeholder-outline focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-outline mt-1">
                  Connect to your deployed FastAPI backend domain. Leaves blank to use default host proxy.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container text-xs">
                <span className="text-outline">Health Check Endpoint</span>
                <span className="font-mono text-secondary font-bold">{healthStatus}</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-110 cursor-pointer"
              >
                Save Backend Configuration
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-container-high/50 bg-surface-container-low flex justify-between items-center text-xs text-outline">
          <span>Myra Music API v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
