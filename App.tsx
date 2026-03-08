/**
 * VaultX — Dock Container Lock/Unlock App
 */

import React, {useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import LoginScreen         from './src/screens/LoginScreen';
import LockDashboardScreen from './src/screens/LockDashboardScreen';
import LockProgressScreen  from './src/screens/LockProgressScreen';
import LockWarningScreen   from './src/screens/LockWarningScreen';
import {FlowType}          from './src/constants/credentials';

type Screen = 'login' | 'dashboard' | 'lockProgress' | 'lockWarning';

function App(): React.JSX.Element {
  const [isDark,     setIsDark]     = useState(true);
  const [screen,     setScreen]     = useState<Screen>('login');
  const [flow,       setFlow]       = useState<FlowType>('lock');
  const [selection,  setSelection]  = useState<'container' | 'trailer'>('container');

  const toggleTheme = () => setIsDark(v => !v);

  return (
    <SafeAreaProvider>
      {screen === 'login' && (
        <LoginScreen
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLoginSuccess={f => { setFlow(f); setScreen('dashboard'); }}
        />
      )}

      {screen === 'dashboard' && (
        <LockDashboardScreen
          isDark={isDark}
          flow={flow}
          onToggleTheme={toggleTheme}
          onLogout={() => setScreen('login')}
          onProceed={sel => { setSelection(sel); setScreen('lockProgress'); }}
        />
      )}

      {screen === 'lockProgress' && (
        <LockProgressScreen
          isDark={isDark}
          flow={flow}
          selection={selection}
          onWarning={() => setScreen('lockWarning')}
          onLogout={() => setScreen('login')}
        />
      )}

      {screen === 'lockWarning' && (
        <LockWarningScreen
          isDark={isDark}
          flow={flow}
          onConfirm={() => setScreen('dashboard')}
          onReset={() => setScreen('dashboard')}
          onLogout={() => setScreen('login')}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
