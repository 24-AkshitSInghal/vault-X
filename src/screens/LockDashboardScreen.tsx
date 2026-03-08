import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
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
  const [showBatteryWarning, setShowBatteryWarning] = useState(false);
  const [showConfirmModal, setShowConfirmModal]   = useState(false);
  const [resetModal,  setResetModal]  = useState(false);
  
  const [toastMsg,  setToastMsg]  = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {toValue: 1, duration: 250, useNativeDriver: true}),
      Animated.delay(1200),
      Animated.timing(toastAnim, {toValue: 0, duration: 250, useNativeDriver: true}),
    ]).start(() => setToastMsg(null));
  };

  const handleSelect = (type: 'container' | 'trailer') => {
    setSelection(type);
    showToast(`${type.toUpperCase()} SELECTED`);
  };

  const handleReset = () => {
    setSelection(null);
    setResetModal(false);
  };

  const handleProceed = () => {
    if (!selection) {return;}
    setShowConfirmModal(true);
  };

  const confirmProceed = () => {
    setShowConfirmModal(false);
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
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => setShowBatteryWarning(true)}
          style={[s.statusCard, {backgroundColor: C.surface, borderColor: C.border}]}
        >
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
        </TouchableOpacity>

        {/* ── Proceed Button (shows when selection made) ── */}
        {selection && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[s.proceedBtn, {backgroundColor: C.btnBg}]}
            onPress={handleProceed}>
            <MaterialIcon name="arrow-right-circle" size={20} color={C.btnText} style={{marginRight: 10}} />
            <Text style={[s.proceedText, {color: C.btnText}]}>
              PROCEED WITH {selection.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Floating Notification Toast ── */}
        {toastMsg && (
          <Animated.View style={[s.toastCard, {opacity: toastAnim}]}>
            <Text style={[s.toastText, {color: C.text}]}>{toastMsg}</Text>
          </Animated.View>
        )}
      </View>

      {/* ── Confirm Selection Popup ── */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: '#262626', borderColor: 'rgba(255,255,255,0.05)'}]}>
            <View style={{backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg }}>
              <Text style={[s.modalTitle, {color: C.text, marginBottom: 0}]}>Confirm Selection</Text>
            </View>

            <View style={{padding: SPACING.lg}}>
              <Text style={{color: C.danger, fontSize: 13, fontWeight: '800', letterSpacing: 1}}>!WARNING!</Text>
              <Text style={{color: C.subText, fontSize: 13, lineHeight: 22, marginTop: 4, marginBottom: 20}}>
                Using TRAILER for CONTAINER will cause the doors not to lock properly, YOU may be held LIABLE
              </Text>

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => setShowConfirmModal(false)} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1}}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmProceed} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.text, fontSize: 13, fontWeight: '800', letterSpacing: 1}}>PROCEED</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Reset Confirmation Modal ── */}
      <Modal
        visible={resetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: '#262626', borderColor: 'rgba(255,255,255,0.05)'}]}>
            <View style={{backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg }}>
              <Text style={[s.modalTitle, {color: C.text, marginBottom: 0}]}>Reset Selection</Text>
            </View>

            <View style={{padding: SPACING.lg}}>
              <Text style={{color: C.subText, fontSize: 13, lineHeight: 22, marginTop: 4, marginBottom: 20}}>
                Are you sure you want to reset your selection?
              </Text>

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => setResetModal(false)} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1}}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReset} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.text, fontSize: 13, fontWeight: '800', letterSpacing: 1}}>RESET</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Low Battery Warning Modal ── */}
      <Modal 
        visible={showBatteryWarning} 
        animationType="fade" 
        transparent={false}
        onRequestClose={() => setShowBatteryWarning(false)}
      >
        <SafeAreaView 
          style={[s.safeArea, {backgroundColor: isDark ? '#1C1C1E' : '#EAE6F5'}]} 
          edges={['top', 'bottom']}
        >
          <Pressable style={s.modalWarnWrap} onPress={() => setShowBatteryWarning(false)}>
            
            <View style={s.warnLogoBox}>
               <Image 
                 source={require('../../assets/tranperent-icon.png')} 
                 style={{ width: 200  , height: 150, resizeMode: 'contain' }} 
               />
               {/* <MaterialIcon name="lock-alert" size={45} color={isDark ? '#FFFFFF' : '#000000'} style={{marginLeft: 15}} /> */}
            </View>
            
            <View style={s.warnContentBox}>
              <View style={s.warningBadge}>
                <MaterialIcon name="alert-outline" size={26} color="#FDE047" style={{marginRight: 8}} />
                <Text style={s.warnHeadline}>!WARNING!</Text>
                <MaterialIcon name="alert-outline" size={26} color="#FDE047" style={{marginLeft: 8}} />
              </View>

              <Text style={s.warnTitle}>LOW BATTERY!</Text>
              
              <View style={[s.warnDivider, {backgroundColor: 'rgba(239, 68, 68, 0.3)'}]} />

              <Text style={s.warnSubText}>PLEASE RECHARGE</Text>
              
              <View style={s.warnOrCircle}>
                <Text style={s.warnOrText}>OR</Text>
              </View>

              <Text style={s.warnSubText}>REPLACE BATTERY</Text>
            </View>

          </Pressable>
        </SafeAreaView>
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

  // toast
  toastCard: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // full screen warning
  modalWarnWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
  },
  warnLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  warnContentBox: {
    alignItems: 'center',
    width: '100%',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(253, 224, 71, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.2)',
  },
  warnHeadline: {
    color: '#FDE047',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(253, 224, 71, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
  warnTitle: {
    color: '#EF4444',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  warnSubText: {
    color: '#EF4444',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  warnDivider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xl,
  },
  warnOrCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  warnOrText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '800',
  },

  // confirm selection modal
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

export default LockDashboardScreen;
