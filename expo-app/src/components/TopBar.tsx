import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icon';

export const TopBar: React.FC = () => {
  const { currentUser, logout, setActiveScreen } = usePlayer();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <View style={styles.container}>
        {/* Brand Logo & Name */}
        <TouchableOpacity style={styles.brandGroup} onPress={() => setActiveScreen('home')}>
          <View style={styles.logoBadge}>
            <Icon name="graphic-eq" size={16} color="#ffffff" />
          </View>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>Myra</Text>
            <View style={styles.neonDot} />
          </View>
        </TouchableOpacity>

        {/* Telemetry Clock + Battery */}
        <View style={styles.telemetryPill}>
          <Icon name="bolt" size={12} color="#4cd7f6" />
          <Text style={styles.telemetryText}>{currentTime || '12:00 PM'}</Text>
        </View>

        {/* Action Buttons: Search, AI Mic, and Profile */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => setActiveScreen('search')}
          >
            <Icon name="search" size={20} color="#cad0e0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => setActiveScreen('myra-ai')}
          >
            <Icon name="mic" size={20} color="#4cd7f6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => setProfileModalOpen(true)}
          >
            <Icon name="account-circle" size={18} color="#4cd7f6" />
            <Text style={styles.profileText} numberOfLines={1}>
              {currentUser ? currentUser.username : 'User'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile & Logout Dialog Modal */}
      <Modal visible={profileModalOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProfileModalOpen(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.avatarCircle}>
                <Icon name="person" size={28} color="#4cd7f6" />
              </View>
              <Text style={styles.modalUsername}>
                @{currentUser ? currentUser.username : 'user'}
              </Text>
              <Text style={styles.modalRole}>Verified Myra Listener</Text>
            </View>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatVal}>Lossless</Text>
                <Text style={styles.modalStatLabel}>Audio Quality</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStat}>
                <Text style={styles.modalStatVal}>Dolby Atmos</Text>
                <Text style={styles.modalStatLabel}>Spatial Sound</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                setProfileModalOpen(false);
                logout();
              }}
            >
              <Icon name="logout" size={16} color="#ff6b6b" />
              <Text style={styles.logoutBtnText}>Sign Out of Myra</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setProfileModalOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#0c0f18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1b2234',
    borderWidth: 1,
    borderColor: '#4cd7f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4cd7f6',
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131825',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  telemetryText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#cad0e0',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#131825',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#172033',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
    maxWidth: 90,
  },
  profileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4cd7f6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#131825',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.2)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1c2438',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4cd7f6',
    marginBottom: 8,
  },
  modalUsername: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalRole: {
    fontSize: 12,
    color: '#8e92a4',
    marginTop: 2,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0f18',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 20,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalStatVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4cd7f6',
  },
  modalStatLabel: {
    fontSize: 10,
    color: '#8e92a4',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  logoutBtnText: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    paddingVertical: 8,
  },
  closeBtnText: {
    color: '#8e92a4',
    fontSize: 12,
  },
});
