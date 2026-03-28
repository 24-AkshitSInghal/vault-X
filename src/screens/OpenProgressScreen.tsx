import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { getTheme, RADIUS, SPACING } from '../constants/colors';
import Svg, { Circle } from 'react-native-svg';
import { GlobalHeader } from '../components/GlobalHeader';

interface Props {
  isDark: boolean;
  selection: 'container' | 'trailer';
  onComplete: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const STEPS = [
  { id: 'init', label: 'Verifying Security Protocol', threshold: 15 },
  { id: 'comm', label: 'Connecting to Lock', threshold: 35 },
  { id: 'mech', label: 'Disengaging VaultX Lock', threshold: 60 },
  { id: 'door', label: 'Releasing Doors', threshold: 85 },
  { id: 'final', label: 'Finalizing Unlock', threshold: 100 },
];

// ── Circular Progress Ring ─────────────────────────────────────────────────────
const CircularProgress = ({ progress, C }: { progress: number; C: any }) => {
  const size = 140;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[ringSt.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={C.border}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeOpacity={0.3}
        />
        {/* Active Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10B981"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={ringSt.center}>
        <Text style={[ringSt.percent, { color: C.text }]}>
          {Math.round(progress)}
        </Text>
        <Text style={[ringSt.percentSymbol, { color: C.muted }]}>%</Text>
      </View>
    </View>
  );
};

const ringSt = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBase: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
    width: 6,
    height: 18,
    borderRadius: 3,
    top: 5,
  },
  center: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percent: { fontSize: 44, fontWeight: '900' },
  percentSymbol: { fontSize: 16, fontWeight: '700', marginLeft: 2 },
});

// ── Step Row ──────────────────────────────────────────────────────────────────
const StepRow = ({ label, status, timestamp, percent, C }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const isActive = status === 'active';
  const isDone = status === 'done';

  return (
    <Animated.View
      style={[
        sr.container,
        {
          opacity,
          backgroundColor: C.surface,
          borderColor: isActive ? C.text : C.border,
        },
      ]}
    >
      <View
        style={[
          sr.indicator,
          {
            backgroundColor: isDone
              ? '#10B981'
              : isActive
              ? C.text
              : C.borderLight,
          },
        ]}
      >
        {isDone ? (
          <MaterialIcon name="check" size={14} color="#FFFFFF" />
        ) : (
          <View
            style={[
              sr.dot,
              { backgroundColor: isActive ? '#10B981' : 'transparent' },
            ]}
          />
        )}
      </View>
      <View style={sr.content}>
        <Text
          style={[sr.label, { color: isActive || isDone ? C.text : C.muted }]}
        >
          {label}
        </Text>
        <View style={sr.meta}>
          <Text style={[sr.timestamp, { color: C.muted }]}>
            {timestamp || '--:--:--'}
          </Text>
          {percent !== undefined && (
            <Text
              style={[sr.percentTag, { color: isDone ? '#10B981' : C.muted }]}
            >
              {percent}% Complete
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const sr = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 6,
    alignItems: 'center',
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timestamp: { fontSize: 11, fontVariant: ['tabular-nums'] },
  percentTag: { fontSize: 11, fontWeight: '700' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
const OpenProgressScreen: React.FC<Props> = ({
  isDark,
  selection,
  onComplete,
  onLogout,
  onToggleTheme,
}) => {
  const C = getTheme(isDark);
  const [progress, setProgress] = useState(0);
  const [stepData, setStepData] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasCompleted = useRef(false);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 0.5, 100);

        // Check for step thresholds
        const currentStepIdx = STEPS.findIndex(
          s => next >= s.threshold && p < s.threshold,
        );
        if (currentStepIdx !== -1) {
          const step = STEPS[currentStepIdx];
          setStepData(prev => [
            ...prev,
            {
              id: step.id,
              timestamp: getTimestamp(),
              percent: step.threshold,
            },
          ]);
        }

        // Complete flow at 100%
        if (next >= 100 && !hasCompleted.current) {
          hasCompleted.current = true;
          clearInterval(interval);
          setShowSuccess(true);
          setTimeout(onComplete, 2500);
        }

        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  const activeStepIdx = STEPS.findIndex(s => progress < s.threshold);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <GlobalHeader
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />

      <View style={s.container}>
        {showSuccess ? (
          <View style={s.successBox}>
            <MaterialIcon name="check-circle" size={80} color="#10B981" />
            <Text style={[s.successText, { color: C.text }]}>
              DOORS RELEASED
            </Text>
            <Text style={[s.successSub, { color: C.muted }]}>
              Unlocking sequence complete
            </Text>
          </View>
        ) : (
          <>
            <View style={s.ringWrapper}>
              <CircularProgress progress={progress} C={C} />
              <Text style={[s.statusTitle, { color: C.text }]}>
                Disengaging Lock...
              </Text>
              <Text style={[s.subLabel, { color: C.muted }]}>
                Lock mechanism is being released
              </Text>
            </View>

            <View style={s.stepsList}>
              {STEPS.map((step, idx) => {
                const data = stepData.find(d => d.id === step.id);
                const status =
                  progress >= step.threshold
                    ? 'done'
                    : idx === activeStepIdx
                    ? 'active'
                    : 'pending';

                return (
                  <StepRow
                    key={step.id}
                    label={step.label}
                    status={status}
                    timestamp={data?.timestamp}
                    percent={data?.percent}
                    C={C}
                  />
                );
              })}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: { width: 40 },
  headerTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  ringWrapper: { alignItems: 'center', marginBottom: 15 },
  statusTitle: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subLabel: { marginTop: 6, fontSize: 12, fontWeight: '500' },
  stepsList: { width: '100%' },
  successBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  successText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 20,
  },
  successSub: { fontSize: 14, fontWeight: '600', marginTop: 8 },
});

export default OpenProgressScreen;
