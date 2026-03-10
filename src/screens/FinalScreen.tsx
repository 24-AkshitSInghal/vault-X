import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
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
  selection: 'container' | 'trailer';
  containerNum: string;
  sealNum: string;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const FinalScreen: React.FC<Props> = ({isDark, flow, selection, containerNum, sealNum, onLogout, onToggleTheme}) => {
  const C = getTheme(isDark);
  const { loginId } = useSelector((state: RootState) => state.auth);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    // Format Date: Mar 08, 2026
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric'
    });
    setCurrentDate(dateStr);

    // Format Time: 01:36:24 PM
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    setCurrentTime(timeStr);
  }, []);

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <GlobalHeader 
        isDark={isDark} 
        onToggleTheme={onToggleTheme} 
        onLogout={onLogout} 
      />

      <View style={s.content}>
        
        {/* Verification Image Box */}
        <View style={[s.cameraBox, {backgroundColor: C.surfaceHigh, borderColor: C.border}]}>
          <Image 
            source={require('../../assets/demophoto.jpeg')} 
            style={s.cameraImage} 
            resizeMode="cover" 
          />
          {/* Overlay gradient to match mockup look */}
          <View style={s.cameraOverlay} />
        </View>

        {/* Data Card */}
        <View style={[s.dataCard, {backgroundColor: C.surfaceHigh, borderColor: C.border}]}>
          
          {/* Status Label */}
          <View style={s.statusLabelWrapper}>
            <Text style={s.statusLabel}>
              {flow === 'lock' ? 'LOCKED' : 'OPENED'}
            </Text>
          </View>
          
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>Date:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{currentDate}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>Time:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{currentTime}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>GPS:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>34.05.22.1N, 118.14.37.0W</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>Battery:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>97%</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>Lock SN:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>CL001</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>
              {selection === 'container' ? 'Container #:' : 'Trailer #:'}
            </Text>
            <Text style={[s.dataValue, {color: C.text}]}>{containerNum || 'TCLU9693193'}</Text>
          </View>

          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>Seal #:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{sealNum}</Text>
          </View>
          <View style={s.dataRow}>
            <Text style={[s.dataLabel, {color: C.subText}]}>Login ID:</Text>
            <Text style={[s.dataValue, {color: C.text}]}>{loginId || 'N/A'}</Text>
          </View>
        </View>

        {/* Disclaimer Warning */}
        <View style={s.disclaimerWrapper}>
          <Text style={[s.disclaimer, {color: C.text}]}>
            PLEASE TAKE A SCREENSHOT OF THIS PAGE AND SEND TO YOUR SUPERVISOR BEFORE LOGGING OUT
          </Text>
        </View>

      </View>
      
      {/* Absolute Bottom Button */}
      <View style={s.footer}>
        <TouchableOpacity style={[s.logoutBtn, {backgroundColor: C.btnBg}]} onPress={onLogout} activeOpacity={0.85}>
          <Text style={[s.logoutBtnText, {color: C.btnText}]}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {flex: 1},

  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 10,
  },

  cameraBox: {
    height: 140, 
    borderRadius: RADIUS.lg, 
    borderWidth: 1, 
    overflow: 'hidden', 
    marginBottom: SPACING.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cameraImage: {
    width: '100%', 
    height: '100%'
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },

  dataCard: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg, 
    borderRadius: RADIUS.lg, 
    borderWidth: 1,
    marginBottom: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dataRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 5
  },
  dataLabel: {
    fontSize: 13, 
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 13, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  disclaimerWrapper: {
    paddingHorizontal: SPACING.md,
  },
  disclaimer: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  logoutBtnText: {
    fontSize: 14, 
    fontWeight: '800', 
    letterSpacing: 2
  },

  statusLabelWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

export default FinalScreen;
