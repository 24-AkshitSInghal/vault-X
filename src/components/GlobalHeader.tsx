import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  showLogout?: boolean;
  showLogo?: boolean;
}

export const GlobalHeader: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onLogout,
  showLogout = true,
  showLogo = true,
}) => {
  const C = getTheme(isDark);
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = () => {
    setLogoutModal(false);
    onLogout();
  };

  return (
    <View style={s.container}>
      {/* Top Left: Theme Toggle */}
      <View style={s.sideSlot}>
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={onToggleTheme}
          activeOpacity={0.7}>
          <MaterialIcon
            name={isDark ? 'weather-sunny' : 'weather-night'}
            size={20}
            color={C.subText}
          />
        </TouchableOpacity>
      </View>

      {/* Center: Logo */}
      <View style={s.logoWrapper}>
        {showLogo && (
          <Image
            source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')}
            style={s.logoImg}
          />
        )}
      </View>

      {/* Top Right: Logout */}
      <View style={s.sideSlot}>
        {showLogout ? (
          <TouchableOpacity
            style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
            onPress={() => setLogoutModal(true)}
            activeOpacity={0.7}>
            <MaterialIcon name="logout-variant" size={18} color={C.subText} />
          </TouchableOpacity>
        ) : (
          <View style={s.emptyBox} />
        )}
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>
            <View style={[s.modalHeader, {backgroundColor: C.surfaceHigh}]}>
              <Text style={[s.modalTitle, {color: C.text}]}>Sign Out</Text>
            </View>

            <View style={s.modalBody}>
              <Text style={[s.modalMsg, {color: C.subText}]}>
                Are you sure you want to sign out?
              </Text>

              <View style={s.modalActions}>
                <TouchableOpacity 
                  onPress={() => setLogoutModal(false)} 
                  activeOpacity={0.7} 
                  style={s.modalBtn}>
                  <Text style={{color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1}}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleLogout} 
                  activeOpacity={0.7} 
                  style={s.modalBtn}>
                  <Text style={{color: C.danger, fontSize: 13, fontWeight: '800', letterSpacing: 1}}>SIGN OUT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  sideSlot: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: 140,
    height: 80,
    resizeMode: 'contain',
    marginTop: 25,
  },
  emptyBox: {
    width: 42,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalMsg: {
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});
