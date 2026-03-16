import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { getTheme, RADIUS } from '../constants/colors';
import { Device } from 'react-native-ble-plx';

interface BleDeviceItemProps {
  device: Device;
  isDark: boolean;
  onConnect: (device: Device) => void;
  isConnecting: boolean;
  connectedDeviceId: string | null;
}

export const BleDeviceItem: React.FC<BleDeviceItemProps> = ({
  device,
  isDark,
  onConnect,
  isConnecting,
  connectedDeviceId,
}) => {
  const C = getTheme(isDark);
  const name = device.name || 'Unknown Device';
  const isThisDeviceConnecting = isConnecting && connectedDeviceId === device.id;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: C.surface, borderColor: C.border },
      ]}
      onPress={() => onConnect(device)}
      disabled={isConnecting}
    >
      <View style={styles.infoWrapper}>
        <MaterialIcon name="bluetooth" size={24} color={C.text} style={styles.icon} />
        <View style={styles.textWrapper}>
          <Text style={[styles.nameText, { color: C.text }]}>{name}</Text>
          <Text style={[styles.idText, { color: C.muted }]}>Device ID: {device.id}</Text>
        </View>
      </View>
      <View style={[styles.connectBadge, { backgroundColor: isThisDeviceConnecting ? C.warning : C.btnBg }]}>
        <Text style={[styles.connectText, { color: isThisDeviceConnecting ? '#000' : C.btnText }]}>
          {isThisDeviceConnecting ? 'CONNECTING...' : 'CONNECT'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  icon: {
    opacity: 0.8,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  idText: {
    fontSize: 12,
  },
  connectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  connectText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
