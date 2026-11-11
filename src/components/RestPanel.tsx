/**
 * Painel de descanso — COMPONENTS.md > RestPanel. Altura 84.
 * Só o painel; a posição flutuante (left 16 / right 120 / bottom 34) é da tela.
 * Pulso dos últimos 5 s e entrada animada ficam para a etapa de movimento.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClock } from '../format';
import { color, component, gradient, gradientProps, motion, radius, shadow, size, text } from '../theme';
import { GradientText } from './GradientText';
import { Surface } from './Surface';

export interface RestPanelProps {
  remainingMs: number;
  totalMs: number;
  /** "Remada baixa · série 2" */
  line: string;
  onAdd15: () => void;
  onSkip: () => void;
}

/**
 * Mini-botão com área de toque de 44 pt. Os dois ficam empilhados a 6 pt um do outro,
 * então cada um cresce só para fora (para cima o de cima, para baixo o de baixo) e
 * pela metade do vão no lado de dentro, sem sobrepor o vizinho.
 */
function MiniButton({
  label,
  tint,
  side,
  onPress,
}: {
  label: string;
  tint: string;
  side: 'top' | 'bottom';
  onPress: () => void;
}) {
  const c = component.restPanel;
  const [box, setBox] = useState({ width: 0, height: 0 });
  const inner = c.buttonGap / 2;
  const outer = Math.max(0, size.minHitArea - box.height - inner);
  const across = Math.max(0, (size.minHitArea - box.width) / 2);
  const hitSlop =
    side === 'top'
      ? { top: outer, bottom: inner, left: across, right: across }
      : { top: inner, bottom: outer, left: across, right: across };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={hitSlop}
      onLayout={(e) => setBox(e.nativeEvent.layout)}
    >
      <Surface
        radius={radius.mini}
        fill={color.surface.bg}
        shadow={shadow.mini}
        style={{ paddingVertical: c.buttonPadY, paddingHorizontal: c.buttonPadX }}
      >
        <Text style={[text.mini, { color: tint }]}>{label}</Text>
      </Surface>
    </Pressable>
  );
}

export function RestPanel({ remainingMs, totalMs, line, onAdd15, onSkip }: RestPanelProps) {
  const c = component.restPanel;
  const clock = formatClock(remainingMs);
  const final = Math.ceil(remainingMs / 1000) <= motion.restPulse.thresholdSeconds;
  const fraction = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0;

  return (
    <Surface
      radius={radius.panel}
      fill={color.surface.panel}
      shadow={shadow.float}
      style={{
        height: size.restPanel,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: c.padLeft,
        paddingRight: c.padRight,
        gap: c.gap,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[text.restLabel, { color: color.text.muted }]}>Descanso</Text>
        {final ? (
          <Text style={[text.timer, { color: color.accent.red }]}>{clock}</Text>
        ) : (
          <GradientText style={text.timer} fill={gradient.text}>
            {clock}
          </GradientText>
        )}
        <Text style={[text.restLine, { color: color.text.muted }]} numberOfLines={1}>
          {line}
        </Text>
      </View>

      <View style={{ gap: c.buttonGap }}>
        <MiniButton label="+15s" tint={color.text.secondary} side="top" onPress={onAdd15} />
        <MiniButton label="Pular" tint={color.accent.red} side="bottom" onPress={onSkip} />
      </View>

      {/* Barra inferior: recortada pelo raio do painel sem cortar a sombra externa dele. */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.panel, overflow: 'hidden' }]}>
        <View
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: c.bar, backgroundColor: color.surface.barTrack }}
        >
          <LinearGradient {...gradientProps(gradient.bar)} style={{ height: '100%', width: `${fraction * 100}%` }} />
        </View>
      </View>
    </Surface>
  );
}
