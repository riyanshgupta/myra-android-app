import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icon';

export const TopBar: React.FC = () => {
  const { currentUser, logout, setActiveScreen, requestMicPermission } = usePlayer();
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

  const handleMicPress = async () => {
    await requestMicPermission();
    setActiveScreen('myra-ai');
  };

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
            <Icon name="search" size={18} color="#e1e2ec" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionMicBtn}
            onPress={handleMicPress}
          >
            <Icon name="mic" size={18} color="#4cd7f6" />
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
    backgroundColor: '#10131a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    backgroundColor: '#a078ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a078ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4cd7f6',
    shadowColor: '#4cd7f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  telemetryText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#e1e2ec',
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
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272a32',
  },
  actionMicBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1d1f27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.4)',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1d1f27',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.3)',
    maxWidth: 96,
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
    backgroundColor: '#1d1f27',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.25)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#272a32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4cd7f6',
    marginBottom: 8,
  },
  modalUsername: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e1e2ec',
  },
  modalRole: {
    fontSize: 12,
    color: '#cbc3d7',
    marginTop: 2,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10131a',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#272a32',
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#272a32',
  },
  modalStatVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4cd7f6',
  },
  modalStatLabel: {
    fontSize: 10,
    color: '#cbc3d7',
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
    color: '#cbc3d7',
    fontSize: 12,
  },
});
