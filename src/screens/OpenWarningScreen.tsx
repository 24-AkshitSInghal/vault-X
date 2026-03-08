import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';

interface Props {
  isDark: boolean;
  onYes: () => void;
  onNo: () => void;
  onLogout: () => void;
}

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

const OpenWarningScreen: React.FC<Props> = ({isDark, onYes, onNo, onLogout}) => {
  const C = getTheme(isDark);
  const [logoutModal, setLogoutModal] = React.useState(false);

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <View style={s.topBar}>
        <View style={{width: 40}} />
        <View style={{alignItems: 'center'}}>
          <Image 
            source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')} 
            style={{ width: 200, height: 100, resizeMode: 'contain' }} 
          />
        </View>
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={() => setLogoutModal(true)}>
          <MaterialIcon name="logout-variant" size={16} color={C.subText} />
        </TouchableOpacity>
      </View>

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
                <TouchableOpacity onPress={onLogout} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.danger, fontSize: 13, fontWeight: '800', letterSpacing: 1}}>SIGN OUT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={s.content}>
        <Text style={s.warningText}>WARNING!</Text>
        <Text style={[s.messageText, {color: C.text}]}>OPEN WILL UNLOCK THE DOORS</Text>
        <Text style={[s.messageText, {color: C.text, marginBottom: 70}]}>DO YOU WANT TO CONTINUE?</Text>

        <TouchableOpacity style={[s.btn, {backgroundColor: '#10B981'}]} onPress={onYes} activeOpacity={0.8}>
          <Text style={[s.btnText, {color: '#FFFFFF'}]}>YES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, {backgroundColor: '#EF4444', marginTop: SPACING.md}]} onPress={onNo} activeOpacity={0.8}>
          <Text style={[s.btnText, {color: '#FFFFFF'}]}>NO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {flex: 1},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
           paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm},
  logo: {fontSize: 20, fontWeight: '800', letterSpacing: 4},
  iconBtn: {width: 36, height: 36, borderRadius: 18, alignItems: 'center',
            justifyContent: 'center', borderWidth: 1},
  content: {flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center', paddingBottom: 60},
  warningText: {color: '#F59E0B', fontSize: 24, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginBottom: SPACING.xl},
  messageText: {fontSize: 14, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center', marginBottom: SPACING.md},
  btn: {alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: RADIUS.pill, elevation: 2},
  btnText: {fontSize: 15, fontWeight: '800', letterSpacing: 2},

  // modal
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

export default OpenWarningScreen;
