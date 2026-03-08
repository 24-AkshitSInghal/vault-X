import React, {useRef, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {FlowType} from '../constants/credentials';

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
const LockIcon = ({color}: {color: string}) => (
  <View style={{alignItems: 'center', marginBottom: 6}}>
    <View style={{width: 22, height: 16, borderTopLeftRadius: 11, borderTopRightRadius: 11,
      borderWidth: 3.5, borderBottomWidth: 0, borderColor: color, marginBottom: -2}} />
    <View style={{width: 42, height: 34, borderRadius: 8, backgroundColor: color,
      alignItems: 'center', justifyContent: 'center'}}>
      <View style={{width: 9, height: 9, borderRadius: 4.5, backgroundColor: 'rgba(0,0,0,0.2)'}} />
    </View>
  </View>
);

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  isDark:     boolean;
  flow:       FlowType;
  onConfirm:  () => void;
  onReset:    () => void;
  onLogout:   () => void;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LockWarningScreen: React.FC<Props> = ({isDark, flow, onConfirm, onReset, onLogout}) => {
  const C = getTheme(isDark);
  const actionLabel = flow === 'lock' ? 'LOCK' : 'OPEN';

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Top bar */}
      <View style={s.topBar}>
        <View style={{width: 40}} />
        <View style={{alignItems: 'center'}}>
          <LockIcon color={C.text} />
          <Text style={[s.logo, {color: C.text}]}>VAULT<Text style={{color: C.muted}}>X</Text></Text>
        </View>
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={onLogout}>
          <MaterialIcon name="logout-variant" size={16} color={C.subText} />
        </TouchableOpacity>
      </View>

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
          style={[s.btn, {backgroundColor: C.btnBg}]}
          onPress={onConfirm}
          activeOpacity={0.85}>
          <MaterialIcon name="check-bold" size={18} color={C.btnText} style={{marginRight: 10}} />
          <Text style={[s.btnText, {color: C.btnText}]}>CONFIRMED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnOutline, {borderColor: C.border, backgroundColor: C.surface}]}
          onPress={onReset}
          activeOpacity={0.85}>
          <MaterialIcon name="refresh" size={18} color={C.text} style={{marginRight: 10}} />
          <Text style={[s.btnText, {color: C.text}]}>RESET</Text>
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
    backgroundColor: '#F5F5F0',
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
  btnText:    {fontSize: 14, fontWeight: '800', letterSpacing: 2.5},
});

export default LockWarningScreen;
