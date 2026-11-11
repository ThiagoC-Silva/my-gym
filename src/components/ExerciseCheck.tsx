/**
 * Círculo de seleção do exercício — COMPONENTS.md > ExerciseCheck. 32 pt, hit-area 44.
 * Ao concluir (seleção ou última série): pop do check preenchido sobre o vazio
 * (rfCheck da referência). Desmarcar é instantâneo.
 */
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { popStyle, reducedFade, timing, useRise } from '../motion';
import { color, component, gradient, motion, radius, shadow, size } from '../theme';
import { CheckIcon } from './icons';
import { Surface } from './Surface';

export type CheckState = 'idle' | 'hover' | 'done';

const HIT_SLOP = (size.minHitArea - size.check) / 2;

export function CheckVisual({ state }: { state: CheckState }) {
  const box = { width: size.check, height: size.check, alignItems: 'center', justifyContent: 'center' } as const;
  if (state === 'done') {
    return (
      <Surface radius={radius.pill} fill={gradient.fill} shadow={shadow.checkDone} style={box}>
        <CheckIcon size={component.check.icon} color={color.text.onAccent} strokeWidth={component.check.iconStroke} />
      </Surface>
    );
  }
  return (
    <Surface
      radius={radius.pill}
      fill={color.surface.deep}
      shadow={shadow.checkIdle}
      borderWidth={component.check.border}
      borderColor={state === 'hover' ? color.accent.red : color.border.idle}
      style={box}
    />
  );
}

export function ExerciseCheck({ done, onPress }: { done: boolean; onPress: () => void }) {
  const reduced = useReducedMotion();
  const pop = useRise(done, (v) => (reduced ? reducedFade(v, 1) : timing(v, 1, motion.checkPop)));
  const idleOpacity = pop.interpolate({ inputRange: [0, 0.999, 1], outputRange: [1, 1, 0], extrapolate: 'clamp' });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
    >
      {({ pressed }) => (
        <View style={{ width: size.check, height: size.check }}>
          <Animated.View style={{ opacity: done ? idleOpacity : 1 }}>
            <CheckVisual state={pressed && !done ? 'hover' : 'idle'} />
          </Animated.View>
          {done && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, reduced ? { opacity: pop } : popStyle(pop, motion.checkPop)]}
            >
              <CheckVisual state="done" />
            </Animated.View>
          )}
        </View>
      )}
    </Pressable>
  );
}
