import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {GlobalHeader} from '../components/GlobalHeader';

interface Props {
  isDark: boolean;
  flow: 'lock' | 'open';
  selection?: 'container' | 'trailer';
  onOpen: (container: string, seal: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

const ActionDashboardScreen: React.FC<Props> = ({isDark, flow, selection = 'container', onOpen, onLogout, onToggleTheme}) => {
  const C = getTheme(isDark);
  const { loginId } = useSelector((state: RootState) => state.auth);
  
  const [containerNum, setContainerNum] = React.useState('');
  const [sealNum, setSealNum] = React.useState('');
  const [currentDate, setCurrentDate] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDisabled = !containerNum.trim() || !sealNum.trim();

  const handleConfirm = () => {
    if (isDisabled) return;
    onOpen(containerNum, sealNum);
  };

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <GlobalHeader 
        isDark={isDark} 
        onToggleTheme={onToggleTheme} 
        onLogout={onLogout} 
      />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Selected Pill */}
        <View style={s.pillCenter}>
          <View style={[s.pill, {backgroundColor: C.surface, borderColor: C.border}]}>
            <Text style={[s.pillText, {color: C.text}]}>{selection.toUpperCase()}</Text>
          </View>
        </View>

        {/* Inputs */}
        <TextInput
          style={[s.inputBlock, {backgroundColor: C.surface, borderColor: C.border, color: C.text}]}
          value={containerNum}
          onChangeText={setContainerNum}
          placeholder={`Enter ${selection.toUpperCase()} number`}
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
        />

        <TextInput
          style={[s.inputBlock, {backgroundColor: C.surface, borderColor: C.border, color: C.text}]}
          value={sealNum}
          onChangeText={setSealNum}
          placeholder="Enter SEAL number"
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
        />

        {/* Camera Box with actual image */}
        <View style={[s.cameraBox, {backgroundColor: C.surfaceHigh, borderColor: C.border, overflow: 'hidden'}]}>
          <Image 
            source={require('../../assets/demophoto.jpeg')} 
            style={s.cameraImage} 
            resizeMode="cover" 
          />
        </View>

        {/* Data Card */}
        <View style={[s.dataCard, {backgroundColor: C.surface, borderColor: C.border}]}>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>Date:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{currentDate}</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>Time:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{currentTime}</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>GPS:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>31.44.10.1N, 118.15.5.8W</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>Battery Level:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>97%</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>Lock SN:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>CL001</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>Login ID:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{loginId || 'N/A'}</Text>
          </View>
        </View>

        {/* Confirm Button (Only in Flow 1) */}
        {flow === 'lock' && (
          <TouchableOpacity 
           style={[s.btn, {backgroundColor: C.text, elevation: isDisabled ? 0 : 4, opacity: isDisabled ? 0.4 : 1}]} 
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={isDisabled}
          >
            <Text style={[s.btnText, {color: C.bg}]}>CONFIRM</Text>
          </TouchableOpacity>
        )}

        {/* Open Button (Only in Flow 2) */}
        {flow === 'open' && (
          <TouchableOpacity 
            style={[s.btn, {backgroundColor: C.text, elevation: isDisabled ? 0 : 4, opacity: isDisabled ? 0.4 : 1}]} 
            onPress={handleConfirm} 
            activeOpacity={0.85}
            disabled={isDisabled}
          >
            <Text style={[s.btnText, {color: C.bg}]}>OPEN</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {flex: 1},

  content: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: 0},
  
  pillCenter: {alignItems: 'center', marginBottom: 8},
  pill: {paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1},
  pillText: {fontSize: 12, fontWeight: '700', letterSpacing: 1},

  inputBlock: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },

  cameraBox: {height: 130, borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  cameraImage: {width: '100%', height: '100%'},

  dataCard: {padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 12},
  dataRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  dataLabel: {fontSize: 13, fontWeight: '600'},
  dataValue: {fontSize: 13, fontWeight: '500'},

  btn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, marginBottom: 8},
  btnText: {fontSize: 14, fontWeight: '800', letterSpacing: 2},
});

export default ActionDashboardScreen;
