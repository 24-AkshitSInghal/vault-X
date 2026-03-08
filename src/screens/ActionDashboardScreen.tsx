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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';

interface Props {
  isDark: boolean;
  flow: 'lock' | 'open';
  selection?: 'container' | 'trailer';
  onOpen: (container: string, seal: string) => void;
  onLogout: () => void;
}

// ── Removed LockIcon block, using PNG image instead ─────────────────────────

const ActionDashboardScreen: React.FC<Props> = ({isDark, flow, selection = 'container', onOpen, onLogout}) => {
  const C = getTheme(isDark);
  
  const [containerNum, setContainerNum] = React.useState('TCLU9693193');
  const [sealNum, setSealNum] = React.useState('');

  const isDisabled = !containerNum.trim() || !sealNum.trim();

  const handleConfirm = () => {
    if (isDisabled) return;
    onOpen(containerNum, sealNum);
  };

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Top bar */}
      <View style={s.topBar}>
        <View style={{width: 40}} />
        <View style={{alignItems: 'center'}}>
          <Image 
            source={isDark ? require('../../assets/white-logo.png') : require('../../assets/black-logo.png')} 
             style={{ width: 200, height: 100, resizeMode: 'contain' }} 
          />
        </View>
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={onLogout}>
          <MaterialIcon name="logout-variant" size={16} color={C.subText} />
        </TouchableOpacity>
      </View>

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
          placeholder="Enter CONTAINER number"
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
            <Text style={[s.dataValue, {color: C.text}]}>Mar 08, 2026</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.text}]}>Time:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>01:05:59 PM</Text>
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
            <Text style={[s.dataLabel, {color: C.text}]}>Winch:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>CL001</Text>
          </View>
        </View>

        {/* Confirm Button (Only in Flow 1) */}
        {flow === 'lock' && (
          <TouchableOpacity 
            style={[s.btn, {backgroundColor: C.surface, borderColor: C.border, opacity: isDisabled ? 0.4 : 1}]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={isDisabled}
          >
            <MaterialIcon name="check-circle-outline" size={18} color={isDisabled ? C.muted : C.text} style={{marginRight: 8}} />
            <Text style={[s.btnText, {color: isDisabled ? C.muted : C.text}]}>CONFIRM</Text>
          </TouchableOpacity>
        )}

        {/* Open Button */}
        <TouchableOpacity 
          style={[s.btn, {backgroundColor: C.text, elevation: isDisabled ? 0 : 4, opacity: isDisabled ? 0.4 : 1}]} 
          onPress={handleConfirm} 
          activeOpacity={0.85}
          disabled={isDisabled}
        >
          <Text style={[s.btnText, {color: C.bg}]}>OPEN</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {flex: 1},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
           paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm},
  logo: {fontSize: 20, fontWeight: '800', letterSpacing: 4},
  iconBtn: {width: 36, height: 36, borderRadius: 18, alignItems: 'center',
            justifyContent: 'center', borderWidth: 1},

  content: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: SPACING.md},
  
  pillCenter: {alignItems: 'center', marginBottom: SPACING.md},
  pill: {paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1},
  pillText: {fontSize: 12, fontWeight: '700', letterSpacing: 1},

  inputBlock: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },

  cameraBox: {height: 160, borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg},
  cameraImage: {width: '100%', height: '100%'},

  dataCard: {padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: SPACING.xl},
  dataRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6},
  dataLabel: {fontSize: 13, fontWeight: '600'},
  dataValue: {fontSize: 13, fontWeight: '500'},

  btn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: RADIUS.md, marginBottom: SPACING.md},
  btnText: {fontSize: 14, fontWeight: '800', letterSpacing: 2},
});

export default ActionDashboardScreen;
