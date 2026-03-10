import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Animated,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {DUMMY_CREDENTIALS, FlowType} from '../constants/credentials';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {GlobalHeader} from '../components/GlobalHeader';

// ── Per-flow content config ───────────────────────────────────────────────────
const FLOW_CONFIG = {
  lock: {
    icon:         'lock'              as const,
    idPlaceholder:'Enter your login ID',
    passPh:       'Enter your password',
  },
  open: {
    icon:         'lock-open-variant' as const,
    idPlaceholder:'Enter your login ID',
    passPh:       'Enter your password',
  },
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  isDark:         boolean;
  onToggleTheme:  () => void;
  onLoginSuccess: (flow: FlowType) => void;
}

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

// ── Main component ────────────────────────────────────────────────────────────
const LoginScreen: React.FC<Props> = ({isDark, onToggleTheme, onLoginSuccess}) => {
  const C = getTheme(isDark);
  const dispatch = useDispatch();
  
  const [activeTab,    setActiveTab]    = useState<FlowType>('lock');
  const [uniqueId,     setUniqueId]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpModalMode, setOtpModalMode] = useState<'error' | 'success' | 'denied'>('success');

  const flow = FLOW_CONFIG[activeTab];

  // ── Subtle shake on tab switch ─────────────────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: -2,  duration: 25, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue:  2,  duration: 25, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -1,  duration: 20, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue:  0,  duration: 20, useNativeDriver: true}),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTabSwitch = (tab: FlowType) => {
    if (tab === activeTab) {return;}
    setActiveTab(tab);
    setUniqueId('');
    setPassword('');
  };

  const handleLogin = () => {
    const cred = DUMMY_CREDENTIALS[activeTab];
    if (!uniqueId.trim() || !password.trim()) {
      setOtpModalMode('error');
      setOtpModalVisible(true);
      return;
    }
    if (uniqueId !== cred.id || password !== cred.password) {
      setOtpModalMode('denied');
      setOtpModalVisible(true);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(setCredentials({ loginId: uniqueId }));
      onLoginSuccess(activeTab);
    }, 1000);
  };

  const handleRequestOtp = () => {
    if (!uniqueId.trim()) {
      setOtpModalMode('error');
      setOtpModalVisible(true);
      return;
    }
    setOtpModalMode('success');
    setOtpModalVisible(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safeArea, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

     

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView 
          contentContainerStyle={s.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <Animated.View style={[s.container, {transform: [{translateX: shakeAnim}]}]}>

          {/* ── Logo ── */}
          <View style={s.logoSection}>
            <Image 
              source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')} 
              style={{ width: 200, height: 150, resizeMode: 'contain'}} 
            />
            <Text style={[s.tagline, {color: C.muted}]}>Secure Container Management</Text>
          </View>

          {/* ── Tabs ── */}
          <View style={[s.tabRow, {backgroundColor: C.surface, borderColor: C.border}]}>
            {(['lock', 'open'] as FlowType[]).map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  style={[s.tab, isActive && {backgroundColor: C.tabActiveBg}]}
                  onPress={() => handleTabSwitch(tab)}>
                  <MaterialIcon
                    name={FLOW_CONFIG[tab].icon}
                    size={15}
                    color={isActive ? C.text : C.muted}
                    style={s.tabIcon}
                  />
                  <Text style={[s.tabText, {color: isActive ? C.text : C.muted}]}>
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Form ── */}
          <View style={s.card}>
            <Text style={[s.formLabel, {color: C.label}]}>UNIQUE ID LOGIN</Text>

            {/* Unique ID */}
            <View style={[s.inputWrapper, {backgroundColor: C.surface, borderColor: C.border}]}>
              <MaterialIcon name="card-account-details-outline" size={20} color={C.muted} style={s.inputIcon} />
              <TextInput
                style={[s.input, {color: C.text}]}
                placeholder={flow.idPlaceholder}
                placeholderTextColor={C.placeholder}
                value={uniqueId}
                onChangeText={setUniqueId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={[s.inputWrapper, {backgroundColor: C.surface, borderColor: C.border}]}>
              <MaterialIcon name="key-outline" size={20} color={C.muted} style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputPr, {color: C.text}]}
                placeholder={flow.passPh}
                placeholderTextColor={C.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable style={s.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <MaterialIcon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.muted} />
              </Pressable>
            </View>

            {/* OTP */}
            <TouchableOpacity style={s.otpRow} onPress={handleRequestOtp} activeOpacity={0.7}>
              <MaterialIcon name="message-badge-outline" size={13} color={C.muted} style={{marginRight: 5}} />
              <Text style={[s.otpText, {color: C.muted}]}>REQUEST OTP</Text>
            </TouchableOpacity>
          </View>

          {/* ── Login Button ── */}
          <TouchableOpacity
            style={[s.loginBtn, {backgroundColor: C.btnBg}, loading && s.loginBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}>
            {loading ? (
              <MaterialIcon name="loading" size={22} color={C.btnText} />
            ) : (
              <>
                <MaterialIcon name={flow.icon} size={17} color={C.btnText} style={{marginRight: 10}} />
                <Text style={[s.loginBtnText, {color: C.btnText}]}>LOGIN</Text>
              </>
            )}
          </TouchableOpacity>

        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── OTP Modal ── */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {backgroundColor: C.surface, borderColor: C.border}]}>
            <View style={{backgroundColor: C.surfaceHigh, paddingVertical: 12, paddingHorizontal: 16, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg }}>
              <Text style={[s.modalTitle, {color: C.text, marginBottom: 0}]}>
                {otpModalMode === 'error' ? 'Required' : otpModalMode === 'denied' ? 'Access Denied' : 'OTP Dispatched'}
              </Text>
            </View>

            <View style={{padding: SPACING.lg}}>
              <Text style={{color: (otpModalMode === 'error' || otpModalMode === 'denied') ? C.danger : C.subText, fontSize: 13, lineHeight: 22, marginTop: 4, marginBottom: 20}}>
                {otpModalMode === 'error' 
                  ? 'Please enter your Unique ID and Access Key before logging in.'
                  : otpModalMode === 'denied' ? 'The credentials you entered are incorrect. Please try again.'
                  : `A one-time password was sent to the number linked with ${uniqueId}.`}
              </Text>

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => setOtpModalVisible(false)} activeOpacity={0.7} style={{paddingVertical: 10, paddingHorizontal: 15}}>
                  <Text style={{color: C.text, fontSize: 13, fontWeight: '800', letterSpacing: 1}}>
                    {otpModalMode === 'success' ? 'DISMISS' : 'OK'}
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
  flex:     {flex: 1},
  safeArea: {flex: 1},

  container: {
    paddingHorizontal: 32, 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },

  // logo
  logoSection: {alignItems: 'center', marginBottom: 10},
  logoText:    {fontSize: 34, fontWeight: '800', letterSpacing: 6},
  tagline:     {fontSize: 11, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase'},

  // tabs
  tabRow: {
    flexDirection: 'row', 
    borderRadius: 14, 
    padding: 4, 
    marginBottom: 32, 
    borderWidth: 1.5,
    width: '100%',
  },
  tab: {
    flex: 1, 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderRadius: 11, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  tabIcon: {marginRight: 8},
  tabText: {fontSize: 13, fontWeight: '700', letterSpacing: 1.2},

  // form
  card: {
    width: '100%',
    marginBottom: 24
  },
  formLabel: {
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 2, 
    marginBottom: 16,
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 14, 
    borderWidth: 1.5, 
    marginBottom: 14, 
    paddingHorizontal: 16,
    height: 58,
  },
  inputIcon: {marginRight: 12},
  input: {
    flex: 1, 
    height: '100%', 
    fontSize: 15, 
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  inputPr: {paddingRight: 8},
  eyeBtn:  {padding: 8, justifyContent: 'center', alignItems: 'center'},
  otpRow:  {flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', paddingVertical: 6},
  otpText: {fontSize: 12, fontWeight: '700', letterSpacing: 1},

  loginBtn: {
    width: '100%',
    flexDirection: 'row', 
    borderRadius: 14, 
    paddingVertical: 17, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loginBtnDisabled: {opacity: 0.5},
  loginBtnText:     {fontSize: 15, fontWeight: '800', letterSpacing: 2},

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

export default LoginScreen;
