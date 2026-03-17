import { BleManager, Device, State, BleError } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';

class BLEService {
  manager: BleManager;
  connectedDevice: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'VaultX needs location permission to find BLE devices',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      if (apiLevel >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return false;
  }

  isBluetoothEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      this.manager.state().then((state) => {
        resolve(state === State.PoweredOn);
      });
    });
  }

  async sendCommand(hexCommand: string): Promise<boolean> {
    try {
      const device = this.connectedDevice;
      if (!device || !(await device.isConnected())) {
        console.warn('sendBleCommand: No connected device');
        return false;
      }
      
      const base64Payload = Buffer.from(hexCommand.replace('0x', ''), 'hex').toString('base64');

      const services = await device.services();
      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          if (char.isWritableWithoutResponse) {
            await char.writeWithoutResponse(base64Payload);
            return true;
          } else if (char.isWritableWithResponse) {
            await char.writeWithResponse(base64Payload);
            return true;
          }
        }
      }
      console.warn('sendBleCommand: No writable characteristic found');
      return false;
    } catch (error) {
      console.warn('sendBleCommand Error:', error);
      return false;
    }
  }
}

const bleService = new BLEService();
export default bleService;
