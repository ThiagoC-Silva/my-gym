/** Aba de treino — COMPONENTS.md > WorkoutTab. Não exibe porcentagem. */
import { Pressable, Text } from 'react-native';

import { color, component, radius, shadow, text } from '../theme';
import { Surface } from './Surface';

export type TabState = 'inactive' | 'hover' | 'active';

const look = {
  inactive: { fill: color.surface.bg, shadow: shadow.raisedSm, text: text.tab, color: color.text.mutedAlt },
  hover: { fill: color.surface.bg, shadow: shadow.raisedSm, text: text.tab, color: color.text.secondary },
  active: { fill: color.surface.sunken, shadow: shadow.pressed, text: text.tabActive, color: color.accent.red },
} as const;

export function TabVisual({ label, state }: { label: string; state: TabState }) {
  const l = look[state];
  return (
    <Surface
      radius={radius.pill}
      fill={l.fill}
      shadow={l.shadow}
      style={{ paddingVertical: component.tab.padY, paddingHorizontal: component.tab.padX }}
    >
      <Text style={[l.text, { color: l.color }]}>{label}</Text>
    </Surface>
  );
}

export function WorkoutTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      {({ pressed }) => <TabVisual label={label} state={active ? 'active' : pressed ? 'hover' : 'inactive'} />}
    </Pressable>
  );
}
