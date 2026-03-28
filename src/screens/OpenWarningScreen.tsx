import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme, RADIUS, SPACING } from '../constants/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import { SlideToConfirm } from '../components/SlideToConfirm';
import bleService from '../services/bleService';

interface Props {
  isDark: boolean;
  onYes: () => void;
  onNo: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

const OpenWarningScreen: React.FC<Props> = ({
  isDark,
  onYes,
  onNo,
  onLogout,
  onToggleTheme,
}) => {
  const C = getTheme(isDark);

  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const toastAnim = React.useRef(new Animated.Value(0)).current;
  const [devMode, setDevMode] = React.useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMsg(null));
  };

  const confirmProceed = async () => {
    if (devMode) {
      onYes();
      return;
    }

    const hexCommand = '0x57004300';
    const sent = await bleService.sendCommand(hexCommand);

    if (sent) {
      showToast('Command Sent');
      setTimeout(() => {
        onYes();
      }, 1000);
    } else {
      showToast('Device Not Connected / Failed to Send');
    }
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      <GlobalHeader
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />

      {__DEV__ && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setDevMode(!devMode)}
          style={{
            alignSelf: 'center',
            marginTop: 10,
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: devMode ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: devMode ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '900',
              color: devMode ? '#10B981' : '#EF4444',
            }}
          >
            DEV BYPASS: {devMode ? 'ACTIVE' : 'OFF'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={s.content}>
        <Text style={s.warningText}>WARNING!</Text>
        <Text style={[s.messageText, { color: C.text }]}>
          OPEN WILL UNLOCK THE DOORS
        </Text>
        <Text style={[s.messageText, { color: C.text, marginBottom: 70 }]}>
          DO YOU WANT TO CONTINUE?
        </Text>

        <View style={{ marginBottom: SPACING.md }}>
          <SlideToConfirm
            label="SLIDE TO OPEN"
            onConfirm={confirmProceed}
            thumbColor="#10B981"
            textColor="rgba(16,185,129,0.55)"
            trackBg="rgba(16,185,129,0.12)"
            isDark={isDark}
          />
        </View>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: 'transparent' }]}
          onPress={onNo}
          activeOpacity={0.8}
        >
          <Text style={[s.btnText, { color: '#EF4444' }]}>CANCEL</Text>
        </TouchableOpacity>
      </View>

      {/* ── Floating Notification Toast ── */}
      {toastMsg && (
        <Animated.View
          style={[
            s.toastCard,
            { opacity: toastAnim, backgroundColor: isDark ? '#111' : '#fff' },
          ]}
        >
          <Text style={[s.toastText, { color: C.text }]}>{toastMsg}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  logo: { fontSize: 20, fontWeight: '800', letterSpacing: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  warningText: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: RADIUS.pill,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnText: { fontSize: 15, fontWeight: '800', letterSpacing: 2 },

  toastCard: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  toastText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
});

export default OpenWarningScreen;
