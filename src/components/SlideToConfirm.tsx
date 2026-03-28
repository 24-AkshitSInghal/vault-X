import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';

const THUMB_SIZE = 54;

export interface SlideProps {
  label: string;
  onConfirm: () => void;
  thumbColor: string;
  textColor: string;
  trackBg: string;
  isDark: boolean;
}

export const SlideToConfirm = ({
  label,
  onConfirm,
  thumbColor,
  textColor,
  trackBg,
  isDark,
}: SlideProps) => {
  const thumbX = useRef(new Animated.Value(0)).current;
  const trackW = useRef(0);
  const confirmed = useRef(false);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (confirmed.current) {
          return;
        }
        const max = trackW.current - THUMB_SIZE - 8;
        const clamped = Math.max(0, Math.min(gs.dx, max));
        thumbX.setValue(clamped);
      },
      onPanResponderRelease: (_, gs) => {
        if (confirmed.current) {
          return;
        }
        const max = trackW.current - THUMB_SIZE - 8;
        if (gs.dx >= max * 0.75) {
          confirmed.current = true;
          Animated.timing(thumbX, {
            toValue: max,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            onConfirm();
            setTimeout(() => {
              confirmed.current = false;
              thumbX.setValue(0);
            }, 600);
          });
        } else {
          Animated.spring(thumbX, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 0,
          }).start();
        }
      },
    }),
  ).current;

  // Progress fill color interpolation
  const progressWidth = thumbX.interpolate({
    inputRange: [0, 1000],
    outputRange: [THUMB_SIZE, 1000 + THUMB_SIZE],
  });

  const textOpacity = thumbX.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.2],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[slSt.track, { backgroundColor: trackBg }]}
      onLayout={e => {
        trackW.current = e.nativeEvent.layout.width;
      }}
    >
      {/* Dynamic Progress Fill */}
      <Animated.View
        style={[
          slSt.progressFill,
          {
            width: progressWidth,
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.08)',
          },
        ]}
      />

      <Animated.Text
        style={[slSt.label, { color: textColor, opacity: textOpacity }]}
      >
        {label}
      </Animated.Text>

      <Animated.View
        style={[
          slSt.thumb,
          {
            backgroundColor: thumbColor,
            transform: [{ translateX: thumbX }],
            shadowColor: thumbColor,
            elevation: 8,
          },
        ]}
        {...pan.panHandlers}
      >
        <MaterialIcon
          name="chevron-double-right"
          size={24}
          color={isDark ? '#000' : '#fff'}
        />
      </Animated.View>
    </View>
  );
};

const slSt = StyleSheet.create({
  track: {
    height: THUMB_SIZE + 10,
    borderRadius: (THUMB_SIZE + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 5,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: (THUMB_SIZE + 10) / 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    position: 'absolute',
    textAlign: 'center',
    zIndex: 1,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 5,
    zIndex: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
