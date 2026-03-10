import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Image,
  Modal,
  Pressable,
  PanResponder,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {FlowType} from '../constants/credentials';
import {GlobalHeader} from '../components/GlobalHeader';

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

// ── Slide To Confirm ───────────────────────────────────────────────────────────
const THUMB_SIZE = 54;

interface SlideProps {
  label:      string;
  onConfirm:  () => void;
  thumbColor: string;
  textColor:  string;
  trackBg:    string;
}

const SlideToConfirm = ({label, onConfirm, thumbColor, textColor, trackBg}: SlideProps) => {
  const thumbX    = useRef(new Animated.Value(0)).current;
  const trackW    = useRef(0);
  const confirmed = useRef(false);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderMove: (_, gs) => {
        if (confirmed.current) {return;}
        const max     = trackW.current - THUMB_SIZE - 8;
        const clamped = Math.max(0, Math.min(gs.dx, max));
        thumbX.setValue(clamped);
      },
      onPanResponderRelease: (_, gs) => {
        if (confirmed.current) {return;}
        const max = trackW.current - THUMB_SIZE - 8;
        if (gs.dx >= max * 0.72) {
          confirmed.current = true;
          Animated.timing(thumbX, {toValue: max, duration: 120, useNativeDriver: true}).start(() => {
            onConfirm();
            setTimeout(() => {
              confirmed.current = false;
              thumbX.setValue(0);
            }, 500);
          });
        } else {
          Animated.spring(thumbX, {toValue: 0, useNativeDriver: true, tension: 80, friction: 8}).start();
        }
      },
    }),
  ).current;

  return (
    <View
      style={[slSt.track, {backgroundColor: trackBg}]}
      onLayout={e => { trackW.current = e.nativeEvent.layout.width; }}>
      <Text style={[slSt.label, {color: textColor}]}>{label}</Text>
      <Animated.View
        style={[slSt.thumb, {backgroundColor: thumbColor, transform: [{translateX: thumbX}]}]}
        {...pan.panHandlers}>
        <MaterialIcon name="chevron-double-right" size={22} color={thumbColor === '#EF4444' ? '#0a0a0a' : '#000'} />
      </Animated.View>
    </View>
  );
};

