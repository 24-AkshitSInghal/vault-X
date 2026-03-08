import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {FlowType} from '../constants/credentials';

// ── Types ──────────────────────────────────────────────────────────────────────
type SelectionType = 'container' | 'trailer' | null;

interface Props {
  isDark:        boolean;
  flow:          FlowType;
  onToggleTheme: () => void;
  onLogout:      () => void;
  onProceed:     (selection: 'container' | 'trailer') => void;
}

// ── Mock device data ───────────────────────────────────────────────────────────
const DEVICE = {
  winchId:      'CL001',
  batteryLevel: 97,
  connected:    true,
};

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

// ── Battery Bar ────────────────────────────────────────────────────────────────
const BatteryBar = ({level, C}: {level: number; C: ReturnType<typeof getTheme>}) => (
  <View style={[bbSt.track, {backgroundColor: C.border}]}>
    <View
      style={[
        bbSt.fill,
        {
          width: `${level}%`,
          backgroundColor: level > 20 ? C.text : C.danger,
        },
      ]}
    />
  </View>
);
const bbSt = StyleSheet.create({
  track: {height: 6, borderRadius: 3, overflow: 'hidden', marginVertical: 6},
  fill:  {height: '100%', borderRadius: 3},
});

// ── Main ───────────────────────────────────────────────────────────────────────
const LockDashboardScreen: React.FC<Props> = ({isDark, flow, onToggleTheme, onLogout, onProceed}) => {
  const C = getTheme(isDark);
  const [selection,   setSelection]   = useState<SelectionType>(null);
  const [resetModal,  setResetModal]  = useState(false);

  const handleSelect = (type: SelectionType) => {
    setSelection(prev => (prev === type ? null : type));
  };

  const handleReset = () => {
    setSelection(null);
    setResetModal(false);
  };

  const handleProceed = () => {
    if (!selection) {return;}
    onProceed(selection);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: onLogout},
    ]);
  };

  return (
    <SafeAreaView style={[s.safeArea, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <View style={s.topBarLeft} />
        <View style={s.headerLogo}>
          <Image 
            source={require('../../assets/tranperent-icon.png')} 
            style={{ width: 200, height: 100, resizeMode: 'contain' }} 
          />
        </View>
        <View style={s.topBarRight}>
          <TouchableOpacity
            style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
            onPress={onToggleTheme}
            activeOpacity={0.8}>
            <MaterialIcon name={isDark ? 'weather-sunny' : 'weather-night'} size={16} color={C.subText} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border, marginLeft: 8}]}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <MaterialIcon name="logout-variant" size={16} color={C.subText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={s.body}>

        {/* ── Action Buttons ── */}
        <View style={s.actions}>

          {/* CONTAINER */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              s.actionBtn,
              {backgroundColor: C.surface, borderColor: C.border},
              selection === 'container' && {borderColor: C.text},
            ]}
            onPress={() => handleSelect('container')}>
            <MaterialIcon
              name="package-variant-closed"
              size={20}
              color={selection === 'container' ? C.text : C.muted}
              style={s.actionIcon}
            />
            <Text style={[s.actionText, {color: selection === 'container' ? C.text : C.muted}]}>
              CONTAINER
            </Text>
          </TouchableOpacity>

          {/* TRAILER */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              s.actionBtn,
              {backgroundColor: C.surface, borderColor: C.border},
              selection === 'trailer' && {borderColor: C.text},
            ]}
            onPress={() => handleSelect('trailer')}>
            <MaterialIcon
              name="truck-outline"
              size={20}
              color={selection === 'trailer' ? C.text : C.muted}
              style={s.actionIcon}
            />
            <Text style={[s.actionText, {color: selection === 'trailer' ? C.text : C.muted}]}>
              TRAILER
            </Text>
          </TouchableOpacity>

          {/* RESET */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[s.actionBtn, {backgroundColor: C.surface, borderColor: C.border}]}
            onPress={() => setResetModal(true)}>
            <MaterialIcon name="refresh" size={20} color={C.muted} style={s.actionIcon} />
            <Text style={[s.actionText, {color: C.muted}]}>RESET</Text>
          </TouchableOpacity>

        </View>

        {/* ── Device Status Card ── */}
        <View style={[s.statusCard, {backgroundColor: C.surface, borderColor: C.border}]}>
          <View style={s.statusRow}>
            <MaterialIcon name="battery-high" size={15} color={C.muted} style={{marginRight: 6}} />
            <Text style={[s.statusLabel, {color: C.text}]}>
              BATTERY LEVEL:{' '}
              <Text style={{color: DEVICE.batteryLevel > 20 ? C.text : C.danger}}>
                {DEVICE.batteryLevel}%
              </Text>
            </Text>
          </View>
          <BatteryBar level={DEVICE.batteryLevel} C={C} />

          <View style={[s.divider, {backgroundColor: C.border}]} />

          <View style={s.statusRow}>
            <MaterialIcon name="wrench-outline" size={15} color={C.muted} style={{marginRight: 6}} />
            <Text style={[s.statusLabel, {color: C.text}]}>
              WINCH:{' '}
              <Text style={{color: C.subText}}>{DEVICE.winchId}</Text>
            </Text>
          </View>

          <View style={[s.statusRow, {marginTop: SPACING.sm}]}>
            <View style={[
              s.connDot,
              {backgroundColor: DEVICE.connected ? C.success : C.danger},
            ]} />
            <Text style={[s.connText, {color: DEVICE.connected ? C.success : C.danger}]}>
              {DEVICE.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
          </View>
        </View>

        {/* ── Proceed Button (shows when selection made) ── */}
        {selection && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[s.proceedBtn, {backgroundColor: C.btnBg}]}
            onPress={handleProceed}>
            <MaterialIcon name="arrow-right-circle" size={20} color={C.btnText} style={{marginRight: 10}} />
            <Text style={[s.proceedText, {color: C.btnText}]}>
              {flow === 'lock' ? 'LOCK' : 'OPEN'} {selection?.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )}

      </View>

      {/* ── Reset Confirmation Modal ── */}
      <Modal
        visible={resetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setResetModal(false)}>
          <Pressable style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>
            <Text style={[s.modalTitle, {color: C.text}]}>Reset Selection</Text>
            <Text style={[s.modalBody, {color: C.subText}]}>
              Are you sure you want to reset your selection?
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setResetModal(false)} activeOpacity={0.7}>
                <Text style={[s.modalCancel, {color: C.muted}]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                <Text style={[s.modalConfirm, {color: C.text}]}>RESET</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {flex: 1},

  // top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  topBarLeft:  {width: 80},
  topBarRight: {flexDirection: 'row', alignItems: 'center', width: 80, justifyContent: 'flex-end'},
  headerLogo:  {alignItems: 'center'},
  logoText:    {fontSize: 24, fontWeight: '800', letterSpacing: 5},
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },

  // body
  body: {flex: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, justifyContent: 'center'},

  // actions
  actions: {marginBottom: SPACING.lg, gap: SPACING.sm},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  actionIcon: {marginRight: SPACING.sm},
  actionText: {fontSize: 14, fontWeight: '700', letterSpacing: 2},

  // status card
  statusCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusRow:  {flexDirection: 'row', alignItems: 'center'},
  statusLabel:{fontSize: 12, fontWeight: '700', letterSpacing: 1},
  divider:    {height: 1, marginVertical: SPACING.sm},
  connDot: {
    width: 8, height: 8, borderRadius: 4, marginRight: SPACING.sm,
  },
  connText: {fontSize: 12, fontWeight: '700', letterSpacing: 1.5},

  // proceed
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: RADIUS.lg,
    elevation: 4,
    marginTop: SPACING.sm,
  },
  proceedText: {fontSize: 13, fontWeight: '800', letterSpacing: 2},

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  modalTitle:   {fontSize: 17, fontWeight: '700', marginBottom: SPACING.sm},
  modalBody:    {fontSize: 14, lineHeight: 20, marginBottom: SPACING.lg},
  modalActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.lg},
  modalCancel:  {fontSize: 13, fontWeight: '600', letterSpacing: 1},
  modalConfirm: {fontSize: 13, fontWeight: '800', letterSpacing: 1},
});

export default LockDashboardScreen;
