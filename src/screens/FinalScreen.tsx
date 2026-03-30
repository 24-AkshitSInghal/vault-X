import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { getTheme, RADIUS, SPACING } from '../constants/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import Geolocation from 'react-native-geolocation-service';
import bleService from '../services/bleService';

interface Props {
  isDark: boolean;
  flow: 'lock' | 'open';
  containerNum: string;
  sealNum: string;
  userId: string;
  capturedImage?: string | null;
  onLogout: () => void;
  onNext?: () => void;
  onToggleTheme: () => void;
}

const FinalScreen: React.FC<Props> = ({
  isDark,
  flow,
  containerNum,
  sealNum,
  userId,
  capturedImage,
  onLogout,
  onNext,
  onToggleTheme,
}) => {
  const C = getTheme(isDark);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [gpsLocation, setGpsLocation] = useState('Fetching...');

  useEffect(() => {
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
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        if (result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED) {
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
          // Fallback 1: Coarse location
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
              console.warn('Geolocation Error (Coarse Failed):', e.code, e.message);
              // Fallback 2: Force native location manager (bypass Play Services)
              Geolocation.getCurrentPosition(
                p2 => {
                  const { latitude, longitude } = p2.coords;
                  setGpsLocation(`${Math.abs(latitude).toFixed(5)}°, ${Math.abs(longitude).toFixed(5)}° (Native)`);
                },
                e2 => {
                  console.warn('Geolocation Error (Native Failed):', e2.code, e2.message);
                  setGpsLocation('Location Unavailable');
                },
                { enableHighAccuracy: false, timeout: 15000, forceLocationManager: true }
              );
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
      );
    };

    requestLocationPermission();
  }, []);

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

      <View style={s.content}>
        {/* Verification Image Box */}
        <View
          style={[
            s.cameraBox,
            { backgroundColor: C.surfaceHigh, borderColor: C.border },
          ]}
        >
          <Image
            source={
              capturedImage
                ? { uri: capturedImage }
                : require('../../assets/demophoto.jpeg')
            }
            style={s.cameraImage}
            resizeMode="cover"
          />
          {/* Overlay gradient to match mockup look */}
          <View style={s.cameraOverlay} />
        </View>

        {/* Data Card */}
        <View
          style={[
            s.dataCard,
            { backgroundColor: C.surfaceHigh, borderColor: C.border },
          ]}
        >
          <View
            style={[
              s.dataRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                paddingBottom: 10,
                marginBottom: 5,
              },
            ]}
          >
            <Text style={[s.dataLabel, { color: C.text, fontSize: 14 }]}>
              Status:
            </Text>
            <View
              style={{
                backgroundColor:
                  flow === 'lock'
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(245,158,11,0.15)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                style={[
                  s.dataValue,
                  {
                    color: flow === 'lock' ? '#10B981' : '#F59E0B',
                    fontWeight: '900',
                    letterSpacing: 1,
                  },
                ]}
              >
                {flow === 'lock' ? 'LOCKED' : 'UNLOCKED'}
              </Text>
            </View>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>Login ID:</Text>
            <Text style={[s.dataValue, { color: C.text }]}>{userId}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>Date:</Text>
            <Text style={[s.dataValue, { color: C.text }]}>{currentDate}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>Time:</Text>
            <Text style={[s.dataValue, { color: C.text }]}>{currentTime}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>GPS:</Text>
            <Text style={[s.dataValue, { color: C.text }]}>{gpsLocation}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>Battery:</Text>
            <Text style={[s.dataValue, { color: C.text }]}>97%</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>
              Container #:
            </Text>
            <Text style={[s.dataValue, { color: C.text }]}>
              {containerNum || 'TCLU9693193'}
            </Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>Seal #:</Text>
            <Text style={[s.dataValue, { color: C.text }]}>{sealNum}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, { color: C.subText }]}>Lock SN:</Text>
            <Text
              style={[
                s.dataValue,
                { color: C.text, flex: 1, textAlign: 'right', marginLeft: 10 },
              ]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {bleService.connectedDevice?.id || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Disclaimer Warning */}
        <View style={s.disclaimerWrapper}>
          <Text style={[s.disclaimer, { color: C.text }]}>
            PLEASE TAKE A SCREENSHOT OF THIS PAGE AND SEND TO YOUR SUPERVISOR
            BEFORE {flow === 'open' ? 'PROCEEDING' : 'LOGGING OUT'}
          </Text>
        </View>
      </View>

      <View style={s.footer}>
        {flow === 'open' ? (
          <TouchableOpacity
            style={[s.logoutBtn, { backgroundColor: C.success }]}
            onPress={onNext}
            activeOpacity={0.85}
          >
            <Text style={[s.logoutBtnText, { color: '#FFF' }]}>NEXT</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.logoutBtn, { backgroundColor: C.btnBg }]}
            onPress={onLogout}
            activeOpacity={0.85}
          >
            <Text style={[s.logoutBtnText, { color: C.btnText }]}>LOGOUT</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 10,
  },

  cameraBox: {
    height: 210,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  dataCard: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  disclaimerWrapper: {
    paddingHorizontal: SPACING.md,
  },
  disclaimer: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  nextBtn: {
    backgroundColor: '#10B981',
  },

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

export default FinalScreen;
