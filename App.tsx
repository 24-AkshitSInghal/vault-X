/**
 * VaultX — Dock Container Lock/Unlock App
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <LoginScreen />
    </SafeAreaProvider>
  );
}

export default App;
