/**
 * VaultX — Dock Container Lock/Unlock App
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import OtpLoginScreen      from './src/screens/OtpLoginScreen';
import LockDashboardScreen from './src/screens/LockDashboardScreen';
import LockProgressScreen  from './src/screens/LockProgressScreen';
import LockWarningScreen   from './src/screens/LockWarningScreen';
import ActionDashboardScreen from './src/screens/ActionDashboardScreen';
import OpenWarningScreen   from './src/screens/OpenWarningScreen';
import OpenProgressScreen  from './src/screens/OpenProgressScreen';
import FinalScreen         from './src/screens/FinalScreen';
import {FlowType}          from './src/constants/credentials';
import {createSession, getSession, clearSession} from './src/utils/session';

type Screen = 'login' | 'dashboard' | 'lockProgress' | 'lockWarning' | 'actionDashboard' | 'openWarning' | 'openProgress' | 'final';

function App(): React.JSX.Element {
  const [isDark,     setIsDark]     = useState(true);
  const [screen,     setScreen]     = useState<Screen>('login');
  const [flow,       setFlow]       = useState<FlowType>('lock');
  const [selection,  setSelection]  = useState<'container' | 'trailer'>('container');
  const [containerNum, setContainerNum] = useState<string>('');
  const [sealNum,      setSealNum]      = useState<string>('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const session = await getSession();
      if (session) {
        setFlow(session.flow);
        if (session.flow === 'open') {
          setScreen('actionDashboard');
        } else {
          setScreen('dashboard');
        }
      }
      setIsCheckingSession(false);
    };
    initSession();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    setScreen('login');
  };

  const toggleTheme = () => setIsDark(v => !v);

  if (isCheckingSession) {
    return <SafeAreaProvider />;
  }

  return (
    <SafeAreaProvider>
      {screen === 'login' && (
        <OtpLoginScreen
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLoginSuccess={async (f: FlowType, userId: string) => { 
            await createSession(userId, f);
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
          onLogout={handleLogout}
          onProceed={sel => { setSelection(sel); setScreen('lockProgress'); }}
        />
      )}

      {screen === 'lockProgress' && (
        <LockProgressScreen
          isDark={isDark}
          flow={flow}
          selection={selection}
          onWarning={() => setScreen('lockWarning')}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'lockWarning' && (
        <LockWarningScreen
          isDark={isDark}
          flow={flow}
          onConfirm={() => setScreen('actionDashboard')}
          onReset={() => setScreen('dashboard')}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
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
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'openWarning' && (
        <OpenWarningScreen
          isDark={isDark}
          onYes={() => setScreen('openProgress')}
          onNo={() => setScreen('actionDashboard')}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'openProgress' && (
        <OpenProgressScreen
          isDark={isDark}
          selection={selection}
          onComplete={() => setScreen('login')}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'final' && (
        <FinalScreen
          isDark={isDark}
          containerNum={containerNum}
          sealNum={sealNum}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