const slSt = StyleSheet.create({
  track: {
    height: THUMB_SIZE + 8,
    borderRadius: (THUMB_SIZE + 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    position: 'absolute',
    textAlign: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 4,
  },
});

// ── Main ───────────────────────────────────────────────────────────────────────
const LockDashboardScreen: React.FC<Props> = ({isDark, flow, onToggleTheme, onLogout, onProceed}) => {
  const C = getTheme(isDark);

  const [selection,          setSelection]          = useState<SelectionType>(null);
  const [showBatteryWarning, setShowBatteryWarning] = useState(false);
  const [showWarning1,       setShowWarning1]       = useState(false);
  const [showWarning2,       setShowWarning2]       = useState(false);
  const [logoutModal,        setLogoutModal]        = useState(false);

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
    setShowWarning1(true);
  };

  // Slide on Warning 1 → open Warning 2
  const proceedToWarning2 = () => {
    setShowWarning1(false);
    setTimeout(() => setShowWarning2(true), 300);
  };

  // Slide on Warning 2 → call onProceed
  const confirmProceed = () => {
    setShowWarning2(false);
    if (!selection) {return;}
    onProceed(selection);
  };

  return (
    <SafeAreaView style={[s.safeArea, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <GlobalHeader 
        isDark={isDark} 
        onToggleTheme={onToggleTheme} 
        onLogout={onLogout} 
      />

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

        </View>

        {/* ── Device Status Card ── */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowBatteryWarning(true)}
          style={[s.statusCard, {backgroundColor: C.surface, borderColor: C.border}]}>
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
            <View style={[s.connDot, {backgroundColor: DEVICE.connected ? C.success : C.danger}]} />
            <Text style={[s.connText, {color: DEVICE.connected ? C.success : C.danger}]}>
              {DEVICE.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
          </View>
        </TouchableOpacity>



        {/* ── Floating Notification Toast ── */}
        {toastMsg && (
          <Animated.View style={[s.toastCard, {opacity: toastAnim, backgroundColor: isDark ? '#111' : '#fff'}]}>
            <Text style={[s.toastText, {color: C.text}]}>{toastMsg}</Text>
          </Animated.View>
        )}
      </View>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── WARNING 1 — Doors closed check ──────────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showWarning1}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarning1(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>

            {/* Title bar */}
            <View style={{
              backgroundColor: C.surfaceHigh,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderTopLeftRadius: RADIUS.lg,
              borderTopRightRadius: RADIUS.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
              {/* <MaterialIcon name="alert-octagon" size={18} color="#EF4444" /> */}
              <Text style={[s.modalTitle, {color: '#EF4444'}]}>! WARNING !</Text>
              {/* <MaterialIcon name="alert-octagon" size={18} color="#EF4444" /> */}
            </View>

            <View style={{padding: SPACING.lg, alignItems: 'center'}}>

              {/* Skull */}
              <View style={w1.skullBox}>
                <MaterialIcon name="skull-crossbones" size={46} color="#EF4444" />
              </View>

              {/* Main message */}
              <Text style={[w1.msgMain, {color: C.text}]}>
                MAKE SURE DOORS ARE CLOSED{'\n'}AND LATCHED{'\n'}BEFORE CONTINUING TO LOCK!
              </Text>

              <View style={w1.divider} />

              {/* Danger message */}
              <Text style={[w1.msgSub, {color: C.subText}]}>
                FAILURE TO DO THIS CAN RESULT IN{'\n'}
                <Text style={w1.msgDeath}>DEATH OR SERIOUS BODILY INJURY!</Text>
              </Text>

              {/* Slide to proceed */}
              <View style={w1.sliderWrap}>
                <SlideToConfirm
                  label={`SLIDE TO LOCK ${selection?.toUpperCase() ?? ''}`}
                  onConfirm={proceedToWarning2}
                  thumbColor="#EF4444"
                  textColor="rgba(239,68,68,0.55)"
                  trackBg="rgba(239,68,68,0.12)"
                />
              </View>

              {/* Cancel */}
              <TouchableOpacity
                onPress={() => setShowWarning1(false)}
                activeOpacity={0.7}
                style={{alignItems: 'center', paddingVertical: 12}}>
                <Text style={{color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1}}>CANCEL</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── WARNING 2 — Type mismatch confirmation ────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showWarning2}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarning2(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>

            {/* Title bar */}
            <View style={{
              backgroundColor: C.surfaceHigh,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderTopLeftRadius: RADIUS.lg,
              borderTopRightRadius: RADIUS.lg,
            }}>
              <Text style={[s.modalTitle, {color: C.text}]}>Confirm Selection</Text>
            </View>

            <View style={{padding: SPACING.lg}}>
              <Text style={{color: C.danger, fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 6}}>
                !WARNING!
              </Text>
              <Text style={{color: C.subText, fontSize: 13, lineHeight: 22, marginBottom: 24}}>
                {selection !== 'trailer'
                  ? 'Using CONTAINER for TRAILER will cause the doors not to lock properly, YOU may be held LIABLE'
                  : 'Using TRAILER for CONTAINER will cause the doors not to lock properly, YOU may be held LIABLE'}
              </Text>

              {/* Slide to confirm */}
              <SlideToConfirm
                label="SLIDE TO PROCEED"
                onConfirm={confirmProceed}
                thumbColor={C.text}
                textColor={C.muted}
                trackBg={C.surfaceHigh}
              />

              {/* Cancel */}
              <TouchableOpacity
                onPress={() => setShowWarning2(false)}
                activeOpacity={0.7}
                style={{alignItems: 'center', paddingVertical: 14, marginTop: 4}}>
                <Text style={{color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1}}>CANCEL</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* ── Logout Confirmation Modal ── */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>
            <View style={{backgroundColor: C.surfaceHigh, paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg}}>
              <Text style={[s.modalTitle, {color: C.text}]}>Sign Out</Text>
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

      {/* ── Low Battery Warning Modal ── */}
      <Modal
        visible={showBatteryWarning}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setShowBatteryWarning(false)}>
        <SafeAreaView style={[s.safeArea, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
          <Pressable style={s.modalWarnWrap} onPress={() => setShowBatteryWarning(false)}>
            <View style={[s.warnLogoBox, {backgroundColor: C.surfaceHigh}]}>
              <Image
                source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')}
                style={{width: 200, height: 150, resizeMode: 'contain'}}
              />
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
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },

  body: {flex: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, justifyContent: 'center'},

  actions:   {marginBottom: SPACING.lg, gap: SPACING.sm},
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

  statusCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusRow:   {flexDirection: 'row', alignItems: 'center'},
  statusLabel: {fontSize: 12, fontWeight: '700', letterSpacing: 1},
  divider:     {height: 1, marginVertical: SPACING.sm},
  connDot:     {width: 8, height: 8, borderRadius: 4, marginRight: SPACING.sm},
  connText:    {fontSize: 12, fontWeight: '700', letterSpacing: 1.5},

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

  toastCard: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  toastText: {fontSize: 13, fontWeight: '700', letterSpacing: 1},

  modalWarnWrap: {flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: 80},
  warnLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
  warnContentBox: {alignItems: 'center', width: '100%'},
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
  warnSubText: {color: '#EF4444', fontSize: 20, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center'},
  warnDivider: {width: 60, height: 4, borderRadius: 2, marginBottom: SPACING.xl},
  warnOrCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginVertical: SPACING.xl,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  warnOrText: {color: '#EF4444', fontSize: 16, fontWeight: '800'},

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

// ── Warning 1 Card Content Styles ─────────────────────────────────────────────
const w1 = StyleSheet.create({
  skullBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.25)',
    marginBottom: 20,
    marginTop: 4,
  },
  msgMain: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(239,68,68,0.35)',
    borderRadius: 2,
    marginBottom: 14,
  },
  msgSub: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  msgDeath: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 13,
  },
  sliderWrap: {width: '100%', marginBottom: 8},
});

export default LockDashboardScreen;
