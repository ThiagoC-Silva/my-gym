/** Esfera de série — COMPONENTS.md > SetSphere. 38 pt, hit-area 44. */
import { Pressable } from 'react-native';
import { Text } from './Text';

import { color, gradient, motion, radius, shadow, size, text } from '../theme';
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
  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`Série ${n}`}
    >
      {({ pressed }) => <SphereVisual n={n} state={done ? 'done' : pressed ? 'pressed' : 'pending'} />}
    </Pressable>
  );
}
