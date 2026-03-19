import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { getTheme, RADIUS, SPACING } from '../constants/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import { FlowType } from '../constants/credentials';
import bleService from '../services/bleService';
import { Device } from 'react-native-ble-plx';
import { BleDeviceItem } from '../components/BleDeviceItem';

interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
  flow: FlowType;
  onDeviceConnected: () => void;
  onLogout: () => void;
}

const BleDeviceScanScreen: React.FC<Props> = ({
  isDark,
  onToggleTheme,
  onDeviceConnected,
  onLogout,
}) => {
  const C = getTheme(isDark);

  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Initializing...');
  const [searchQuery, setSearchQuery] = useState('');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulse: Animated.CompositeAnimation;
    if (isScanning) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => pulse && pulse.stop();
  }, [isScanning, pulseAnim]);

  useEffect(() => {
    initBluetooth();
    return () => {
      bleService.manager.stopDeviceScan();
    };
  }, []);

  const initBluetooth = async () => {
    const hasPermissions = await bleService.requestPermissions();
    if (!hasPermissions) {
      setStatusText('Bluetooth Permisssions Denied');
      return;
    }
    const isEnabled = await bleService.isBluetoothEnabled();
    if (!isEnabled) {
      setStatusText('Bluetooth is Disabled');
      return;
    }
    startScanning();
  };

  const startScanning = () => {
    setDevices([]);
    setIsScanning(true);
    setStatusText('Scanning for nearby devices...');

    // const TARGET_SERVICE_UUID = 'f000fff0-0451-4000-b000-000000000000';

    bleService.manager.startDeviceScan([], null, (error, scannedDevice) => {
      if (error) {
        console.warn('BLE Scan Error', error);
        setIsScanning(false);
        const errString = error.message?.toLowerCase() || '';
        if (errString.includes('unsupported')) {
          setStatusText('BLE is not supported on this Simulator/Device.');
        } else {
          setStatusText('Scan failed or stopped.');
        }
        return;
      }

      if (scannedDevice) {
        setDevices((prev) => {
          if (!prev.find((d) => d.id === scannedDevice.id)) {
            return [...prev, scannedDevice];
          }
          return prev;
        });
      }
    });

    // Stop scanning after 10 seconds to save battery
    setTimeout(() => {
      bleService.manager.stopDeviceScan();
      setIsScanning(false);
      setStatusText('Scan complete.');
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      setConnectingId(device.id);
      setIsScanning(false);
      bleService.manager.stopDeviceScan();
      setStatusText(`Connecting to ${device.name || 'Unknown Device'}...`);

      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      bleService.connectedDevice = connectedDevice;

      setStatusText('Connected Successfully!');
      setTimeout(() => {
        onDeviceConnected();
      }, 1000);
    } catch (error) {
      console.warn('BLE Connect Error', error);
      setStatusText('Connection Failed. Please try again.');
      setConnectingId(null);
    }
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <GlobalHeader
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        showLogout={true}
        showLogo={true}
      />

      <View style={s.container}>
        <View style={s.headerContainer}>
          <Animated.View style={[s.iconWrapper, { backgroundColor: C.surface, borderColor: C.border, transform: [{ scale: pulseAnim }] }]}>
            <MaterialIcon name="bluetooth" size={28} color={isScanning ? C.text : C.muted} />
          </Animated.View>
          <Text style={[s.title, { color: C.text }]}>SELECT BLE DEVICE</Text>
          <Text style={[s.subtitle, { color: connectingId ? C.warning : C.muted }]}>{statusText}</Text>
        </View>

        <View style={[s.searchContainer, { backgroundColor: C.surface, borderColor: C.border }]}>
          <MaterialIcon name="magnify" size={20} color={C.muted} style={s.searchIcon} />
          <TextInput
            style={[s.searchInput, { color: C.text }]}
            placeholder="Search devices..."
            placeholderTextColor={C.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearBtn}>
              <MaterialIcon name="close" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={devices.filter((device) => {
            const term = searchQuery.toLowerCase();
            const name = (device.name || 'Unknown Device').toLowerCase();
            const id = device.id.toLowerCase();
            return name.includes(term) || id.includes(term);
          })}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          renderItem={({ item }) => (
            <BleDeviceItem
              device={item}
              isDark={isDark}
              onConnect={connectToDevice}
              isConnecting={!!connectingId}
              connectedDeviceId={connectingId}
            />
          )}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              {!isScanning && !connectingId ? (
                <Text style={{ color: C.muted, fontSize: 13 }}>No devices found nearby.</Text>
              ) : null}
            </View>
          }
        />

        {!connectingId && (
          <TouchableOpacity
            style={[s.scanBtn, { backgroundColor: C.btnBg }]}
            onPress={startScanning}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={C.btnText} style={{ marginRight: 8 }} />
            ) : (
              <MaterialIcon name="radar" size={18} color={C.btnText} style={{ marginRight: 8 }} />
            )}
            <Text style={[s.scanBtnText, { color: C.btnText }]}>
              {isScanning ? 'SCANNING...' : 'RESCAN FOR DEVICES'}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── DEV SKIP BUTTON (development only) ── */}
        {/* {__DEV__ && !connectingId && (
          <TouchableOpacity
            style={{ marginTop: 15, padding: 15, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'red', alignItems: 'center' }}
            onPress={() => onDeviceConnected()}
          >
            <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 }}>SKIP BLE (DEV)</Text>
          </TouchableOpacity>
        )} */}

      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  clearBtn: {
    padding: 8,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: RADIUS.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 'auto',
  },
  scanBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default BleDeviceScanScreen;
