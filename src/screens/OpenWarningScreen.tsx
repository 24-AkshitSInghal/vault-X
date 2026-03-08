import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
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

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <View style={s.topBar}>
        <View style={{width: 40}} />
        <View style={{alignItems: 'center'}}>
          <Image 
            source={require('../../assets/tranperent-icon.png')} 
            style={{ width: 200, height: 100, resizeMode: 'contain' }} 
          />
        </View>
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={onLogout}>
          <MaterialIcon name="logout-variant" size={16} color={C.subText} />
        </TouchableOpacity>
      </View>

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
});

export default OpenWarningScreen;
