/** Círculo de seleção do exercício — COMPONENTS.md > ExerciseCheck. 32 pt, hit-area 44. */
import { Pressable } from 'react-native';

import { color, component, gradient, radius, shadow, size } from '../theme';
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
  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={done ? 'Desmarcar todas as séries' : 'Marcar todas as séries'}
    >
      {({ pressed }) => <CheckVisual state={done ? 'done' : pressed ? 'hover' : 'idle'} />}
    </Pressable>
  );
}
