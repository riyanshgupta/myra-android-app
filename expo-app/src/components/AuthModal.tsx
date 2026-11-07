import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { loginApi, registerApi } from '../services/api';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = usePlayer();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await loginApi(username.trim().toLowerCase(), pin);
      } else {
        await registerApi(username.trim().toLowerCase(), pin);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Invalid username or PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isAuthModalOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{isLogin ? 'Sign In' : 'Register'}</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8e92a4"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="6-Digit PIN"
            placeholderTextColor="#8e92a4"
            value={pin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            onChangeText={(t: string) => setPin(t.replace(/\D/g, ''))}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitText}>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>{isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setIsAuthModalOpen(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: '#1a1d29', borderRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  errorText: { color: '#ff6b6b', fontSize: 12, marginBottom: 12, fontWeight: 'bold' },
  input: { backgroundColor: '#10131a', borderRadius: 12, padding: 12, color: '#ffffff', marginBottom: 12 },
  submitBtn: { backgroundColor: '#4cd7f6', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#10131a', fontWeight: 'bold', fontSize: 14 },
  switchBtn: { marginTop: 12, alignItems: 'center' },
  switchText: { color: '#8e92a4', fontSize: 12 },
  closeBtn: { marginTop: 16, alignItems: 'center' },
  closeText: { color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' },
});
