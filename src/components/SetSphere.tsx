/**
 * Esfera de série — COMPONENTS.md > SetSphere. 38 pt, hit-area 44.
 * Ao marcar (DESIGN.md §7): a esfera preenchida faz o pop sobre a pendente e uma
 * onda de 2 pt se expande (rfSphere/rfRipple da referência). Desmarcar é instantâneo.
 */
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { popStyle, reducedFade, timing, useRise } from '../motion';
import { color, component, gradient, motion, radius, shadow, size, text } from '../theme';
import { Surface } from './Surface';

export type SphereState = 'pending' | 'hover' | 'pressed' | 'done';

const look = {
  pending: { fill: gradient.sphereIdle, shadow: shadow.sphere, color: color.text.disabled, scale: 1 },
  hover: { fill: gradient.sphereIdle, shadow: shadow.sphere, color: color.accent.orange, scale: 1 },
  pressed: {
    fill: color.surface.raised,
    shadow: shadow.spherePressed,
    color: color.accent.orange,
    scale: motion.spherePress.scale,
  },
  done: { fill: gradient.fill, shadow: shadow.glow, color: color.text.onAccent, scale: 1 },
} as const;

/** Folga para a área de toque chegar a 44 pt. */
const HIT_SLOP = (size.minHitArea - size.sphere) / 2;

export function SphereVisual({ n, state }: { n: number; state: SphereState }) {
  const l = look[state];
  return (
    <Surface
      radius={radius.pill}
      fill={l.fill}
      shadow={l.shadow}
      style={{
        width: size.sphere,
        height: size.sphere,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: l.scale }],
      }}
    >
      <Text style={[text.sphere, { color: l.color }]}>{n}</Text>
    </Surface>
  );
}

export function SetSphere({ n, done, onPress }: { n: number; done: boolean; onPress: () => void }) {
  const reduced = useReducedMotion();
  const pop = useRise(done, (v) => (reduced ? reducedFade(v, 1) : timing(v, 1, motion.spherePop)));
  const ripple = useRise(done, (v) => (reduced ? null : timing(v, 1, motion.sphereRipple)), 1);

  // A pendente fica atrás durante o pop e some quando a preenchida a cobre por inteiro
  // (senão o realce claro da sombra dela apareceria em volta da esfera concluída).
  const idleOpacity = pop.interpolate({ inputRange: [0, 0.999, 1], outputRange: [1, 1, 0], extrapolate: 'clamp' });
  const r = motion.sphereRipple;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
    >
      {({ pressed }) => (
        <View style={{ width: size.sphere, height: size.sphere }}>
          <Animated.View style={{ opacity: done ? idleOpacity : 1 }}>
            <SphereVisual n={n} state={pressed && !done ? 'pressed' : 'pending'} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: radius.pill,
                borderWidth: component.sphere.rippleBorder,
                borderColor: color.accent.red,
                opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [...r.opacity] }),
                transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [...r.scale] }) }],
              },
            ]}
          />
          {done && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, reduced ? { opacity: pop } : popStyle(pop, motion.spherePop)]}
            >
              <SphereVisual n={n} state="done" />
            </Animated.View>
          )}
        </View>
      )}
    </Pressable>
  );
}
