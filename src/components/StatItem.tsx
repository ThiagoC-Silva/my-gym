/** Dado editável — COMPONENTS.md > StatItem. */
import { Pressable, Text, View } from 'react-native';

import { color, component, radius, shadow, text } from '../theme';
import { PencilIcon } from './icons';
import { Surface } from './Surface';

export interface StatItemProps {
  label: string;
  value: string;
  unit?: string;
  /** Descanso em contagem: valor `mm:ss` em vermelho. */
  counting?: boolean;
}

export function StatVisual({ label, value, unit, counting, pressed }: StatItemProps & { pressed?: boolean }) {
  const c = component.stat;
  return (
    <Surface
      radius={radius.stat}
      fill={pressed ? color.surface.sunkenHover : color.surface.sunken}
      shadow={shadow.sunken}
      style={{ paddingTop: c.padTop, paddingHorizontal: c.padX, paddingBottom: c.padBottom, gap: c.gap }}
    >
      <Text style={[text.label, { color: color.text.label }]} numberOfLines={1}>
        {label}
      </Text>
      {/*
        Unidade como trecho do mesmo parágrafo do valor (como o <span> da referência):
        a linha fica com a altura do valor, com ou sem unidade. Os 2 pt de margem
        viram um View inline, já que trecho de texto aninhado não aceita margem.
      */}
      <Text style={[text.stat, { color: counting ? color.accent.red : color.text.primary }]} numberOfLines={1}>
        {value}
        {unit !== undefined && !counting && (
          <>
            <View style={{ width: c.unitGap, height: 0 }} />
            <Text style={[text.unit, { color: color.text.muted }]}>{unit}</Text>
          </>
        )}
      </Text>
      <View pointerEvents="none" style={{ position: 'absolute', bottom: c.pencilBottom, right: c.pencilRight }}>
        <PencilIcon size={c.pencil} color={color.accent.orange} strokeWidth={c.pencilStroke} />
      </View>
    </Surface>
  );
}

export function StatItem({ onPress, ...props }: StatItemProps & { onPress: () => void }) {
  const unit = props.unit && !props.counting ? ` ${props.unit}` : '';
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityLabel={`${props.label}: ${props.value}${unit}. Editar`}
    >
      {({ pressed }) => <StatVisual {...props} pressed={pressed} />}
    </Pressable>
  );
}
