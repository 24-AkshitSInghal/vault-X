import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Platform,
  PermissionsAndroid,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { getTheme, RADIUS, SPACING } from '../constants/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import Geolocation from 'react-native-geolocation-service';
import bleService from '../services/bleService';
import { launchCamera } from 'react-native-image-picker';

interface Props {
  isDark: boolean;
  flow: 'lock' | 'open';
  selection?: 'container' | 'trailer';
  userId: string;
  onOpen: (container: string, seal: string, imageUri?: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

const ActionDashboardScreen: React.FC<Props> = ({
  isDark,
  flow,
  selection = 'container',
  userId,
  onOpen,
  onLogout,
  onToggleTheme,
}) => {
  const C = getTheme(isDark);

  const [containerNum, setContainerNum] = React.useState('');
  const [sealNum, setSealNum] = React.useState('');
  const [gpsLocation, setGpsLocation] = React.useState('Fetching...');
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [currentDate, setCurrentDate] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const now = new Date();
    // Format Date: Mar 08, 2026
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    setCurrentDate(dateStr);

    // Format Time: 01:36:24 PM
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setCurrentTime(timeStr);

    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          getLocation();
        } else {
          setGpsLocation('Permission Denied');
        }
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        } else {
          setGpsLocation('Permission Denied');
        }
      }
    };

    const getLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const latDir = latitude >= 0 ? 'N' : 'S';
          const lonDir = longitude >= 0 ? 'E' : 'W';
          setGpsLocation(
            `${Math.abs(latitude).toFixed(5)}°${latDir}, ${Math.abs(
              longitude,
            ).toFixed(5)}°${lonDir}`,
          );
        },
        error => {
          console.warn('Geolocation Error (High Accuracy Failed):', error.code, error.message);
          // Fallback to coarse location if fine fails or times out
          Geolocation.getCurrentPosition(
            p => {
              const { latitude, longitude } = p.coords;
              const latDir = latitude >= 0 ? 'N' : 'S';
              const lonDir = longitude >= 0 ? 'E' : 'W';
              setGpsLocation(
                `${Math.abs(latitude).toFixed(5)}°${latDir}, ${Math.abs(
                  longitude,
                ).toFixed(5)}°${lonDir} (Approx)`,
              );
            },
            e => {
              console.warn('Geolocation Error (Fallback Failed):', e.code, e.message);
              setGpsLocation('Location Unavailable');
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
      );
    };

    requestLocationPermission();
  }, []);

  const handleCameraLaunch = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'App needs camera permission to capture container verification photos',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.warn('Camera Error: ', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri || null);
        }
      },
    );
  };

  const isDisabled = !containerNum.trim() || !sealNum.trim() || !imageUri;

  const handleConfirm = () => {
    if (isDisabled) return;
    onOpen(containerNum, sealNum, imageUri || undefined);
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

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={s.content}>
            {/* Selected Pill */}
            <View style={s.pillCenter}>
              <View
                style={[
                  s.pill,
                  { backgroundColor: C.surface, borderColor: C.border },
                ]}
              >
                <Text style={[s.pillText, { color: C.text }]}>
                  {selection.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Inputs */}
            <TextInput
              style={[
                s.inputBlock,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                  color: C.text,
                },
              ]}
              value={containerNum}
              onChangeText={setContainerNum}
              placeholder={`Enter ${selection.toUpperCase()} number`}
              placeholderTextColor={C.muted}
              autoCapitalize="characters"
              returnKeyType="next"
            />

            <TextInput
              style={[
                s.inputBlock,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                  color: C.text,
                },
              ]}
              value={sealNum}
              onChangeText={setSealNum}
              placeholder="Enter SEAL number"
              placeholderTextColor={C.muted}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            {/* Camera Box */}
            <TouchableOpacity
              style={[
                s.cameraBox,
                {
                  backgroundColor: C.surfaceHigh,
                  borderColor: C.border,
                  overflow: 'hidden',
                },
              ]}
              activeOpacity={0.8}
              onPress={handleCameraLaunch}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={s.cameraImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                >
                  <MaterialIcon
                    name="camera"
                    size={40}
                    color={C.muted}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{ color: C.muted, fontSize: 13, fontWeight: '700' }}
                  >
                    Click to Take Picture
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Data Card */}
            <View
              style={[
                s.dataCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
            >
              <View style={s.dataRow}>
                <Text style={[s.dataLabel, { color: C.text }]}>Login ID:</Text>
                <Text style={[s.dataValue, { color: C.text }]}>{userId}</Text>
              </View>
              <View style={s.dataRow}>
                <Text style={[s.dataLabel, { color: C.text }]}>Date:</Text>
                <Text style={[s.dataValue, { color: C.text }]}>
                  {currentDate}
                </Text>
              </View>
              <View style={s.dataRow}>
                <Text style={[s.dataLabel, { color: C.text }]}>Time:</Text>
                <Text style={[s.dataValue, { color: C.text }]}>
                  {currentTime}
                </Text>
              </View>
              <View style={s.dataRow}>
                <Text style={[s.dataLabel, { color: C.text }]}>GPS:</Text>
                <Text style={[s.dataValue, { color: C.text }]}>
                  {gpsLocation}
                </Text>
              </View>
              <View style={s.dataRow}>
                <Text style={[s.dataLabel, { color: C.text }]}>
                  Battery Level:
                </Text>
                <Text style={[s.dataValue, { color: C.text }]}>97%</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Fixed Footer Buttons */}
      <View style={[s.footerContainer, { backgroundColor: C.bg }]}>
        {flow === 'lock' && (
          <TouchableOpacity
            style={[
              s.btn,
              {
                backgroundColor: C.text,
                elevation: isDisabled ? 0 : 4,
                opacity: isDisabled ? 0.4 : 1,
              },
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={isDisabled}
          >
            <Text style={[s.btnText, { color: C.bg }]}>CONFIRM</Text>
          </TouchableOpacity>
        )}

        {flow === 'open' && (
          <TouchableOpacity
            style={[
              s.btn,
              {
                backgroundColor: C.text,
                elevation: isDisabled ? 0 : 4,
                opacity: isDisabled ? 0.4 : 1,
              },
            ]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isDisabled}
          >
            <Text style={[s.btnText, { color: C.bg }]}>OPEN</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1 },
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: 0,
  },

  pillCenter: { alignItems: 'center', marginBottom: 6 },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  inputBlock: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },

  cameraBox: {
    flex: 1,
    minHeight: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cameraImage: { width: '100%', height: '100%' },

  dataCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    alignItems: 'center',
  },
  dataLabel: { fontSize: 13, fontWeight: '600' },
  dataValue: { fontSize: 13, fontWeight: '500' },

  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 10 : SPACING.lg,
    paddingTop: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  btnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },

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

export default ActionDashboardScreen;
