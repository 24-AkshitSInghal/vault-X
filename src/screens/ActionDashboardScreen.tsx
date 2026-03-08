import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';

interface Props {
  isDark: boolean;
  onOpen: () => void;
  onLogout: () => void;
}

// ── Lock Icon ─────────────────────────────────────────────────────────────────
const LockIcon = ({color}: {color: string}) => (
  <View style={{alignItems: 'center', marginBottom: 6}}>
    <View style={{width: 22, height: 16, borderTopLeftRadius: 11, borderTopRightRadius: 11,
      borderWidth: 3.5, borderBottomWidth: 0, borderColor: color, marginBottom: -2}} />
    <View style={{width: 42, height: 34, borderRadius: 8, backgroundColor: color,
      alignItems: 'center', justifyContent: 'center'}}>
      <View style={{width: 9, height: 9, borderRadius: 4.5, backgroundColor: 'rgba(0,0,0,0.2)'}} />
    </View>
  </View>
);

const ActionDashboardScreen: React.FC<Props> = ({isDark, onOpen, onLogout}) => {
  const C = getTheme(isDark);

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Top bar */}
      <View style={s.topBar}>
        <View style={{width: 40}} />
        <View style={{alignItems: 'center'}}>
          <LockIcon color={C.text} />
          <Text style={[s.logo, {color: C.text}]}>VAULT<Text style={{color: C.muted}}>X</Text></Text>
        </View>
        <TouchableOpacity
          style={[s.iconBtn, {backgroundColor: C.surface, borderColor: C.border}]}
          onPress={onLogout}>
          <MaterialIcon name="logout-variant" size={16} color={C.subText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Container Pill */}
        <View style={s.pillCenter}>
          <View style={[s.pill, {backgroundColor: C.surface, borderColor: C.border}]}>
            <Text style={[s.pillText, {color: C.text}]}>CONTAINER</Text>
          </View>
        </View>

        {/* ID Block */}
        <View style={[s.idBlock, {backgroundColor: C.surface, borderColor: C.border}]}>
          <Text style={[s.idText, {color: C.text}]}>CXDU7782632</Text>
        </View>

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

        {/* Status Indicator */}
        <View style={[s.btn, {backgroundColor: 'transparent', borderColor: 'transparent', marginBottom: SPACING.md, elevation: 0}]}>
          <MaterialIcon name="check-circle-outline" size={18} color={C.text} style={{marginRight: 8}} />
          <Text style={[s.btnText, {color: C.text}]}>CONFIRM</Text>
        </View>

        <TouchableOpacity style={[s.btn, {backgroundColor: C.text, elevation: 4}]} onPress={onOpen} activeOpacity={0.85}>
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

  idBlock: {alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.lg},
  idText: {fontSize: 16, fontWeight: '800', letterSpacing: 2},

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
