import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { FlowType } from '../constants/credentials';
import { getTheme, RADIUS, SPACING } from '../constants/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import { validateOTP } from '../utils/otpValidator';
import userSecrets from '../data/userSecrets.json';

// ── Per-flow content config ───────────────────────────────────────────────────
const FLOW_CONFIG = {
  lock: {
    icon: 'lock' as const,
    idPlaceholder: 'Enter your username',
  },
  open: {
    icon: 'lock-open-variant' as const,
    idPlaceholder: 'Enter your username',
  },
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
  onLoginSuccess: (flow: FlowType, userId: string) => void;
}

// ── Main component ────────────────────────────────────────────────────────────
const OtpLoginScreen: React.FC<Props> = ({ isDark, onToggleTheme, onLoginSuccess }) => {
  const C = getTheme(isDark);

  const [activeTab, setActiveTab] = useState<FlowType>('lock');
  const [step, setStep] = useState<'username' | 'otp'>('username');

  const [uniqueId, setUniqueId] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'error' | 'denied'>('error');
  const [modalMessage, setModalMessage] = useState('');

  const flow = FLOW_CONFIG[activeTab];

  // ── Subtle shake on tab switch ─────────────────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -2, duration: 25, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 25, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 20, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 20, useNativeDriver: true }),
    ]).start();
  }, [activeTab]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTabSwitch = (tab: FlowType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setStep('username');
    setUniqueId('');
    setOtpToken('');
  };

  const showError = (message: string, mode: 'error' | 'denied' = 'error') => {
    setModalMessage(message);
    setModalMode(mode);
    setModalVisible(true);
  };

  const handleNext = () => {
    if (!uniqueId.trim()) {
      showError('Please enter your Username before proceeding.');
      return;
    }
    const secretsMap = userSecrets as Record<string, string>;
    const userSecret = secretsMap[uniqueId.trim()];

    if (!userSecret) {
      showError('User not found. Please verify your username.', 'denied');
      return;
    }

    setStep('otp');
  };

  const handleLogin = () => {
    if (!otpToken.trim()) {
      showError('Please enter the 6-digit OTP to login.');
      return;
    }
    if (otpToken.length !== 6 || isNaN(Number(otpToken))) {
      showError('OTP must be exactly 6 numeric digits.', 'error');
      return;
    }

    const secretsMap = userSecrets as Record<string, string>;
    const userSecret = secretsMap[uniqueId.trim()];

    if (!userSecret) {
      showError('User not found.', 'denied');
      setStep('username');
      return;
    }

    setLoading(true);

    // Simulate slight delay for offline local check
    setTimeout(() => {
      setLoading(false);
      const isValid = validateOTP(otpToken.trim(), userSecret);
      if (isValid) {
        onLoginSuccess(activeTab, uniqueId.trim());
      } else {
        showError('Invalid OTP. Please check your authenticator app and try again.', 'denied');
      }
    }, 600);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <GlobalHeader
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onLogout={() => { }}
        showLogout={false}
        showLogo={false}
      />

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.flex}>
          <Animated.View style={[s.container, { transform: [{ translateX: shakeAnim }] }]}>

            {/* ── Logo ── */}
            <View style={s.logoSection}>
              <Image
                source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')}
                style={s.logoImgStyle}
              />
              <Text style={[s.tagline, { color: C.muted }]}>SECURE OPERATIONS</Text>
            </View>

            {/* ── Tabs ── */}
            <View style={[s.tabRow, { backgroundColor: C.surface, borderColor: C.border }]}>
              {(['lock', 'open'] as FlowType[]).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.8}
                    style={[s.tab, isActive && { backgroundColor: C.tabActiveBg }]}
                    onPress={() => handleTabSwitch(tab)}>
                    <MaterialIcon
                      name={FLOW_CONFIG[tab].icon}
                      size={15}
                      color={isActive ? C.text : C.muted}
                      style={s.tabIcon}
                    />
                    <Text style={[s.tabText, { color: isActive ? C.text : C.muted }]}>
                      {tab.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Form ── */}
            <View style={s.card}>
              <Text style={[s.formLabel, { color: C.label }]}>
                {step === 'username' ? 'ENTER USERNAME' : 'ENTER OTP CODE'}
              </Text>

              {step === 'username' ? (
                <Animated.View style={[s.inputWrapper, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <MaterialIcon name="card-account-details-outline" size={20} color={C.muted} style={s.inputIcon} />
                  <TextInput
                    style={[s.input, { color: C.text }]}
                    placeholder={flow.idPlaceholder}
                    placeholderTextColor={C.placeholder}
                    value={uniqueId}
                    onChangeText={setUniqueId}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Animated.View>
              ) : (
                <Animated.View style={{ width: '100%' }}>
                  <View style={[s.userInfoRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <Text style={{ color: C.muted, fontSize: 13 }}>Logging in as:</Text>
                    <Text style={{ color: C.text, fontSize: 14, fontWeight: '700', marginLeft: 8 }}>{uniqueId}</Text>
                    <TouchableOpacity onPress={() => { setStep('username'); setOtpToken(''); }} style={{ marginLeft: 'auto' }}>
                      <MaterialIcon name="pencil-outline" size={18} color={C.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={[s.inputWrapper, { backgroundColor: C.surface, borderColor: C.border, marginTop: 16 }]}>
                    <MaterialIcon name="lock-clock" size={20} color={C.muted} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, s.inputPr, { color: C.text }]}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={C.placeholder}
                      value={otpToken}
                      onChangeText={(val) => setOtpToken(val.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      maxLength={6}
                      autoCapitalize="none"
                    />
                  </View>
                </Animated.View>
              )}
            </View>

            {/* ── Next / Login Button ── */}
            {step === 'username' ? (
              <TouchableOpacity
                style={[s.loginBtn, { backgroundColor: C.btnBg }]}
                onPress={handleNext}
                activeOpacity={0.85}>
                <MaterialIcon name="arrow-right-circle-outline" size={17} color={C.btnText} style={{ marginRight: 10 }} />
                <Text style={[s.loginBtnText, { color: C.btnText }]}>NEXT</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.loginBtn, { backgroundColor: C.btnBg }, loading && s.loginBtnDisabled]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={loading}>
                {loading ? (
                  <MaterialIcon name="loading" size={22} color={C.btnText} />
                ) : (
                  <>
                    <MaterialIcon name={flow.icon} size={17} color={C.btnText} style={{ marginRight: 10 }} />
                    <Text style={[s.loginBtnText, { color: C.btnText }]}>LOGIN</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Error/Alert Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={{ backgroundColor: C.surfaceHigh, paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg }}>
              <Text style={[s.modalTitle, { color: C.text, marginBottom: 0 }]}>
                {modalMode === 'error' ? 'Required' : 'Access Denied'}
              </Text>
            </View>

            <View style={{ padding: SPACING.lg }}>
              <Text style={{ color: modalMode === 'error' ? C.subText : C.danger, fontSize: 13, lineHeight: 22, marginTop: 4, marginBottom: 20 }}>
                {modalMessage}
              </Text>

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7} style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '800', letterSpacing: 1 }}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },

  // logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 44,
  },
  logoImgStyle: {
    width: 220,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 4,
    marginTop: -10,
    textTransform: 'uppercase',
    fontWeight: '800',
    opacity: 0.7,
  },

  // tabs
  tabRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    padding: 3,
    marginBottom: 36,
    borderWidth: 1,
    width: '100%',
    maxWidth: 260,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: { marginRight: 6 },
  tabText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },

  // form
  card: {
    width: '100%',
    marginBottom: 28,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  inputPr: { paddingRight: 8 },

  loginBtn: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 3 },

  // error modal
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm },
});

export default OtpLoginScreen;
