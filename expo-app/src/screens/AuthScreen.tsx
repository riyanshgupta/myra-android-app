import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { loginApi, registerApi, getApiBaseUrl, setApiBaseUrl, getHealthApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from '../components/Icon';

export const AuthScreen: React.FC = () => {
  const { setCurrentUser } = usePlayer();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>(getApiBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [serverHealth, setServerHealth] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkServer();
  }, [serverUrl]);

  const checkServer = async () => {
    setServerHealth('checking');
    try {
      await getHealthApi();
      setServerHealth('online');
    } catch (_) {
      setServerHealth('offline');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      setError('Please enter your username.');
      return;
    }

    if (cleanPin.length !== 6) {
      setError('PIN must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginApi(cleanUser, cleanPin);
        setCurrentUser(res.user);
      } else {
        const res = await registerApi(cleanUser, cleanPin);
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServerUrl = () => {
    if (serverUrl.trim()) {
      setApiBaseUrl(serverUrl.trim());
      setShowServerConfig(false);
      checkServer();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ambient Neon Glow effect behind logo */}
        <View style={styles.glowCircle} />

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Icon name="graphic-eq" size={32} color="#ffffff" />
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Myra</Text>
            <View style={styles.neonDot} />
          </View>
          <Text style={styles.brandSubtitle}>Intelligent Music OS</Text>
          <Text style={styles.brandTagline}>
            Stream millions of tracks with lossless audio & AI copilot
          </Text>
        </View>

        {/* Auth Mode Toggle Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, isLogin && styles.tabBtnActive]}
            onPress={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, !isLogin && styles.tabBtnActive]}
            onPress={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBanner}>
              <Icon name="close" size={16} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputRow}>
              <Text style={styles.atPrefix}>@</Text>
              <TextInput
                style={styles.textInput}
                placeholder="username"
                placeholderTextColor="#6b7280"
                value={username}
                onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 6-Digit PIN Input */}
          <View style={styles.inputGroup}>
            <View style={styles.pinHeaderRow}>
              <Text style={styles.inputLabel}>Security PIN</Text>
              <Text style={styles.pinHint}>Exact 6 digits</Text>
            </View>
            <View style={styles.inputRow}>
              <Icon name="lock" size={18} color="#8e92a4" />
              <TextInput
                style={[styles.textInput, { marginLeft: 8 }]}
                placeholder="••••••"
                placeholderTextColor="#6b7280"
                value={pin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                onChangeText={(t) => setPin(t.replace(/\D/g, ''))}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0b0e17" />
            ) : (
              <View style={styles.btnContentRow}>
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In to Myra' : 'Create Myra Account'}
                </Text>
                <Icon name="play-arrow" size={16} color="#0b0e17" />
              </View>
            )}
          </TouchableOpacity>

          {/* Mode Switch Text */}
          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
          >
            <Text style={styles.switchModeText}>
              {isLogin
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Backend Server Status & Settings */}
        <View style={styles.serverSection}>
          <TouchableOpacity
            style={styles.serverPill}
            onPress={() => setShowServerConfig(!showServerConfig)}
          >
            <View
              style={[
                styles.serverStatusDot,
                {
                  backgroundColor:
                    serverHealth === 'online'
                      ? '#10b981'
                      : serverHealth === 'checking'
                      ? '#f59e0b'
                      : '#ef4444',
                },
              ]}
            />
            <Text style={styles.serverText}>
              Backend: {serverHealth === 'online' ? 'Connected' : 'Offline / Checking'}
            </Text>
            <Icon name="settings" size={14} color="#8e92a4" />
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.serverConfigCard}>
              <Text style={styles.serverConfigTitle}>API Base URL Configuration</Text>
              <TextInput
                style={styles.serverInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
                <Text style={styles.saveServerBtnText}>Apply & Reconnect</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0b0e17',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    top: 60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(76, 215, 246, 0.08)',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1b2234',
    borderWidth: 1.5,
    borderColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  neonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4cd7f6',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4cd7f6',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  brandTagline: {
    fontSize: 12,
    color: '#8e92a4',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#151926',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    maxWidth: 340,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#20283c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e92a4',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#131825',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cad0e0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinHint: {
    color: '#8e92a4',
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0f18',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  atPrefix: {
    color: '#4cd7f6',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4cd7f6',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#0b0e17',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  switchModeBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchModeText: {
    color: '#8e92a4',
    fontSize: 12,
    fontWeight: '500',
  },
  serverSection: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131825',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  serverStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  serverText: {
    color: '#8e92a4',
    fontSize: 11,
    fontWeight: '600',
  },
  serverConfigCard: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#151926',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  serverConfigTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  serverInput: {
    backgroundColor: '#0c0f18',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    color: '#4cd7f6',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  saveServerBtn: {
    backgroundColor: '#20283c',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveServerBtnText: {
    color: '#4cd7f6',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
