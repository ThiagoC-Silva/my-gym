/** Aba de treino — COMPONENTS.md > WorkoutTab. Não exibe porcentagem. */
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { color, component, radius, shadow, text } from '../theme';
import { Surface } from './Surface';

export type TabState = 'inactive' | 'hover' | 'active';

const look = {
  inactive: { fill: color.surface.bg, shadow: shadow.raisedSm, text: text.tab, color: color.text.mutedAlt },
  hover: { fill: color.surface.bg, shadow: shadow.raisedSm, text: text.tab, color: color.text.secondary },
  active: { fill: color.surface.sunken, shadow: shadow.pressed, text: text.tabActive, color: color.accent.red },
} as const;

const pad = { paddingVertical: component.tab.padY, paddingHorizontal: component.tab.padX };

function Label({ label, state }: { label: string; state: TabState }) {
  const l = look[state];
  return <Text style={[l.text, { color: l.color }]}>{label}</Text>;
}

/** Aba completa (fundo + texto) num estado fixo. */
export function TabVisual({ label, state }: { label: string; state: TabState }) {
  const l = look[state];
  return (
    <Surface radius={radius.pill} fill={l.fill} shadow={l.shadow} style={pad}>
      <Label label={label} state={state} />
    </Surface>
  );
}

/**
 * Só o fundo da aba, para a troca animada: o relevo das inativas e a pílula
 * afundada da ativa são camadas separadas, desenhadas atrás dos textos.
 */
export function TabBackground({ state, style }: { state: 'inactive' | 'active'; style?: object }) {
  const l = look[state];
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Surface radius={radius.pill} fill={l.fill} shadow={l.shadow} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

export function WorkoutTab({
  label,
  active,
  layered,
  onPress,
  onLayout,
}: {
  label: string;
  active: boolean;
  /** Fundos desenhados por fora (WorkoutTabs); aqui só o texto. */
  layered: boolean;
  onPress: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  return (
    <Pressable onPress={onPress} onLayout={onLayout}>
      {({ pressed }) => {
        const state: TabState = active ? 'active' : pressed ? 'hover' : 'inactive';
        return layered ? (
          <View style={pad}>
            <Label label={label} state={state} />
          </View>
        ) : (
          <TabVisual label={label} state={state} />
        );
      }}
    </Pressable>
  );
}
