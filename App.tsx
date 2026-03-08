/**
 * VaultX — Dock Container Lock/Unlock App
 */

import React, {useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import LoginScreen         from './src/screens/LoginScreen';
import LockDashboardScreen from './src/screens/LockDashboardScreen';
import LockProgressScreen  from './src/screens/LockProgressScreen';
import LockWarningScreen   from './src/screens/LockWarningScreen';
import ActionDashboardScreen from './src/screens/ActionDashboardScreen';
import OpenWarningScreen   from './src/screens/OpenWarningScreen';
import OpenProgressScreen  from './src/screens/OpenProgressScreen';
import FinalScreen         from './src/screens/FinalScreen';
import {FlowType}          from './src/constants/credentials';

type Screen = 'login' | 'dashboard' | 'lockProgress' | 'lockWarning' | 'actionDashboard' | 'openWarning' | 'openProgress' | 'final';

function App(): React.JSX.Element {
  const [isDark,     setIsDark]     = useState(true);
  const [screen,     setScreen]     = useState<Screen>('login');
  const [flow,       setFlow]       = useState<FlowType>('lock');
  const [selection,  setSelection]  = useState<'container' | 'trailer'>('container');
  const [containerNum, setContainerNum] = useState<string>('');
  const [sealNum,      setSealNum]      = useState<string>('');

  const toggleTheme = () => setIsDark(v => !v);

  return (
    <SafeAreaProvider>
      {screen === 'login' && (
        <LoginScreen
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLoginSuccess={f => { 
            setFlow(f); 
            if (f === 'open') {
              setScreen('actionDashboard');
            } else {
              setScreen('dashboard'); 
            }
          }}
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
          onConfirm={() => setScreen('actionDashboard')}
          onReset={() => setScreen('dashboard')}
          onLogout={() => setScreen('login')}
        />
      )}

      {screen === 'actionDashboard' && (
        <ActionDashboardScreen
          isDark={isDark}
          flow={flow}
          selection={selection}
          onOpen={(container, seal) => {
            setContainerNum(container);
            setSealNum(seal);
            if (flow === 'open') {
              setScreen('openWarning');
            } else {
              setScreen('final');
            }
          }}
          onLogout={() => setScreen('login')}
        />
      )}

      {screen === 'openWarning' && (
        <OpenWarningScreen
          isDark={isDark}
          onYes={() => setScreen('openProgress')}
          onNo={() => setScreen('actionDashboard')}
          onLogout={() => setScreen('login')}
        />
      )}

      {screen === 'openProgress' && (
        <OpenProgressScreen
          isDark={isDark}
          selection={selection}
          onComplete={() => setScreen('login')}
          onLogout={() => setScreen('login')}
        />
      )}

      {screen === 'final' && (
        <FinalScreen
          isDark={isDark}
          containerNum={containerNum}
          sealNum={sealNum}
          onLogout={() => setScreen('login')}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
