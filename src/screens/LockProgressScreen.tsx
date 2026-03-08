import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {getTheme, RADIUS, SPACING} from '../constants/colors';
import {FlowType} from '../constants/credentials';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Props {
  isDark: boolean;
  flow: FlowType;
  selection: 'container' | 'trailer';
  onWarning: () => void;
  onLogout: () => void;
}

const STEPS = [
  {id: 'init', label: 'Verifying Security Protocol', threshold: 15},
  {id: 'comm', label: 'Establishing Winch Link', threshold: 35},
  {id: 'mech', label: 'Engaging Mechanical Bolts', threshold: 60},
  {id: 'hca', label: 'Health Check Alignment', threshold: 85},
  {id: 'final', label: 'Synchronizing Cloud Vault', threshold: 100},
];

// ── Segmented Progress Ring ────────────────────────────────────────────────────
// Glitch-free implementation using individual segments
const SegmentedRing = ({progress, C}: {progress: number; C: any}) => {
  const TOTAL_SEGMENTS = 36;
  const segments = Array.from({length: TOTAL_SEGMENTS});

  return (
    <View style={ringSt.container}>
      <View style={ringSt.ringBase}>
        {segments.map((_, i) => {
          const isActive = (i / TOTAL_SEGMENTS) * 100 < progress;
          return (
            <View
              key={i}
              style={[
                ringSt.segment,
                {
                  transform: [{rotate: `${i * (360 / TOTAL_SEGMENTS)}deg`}],
                  backgroundColor: isActive ? '#10B981' : C.border,
                  opacity: isActive ? 1 : 0.4,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={ringSt.center}>
        <Text style={[ringSt.percent, {color: C.text}]}>{Math.round(progress)}</Text>
        <Text style={[ringSt.percentSymbol, {color: C.muted}]}>%</Text>
      </View>
    </View>
  );
};

const ringSt = StyleSheet.create({
  container: {width: 200, height: 200, alignItems: 'center', justifyContent: 'center'},
  ringBase: {width: 200, height: 200, alignItems: 'center', justifyContent: 'center'},
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
  percent: {fontSize: 54, fontWeight: '900'},
  percentSymbol: {fontSize: 20, fontWeight: '700', marginLeft: 2},
});

// ── Step Row ──────────────────────────────────────────────────────────────────
const StepRow = ({label, status, timestamp, percent, C}: any) => {
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
    <Animated.View style={[sr.container, {opacity, backgroundColor: C.surface, borderColor: isActive ? C.text : C.border}]}>
      <View style={[sr.indicator, {backgroundColor: isDone ? '#10B981' : isActive ? C.text : C.borderLight}]}>
        {isDone ? (
          <MaterialIcon name="check" size={14} color="#FFFFFF" />
        ) : (
          <View style={[sr.dot, {backgroundColor: isActive ? '#10B981' : 'transparent'}]} />
        )}
      </View>
      <View style={sr.content}>
        <Text style={[sr.label, {color: isActive || isDone ? C.text : C.muted}]}>{label}</Text>
        <View style={sr.meta}>
          <Text style={[sr.timestamp, {color: C.muted}]}>{timestamp || '--:--:--'}</Text>
          {percent !== undefined && (
            <Text style={[sr.percentTag, {color: isDone ? '#10B981' : C.muted}]}>{percent}% Complete</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const sr = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
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
  dot: {width: 8, height: 8, borderRadius: 4},
  content: {flex: 1},
  label: {fontSize: 14, fontWeight: '600', letterSpacing: 0.5},
  meta: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
  timestamp: {fontSize: 11, fontVariant: ['tabular-nums']},
  percentTag: {fontSize: 11, fontWeight: '700'},
});

// ── Main Screen ───────────────────────────────────────────────────────────────
const LockProgressScreen: React.FC<Props> = ({isDark, flow, selection, onWarning, onLogout}) => {
  const C = getTheme(isDark);
  const [progress, setProgress] = useState(0);
  const [stepData, setStepData] = useState<any[]>([]);
  const hasWarned = useRef(false);

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
        const currentStepIdx = STEPS.findIndex(s => next >= s.threshold && p < s.threshold);
        if (currentStepIdx !== -1) {
          const step = STEPS[currentStepIdx];
          setStepData(prev => [...prev, {
            id: step.id,
            timestamp: getTimestamp(),
            percent: step.threshold
          }]);
        }

        // Warning flow at 75%
        if (next >= 75 && !hasWarned.current) {
          hasWarned.current = true;
          clearInterval(interval);
          setTimeout(onWarning, 800);
        }

        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onWarning]);

  const activeStepIdx = STEPS.findIndex(s => progress < s.threshold);

  return (
    <SafeAreaView style={[s.safe, {backgroundColor: C.bg}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={s.header}>
        <TouchableOpacity onPress={onLogout} style={[s.backBtn, {backgroundColor: C.surface}]}>
          <MaterialIcon name="chevron-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, {color: C.text}]}>OPERATION PROGRESS</Text>
        <View style={{width: 40}} />
      </View>

      <View style={s.container}>
        <View style={s.ringWrapper}>
          <SegmentedRing progress={progress} C={C} />
          <Text style={[s.subLabel, {color: C.muted}]}>
            {flow.toUpperCase()}ING {selection.toUpperCase()}...
          </Text>
        </View>

        <View style={s.stepsList}>
          {STEPS.map((step, idx) => {
            const data = stepData.find(d => d.id === step.id);
            const status = progress >= step.threshold ? 'done' : idx === activeStepIdx ? 'active' : 'pending';
            
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
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {flex: 1},
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 13, fontWeight: '800', letterSpacing: 2},
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {flex: 1, paddingHorizontal: 24, justifyContent: 'center'},
  ringWrapper: {alignItems: 'center', marginBottom: 40},
  subLabel: {marginTop: 15, fontSize: 12, fontWeight: '700', letterSpacing: 3},
  stepsList: {width: '100%'},
});

export default LockProgressScreen;
