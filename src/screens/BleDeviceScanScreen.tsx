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
    
    bleService.manager.startDeviceScan(null, null, (error, scannedDevice) => {
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

        <FlatList
          data={devices}
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
