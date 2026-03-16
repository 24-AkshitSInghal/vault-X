import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlowType } from '../constants/credentials';

const SESSION_KEY = '@VAULTX_SESSION';
const SESSION_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

interface SessionData {
  userId: string;
  flow: FlowType;
  expiresAt: number;
}

export const createSession = async (userId: string, flow: FlowType): Promise<void> => {
  const expiresAt = Date.now() + SESSION_EXPIRATION_MS;
  const data: SessionData = { userId, flow, expiresAt };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

export const getSession = async (): Promise<SessionData | null> => {
  const stored = await AsyncStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const data: SessionData = JSON.parse(stored);
    if (Date.now() > data.expiresAt) {
      // Session expired
      await clearSession();
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
