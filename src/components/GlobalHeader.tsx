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

  return (
    <View style={[s.topBar, {backgroundColor: 'transparent'}]}>
      {/* Light/Dark Toggle (Left) */}
      <TouchableOpacity
        style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
        onPress={onToggleTheme}
        activeOpacity={0.8}>
        <MaterialIcon name={isDark ? 'weather-sunny' : 'weather-night'} size={18} color={C.subText} />
      </TouchableOpacity>

      {/* Mid Vault Logo (Center) */}
      <View style={s.logoWrapper}>
        {showLogo && (
          <Image 
            source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')} 
            style={s.logoImg} 
          />
        )}
      </View>

      {/* Logout Button (Right) */}
      {showLogout ? (
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={() => setLogoutModal(true)}
          activeOpacity={0.8}>
          <MaterialIcon name="logout-variant" size={16} color={C.subText} />
        </TouchableOpacity>
      ) : (
        <View style={{width: 40}} />
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>
            <View style={{backgroundColor: C.surfaceHigh, paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg }}>
              <Text style={[s.modalTitle, {color: C.text, marginBottom: 0}]}>Sign Out</Text>
            </View>

            <View style={{padding: SPACING.lg}}>
              <Text style={{color: C.subText, fontSize: 13, lineHeight: 22, marginTop: 4, marginBottom: 20}}>
                Are you sure you want to sign out?
              </Text>

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => setLogoutModal(false)} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1}}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setLogoutModal(false);
                    onLogout();
                  }} 
                  activeOpacity={0.7} 
                  style={{paddingVertical: 10, paddingHorizontal: 15}}>
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
  topBar: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  logoImg: {
    marginTop: 30,
    width: 140,
    height: 80,
    resizeMode: 'contain',
  },
  // modal styles
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
    padding: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle:   {fontSize: 15, fontWeight: '700', letterSpacing: 0.5},
  modalActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm},
});
