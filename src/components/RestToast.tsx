/**
 * Aviso de fim de descanso — COMPONENTS.md > RestToast.
 * Só o aviso; a posição (top 54, laterais 16) e a animação são da tela.
 */
import { View } from 'react-native';
import { Text } from './Text';

import { color, component, gradient, radius, shadow, text } from '../theme';
import { StopwatchIcon } from './icons';
import { Surface } from './Surface';

export function RestToast({ subtitle }: { subtitle: string }) {
  const c = component.toast;
  return (
    <Surface
      radius={radius.toast}
      fill={color.surface.deep}
      shadow={shadow.toast}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: c.padY,
        paddingHorizontal: c.padX,
        gap: c.gap,
      }}
    >
      <Surface
        radius={radius.pill}
        fill={gradient.fill}
        style={{ width: c.icon, height: c.icon, alignItems: 'center', justifyContent: 'center' }}
      >
        <StopwatchIcon size={c.glyph} color={color.text.onAccent} strokeWidth={c.glyphStroke} />
      </Surface>
      <View style={{ flex: 1, minWidth: 0, gap: c.textGap }}>
        <Text style={[text.toastTitle, { color: color.text.primary }]}>Descanso finalizado</Text>
        <Text style={[text.toastSub, { color: color.text.toastSub }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Surface>
  );
}
