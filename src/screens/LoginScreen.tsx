import React, {useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {DUMMY_CREDENTIALS, FlowType} from '../constants/credentials';

// ── Theme definitions ─────────────────────────────────────────────────────────
const DARK = {
  bg: '#111111',
  surface: '#1C1C1C',
  border: '#2A2A2A',
  text: '#FFFFFF',
  subText: '#AAAAAA',
  muted: '#666666',
  tabActiveBg: '#2E2E2E',
  btnBg: '#FFFFFF',
  btnText: '#111111',
  label: '#888888',
  hintBg: '#1C1C1C',
  hintBorder: '#2A2A2A',
  placeholder: '#555555',
};

const LIGHT = {
  bg: '#F4F4F7',
  surface: '#FFFFFF',
  border: '#E0E0E8',
  text: '#0F0F12',
  subText: '#555566',
  muted: '#9999AA',
  tabActiveBg: '#ECECF4',
  btnBg: '#111111',
  btnText: '#FFFFFF',
  label: '#888899',
  hintBg: '#FFFFFF',
  hintBorder: '#E0E0E8',
  placeholder: '#AAAAAA',
};

// ── Lock icon (view-based) ────────────────────────────────────────────────────
const LockIcon = ({color}: {color: string}) => (
  <View style={lockIconStyles.wrapper}>
    <View style={[lockIconStyles.shackle, {borderColor: color}]} />
    <View style={[lockIconStyles.body, {backgroundColor: color}]}>
      <View style={[lockIconStyles.inner, {backgroundColor: 'transparent'}]}>
        <View style={lockIconStyles.ring} />
        <View style={lockIconStyles.stem} />
      </View>
    </View>
  </View>
);

const lockIconStyles = StyleSheet.create({
  wrapper: {alignItems: 'center', marginBottom: 18},
  shackle: {
    width: 26,
    height: 18,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderWidth: 4,
    borderBottomWidth: 0,
    marginBottom: -2,
  },
  body: {
    width: 50,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {alignItems: 'center'},
  ring: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  stem: {
    width: 3,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 2,
    marginTop: 1,
  },
});

// ── Main component ────────────────────────────────────────────────────────────
const LoginScreen: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const C = isDark ? DARK : LIGHT;

  const [activeTab, setActiveTab] = useState<FlowType>('lock');
  const [uniqueId, setUniqueId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const cred = DUMMY_CREDENTIALS[activeTab];
    if (!uniqueId.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your Unique ID and Password.');
      return;
    }
    if (uniqueId !== cred.id || password !== cred.password) {
      Alert.alert('Access Denied', 'Invalid credentials. Please try again.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Access Granted',
        `${activeTab === 'lock' ? 'Lock' : 'Open'} flow authenticated.`,
      );
    }, 1200);
  };

  const handleRequestOtp = () => {
    if (!uniqueId.trim()) {
      Alert.alert('Unique ID Required', 'Please enter your Unique ID before requesting an OTP.');
      return;
    }
    Alert.alert('OTP Sent', `A one-time password has been dispatched to the number linked with ${uniqueId}.`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      {/* ── Theme Toggle ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.themeBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={() => setIsDark(v => !v)}
          activeOpacity={0.8}>
          <MaterialIcon
            name={isDark ? 'weather-sunny' : 'weather-night'}
            size={18}
            color={C.subText}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <View style={styles.container}>

          {/* ── Logo ── */}
          <View style={styles.logoSection}>
            <LockIcon color={C.text} />
            <Text style={[styles.logoText, {color: C.text}]}>
              VAULT<Text style={{color: C.muted}}>X</Text>
            </Text>
            <Text style={[styles.tagline, {color: C.muted}]}>
              Secure Container Management
            </Text>
          </View>

          {/* ── Flow Tabs ── */}
          <View style={[styles.tabRow, {backgroundColor: C.surface, borderColor: C.border}]}>
            {(['lock', 'open'] as FlowType[]).map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  style={[
                    styles.tab,
                    isActive && [styles.tabActive, {backgroundColor: C.tabActiveBg}],
                  ]}
                  onPress={() => setActiveTab(tab)}>
                  <MaterialIcon
                    name={tab === 'lock' ? 'lock' : 'lock-open-variant'}
                    size={15}
                    color={isActive ? C.text : C.muted}
                    style={styles.tabIcon}
                  />
                  <Text style={[styles.tabText, {color: isActive ? C.text : C.muted}]}>
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Form ── */}
          <View style={styles.card}>
            <Text style={[styles.formLabel, {color: C.label}]}>UNIQUE ID LOGIN</Text>

            {/* Unique ID */}
            <View style={[styles.inputWrapper, {backgroundColor: C.surface, borderColor: C.border}]}>
              <MaterialIcon
                name="card-account-details-outline"
                size={20}
                color={C.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, {color: C.text}]}
                placeholder="Enter your Unique ID"
                placeholderTextColor={C.placeholder}
                value={uniqueId}
                onChangeText={setUniqueId}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrapper, {backgroundColor: C.surface, borderColor: C.border}]}>
              <MaterialIcon
                name="key-outline"
                size={20}
                color={C.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputPr, {color: C.text}]}
                placeholder="Enter your password"
                placeholderTextColor={C.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <MaterialIcon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={C.muted}
                />
              </Pressable>
            </View>

            {/* Request OTP */}
            <TouchableOpacity
              style={styles.otpRow}
              onPress={handleRequestOtp}
              activeOpacity={0.7}>
              <MaterialIcon
                name="message-badge-outline"
                size={13}
                color={C.muted}
                style={{marginRight: 5}}
              />
              <Text style={[styles.otpText, {color: C.muted}]}>REQUEST OTP</Text>
            </TouchableOpacity>
          </View>

          {/* ── Login Button ── */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              {backgroundColor: C.btnBg},
              loading && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}>
            {loading ? (
              <MaterialIcon name="loading" size={22} color={C.btnText} />
            ) : (
              <Text style={[styles.loginBtnText, {color: C.btnText}]}>LOGIN</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {flex: 1},
  safeArea: {flex: 1},

  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingBottom: 16,
  },

  // ── Logo ──
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    borderRadius: 50,
    padding: 4,
    marginBottom: 32,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {},
  tabIcon: {marginRight: 6},
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // ── Card ──
  card: {marginBottom: 24},
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {marginRight: 10},
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  inputPr: {paddingRight: 8},
  eyeBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingVertical: 4,
  },
  otpText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // ── Login Button ──
  loginBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    elevation: 4,
  },
  loginBtnDisabled: {opacity: 0.5},
  loginBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },
});

export default LoginScreen;
