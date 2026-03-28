import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
  PermissionsAndroid,
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
  containerNum: string;
  sealNum: string;
  userId: string;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const CargoPhotoScreen: React.FC<Props> = ({
  isDark,
  containerNum,
  sealNum,
  userId,
  onLogout,
  onToggleTheme,
}) => {
  const C = getTheme(isDark);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [gpsLocation, setGpsLocation] = useState('Fetching...');
  const [cargoImage, setCargoImage] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    setCurrentDate(dateStr);

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
        if (auth === 'granted') getLocation();
        else setGpsLocation('Permission Denied');
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
          // Fallback
          Geolocation.getCurrentPosition(
            p => {
              const { latitude, longitude } = p.coords;
              const latDir = latitude >= 0 ? 'N' : 'S';
              const lonDir = longitude >= 0 ? 'E' : 'W';
              setGpsLocation(`${Math.abs(latitude).toFixed(5)}°${latDir}, ${Math.abs(longitude).toFixed(5)}°${lonDir} (Approx)`);
            },
            e => {
              console.warn('Geolocation Error (Fallback Failed):', e.code, e.message);
              setGpsLocation('Location Unavailable');
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
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
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setCargoImage(response.assets[0].uri || null);
        }
      },
    );
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

      <View style={s.content}>
        {/* Cargo Image Box */}
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
          {cargoImage ? (
            <Image
              source={{ uri: cargoImage }}
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
              <Text style={{ color: C.muted, fontSize: 13, fontWeight: '700' }}>
                Click to Take Cargo Picture
              </Text>
            </View>
          )}
        </TouchableOpacity>

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
                backgroundColor: 'rgba(245,158,11,0.15)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                style={[
                  s.dataValue,
                  { color: '#F59E0B', fontWeight: '900', letterSpacing: 1 },
                ]}
              >
                CARGO PHOTO
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

        <View style={s.disclaimerWrapper}>
          <Text style={[s.disclaimer, { color: C.text }]}>
            PLEASE TAKE A SCREENSHOT OF THE CARGO PHOTO BEFORE LOGGING OUT
          </Text>
        </View>
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={[
            s.logoutBtn,
            { backgroundColor: C.btnBg, opacity: cargoImage ? 1 : 0.5 },
          ]}
          onPress={onLogout}
          activeOpacity={0.85}
          disabled={!cargoImage}
        >
          <Text style={[s.logoutBtnText, { color: C.btnText }]}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 10 },
  cameraBox: {
    flex: 1,
    minHeight: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  cameraImage: { width: '100%', height: '100%' },
  dataCard: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    alignItems: 'center',
  },
  dataLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  dataValue: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  disclaimerWrapper: { paddingHorizontal: SPACING.md },
  disclaimer: {
    fontSize: 11,
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
  },
  logoutBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});

export default CargoPhotoScreen;
