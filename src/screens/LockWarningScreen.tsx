import React, {useRef, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Image, Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {FlowType} from '../constants/credentials';
import {GlobalHeader} from '../components/GlobalHeader';

// ── Pulsing dot (shared visual) ───────────────────────────────────────────────
const PulsingDot = () => {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: 1.35, duration: 700, useNativeDriver: true}),
        Animated.timing(anim, {toValue: 1,    duration: 700, useNativeDriver: true}),
      ])
    ).start();
  }, [anim]);
  return (
    <View style={dot.wrapper}>
      <Animated.View style={[dot.outer, {transform: [{scale: anim}]}]} />
      <View style={dot.mid} />
      <View style={dot.inner} />
    </View>
  );
};
const dot = StyleSheet.create({
  wrapper: {width: 60, height: 60, alignItems: 'center', justifyContent: 'center'},
  outer:   {position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(16,185,129,0.15)'},
  mid:     {position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(16,185,129,0.3)'},
  inner:   {width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981'},
});

// ── Lock icon ─────────────────────────────────────────────────────────────────
// ── Removed LockIcon block, using PNG image instead ─────────────────────────

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  isDark:     boolean;
  flow:       FlowType;
  onConfirm:  () => void;
  onReset:    () => void;
  onLogout:   () => void;
  onToggleTheme: () => void;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LockWarningScreen: React.FC<Props> = ({isDark, flow, onConfirm, onReset, onLogout, onToggleTheme}) => {
  const C = getTheme(isDark);
  const actionLabel = flow === 'lock' ? 'LOCK' : 'OPEN';

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <GlobalHeader 
        isDark={isDark} 
        onToggleTheme={onToggleTheme} 
        onLogout={onLogout} 
      />


      {/* Body */}
      <View style={s.body}>
        {/* Pulsing dot status indicator */}
        <View style={s.dotWrap}>
          <PulsingDot />
        </View>

        {/* Warning card */}
        <View style={s.warningCard}>
          <Text style={s.warningTitle}>! WARNING !</Text>
          <Text style={s.warningBody}>
            PLEASE DOUBLE CHECK THAT THE DOORS ARE PROPERLY SECURED
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[s.btn, {backgroundColor: '#EF4444'}]}
          onPress={onConfirm}
          activeOpacity={0.85}>
          <MaterialIcon name="check-bold" size={18} color="#FFF" style={{marginRight: 10}} />
          <Text style={[s.btnText, {color: '#FFF'}]}>CONFIRMED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnOutline, {borderColor: C.border, backgroundColor: 'transparent'}]}
          onPress={onReset}
          activeOpacity={0.85}>
          <Text style={[s.btnText, {color: C.muted}]}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    {flex: 1},
  topBar:  {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm},
  logo:    {fontSize: 20, fontWeight: '800', letterSpacing: 4},
  iconBtn: {width: 36, height: 36, borderRadius: 18, alignItems: 'center',
            justifyContent: 'center', borderWidth: 1},

  body:    {flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'center',
            paddingBottom: SPACING.lg},
  dotWrap: {alignItems: 'center', marginBottom: SPACING.xxl},

  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // #EF4444 at 10%
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg + 4,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 22, fontWeight: '900', color: '#CC0000',
    letterSpacing: 1, marginBottom: SPACING.md, textAlign: 'center',
  },
  warningBody: {
    fontSize: 15, fontWeight: '800', color: '#CC0000',
    textAlign: 'center', lineHeight: 24, letterSpacing: 0.5,
  },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg, elevation: 4,
  },
  btnOutline: {borderWidth: 1, elevation: 0},
  btnText: {fontSize: 14, fontWeight: '800', letterSpacing: 2.5},

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

export default LockWarningScreen;
