/**
 * Painel de descanso — COMPONENTS.md > RestPanel. Altura 84.
 * Só o painel; a posição flutuante (left 16 / right 120 / bottom 34) e a entrada
 * (SlideIn) são da tela. Aqui: a barra desce linear pela duração e, nos últimos 5 s,
 * o tempo fica vermelho sólido e pulsa (sem pulso com reduced-motion).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { formatClock } from '../format';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { timing } from '../motion';
import { color, component, gradient, gradientProps, motion, radius, shadow, size, text } from '../theme';
import { GradientText } from './GradientText';
import { Surface } from './Surface';

export interface RestPanelProps {
  remainingMs: number;
  /** Fim do descanso (timestamp); a barra anima até ele. */
  endsAt: number;
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

/** Fração restante do descanso, 0–1. */
function fractionLeft(endsAt: number, totalMs: number) {
  return totalMs > 0 ? Math.min(1, Math.max(0, (endsAt - Date.now()) / totalMs)) : 0;
}

/** Barra contínua até `endsAt`; reinicia em +15s e ao voltar do segundo plano. */
function useBar(endsAt: number, totalMs: number) {
  const bar = useRef(new Animated.Value(fractionLeft(endsAt, totalMs))).current;
  useEffect(() => {
    let a: Animated.CompositeAnimation | undefined;
    const run = () => {
      a?.stop();
      bar.setValue(fractionLeft(endsAt, totalMs));
      a = Animated.timing(bar, {
        toValue: 0,
        duration: Math.max(0, endsAt - Date.now()),
        easing: Easing.linear,
        useNativeDriver: true,
      });
      a.start();
    };
    run();
    const sub = AppState.addEventListener('change', (st) => st === 'active' && run());
    return () => {
      a?.stop();
      sub.remove();
    };
  }, [endsAt, totalMs, bar]);
  return bar;
}

/** Pulso de opacidade 1 ↔ .35 (rfPulse: metade do ciclo para cada lado). */
function usePulse(on: boolean) {
  const o = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) {
      o.setValue(1);
      return;
    }
    const [hi, lo] = motion.restPulse.opacity;
    const half = { duration: motion.restPulse.duration / 2, easing: motion.restPulse.easing };
    const loop = Animated.loop(Animated.sequence([timing(o, lo, half), timing(o, hi, half)]));
    loop.start();
    return () => {
      loop.stop();
      o.setValue(1);
    };
  }, [on, o]);
  return o;
}

export function RestPanel({ remainingMs, endsAt, totalMs, line, onAdd15, onSkip }: RestPanelProps) {
  const c = component.restPanel;
  const clock = formatClock(remainingMs);
  const final = Math.ceil(remainingMs / 1000) <= motion.restPulse.thresholdSeconds;
  const reduced = useReducedMotion();
  const bar = useBar(endsAt, totalMs);
  const pulse = usePulse(final && !reduced);

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
          <Animated.View style={{ opacity: pulse }}>
            <Text style={[text.timer, { color: color.accent.red }]}>{clock}</Text>
          </Animated.View>
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
          {/* scaleX a partir da esquerda = `width` do CSS (o degradê encolhe junto). */}
          <Animated.View style={{ height: '100%', transformOrigin: 'left', transform: [{ scaleX: bar }] }}>
            <LinearGradient {...gradientProps(gradient.bar)} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      </View>
    </Surface>
  );
}
