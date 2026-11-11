/**
 * Helpers de movimento (DESIGN.md §7). Durações e curvas vêm sempre de `motion.*`.
 * Com reduced-motion, toda animação vira um fade de `motion.reduced.duration`.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { type Bezier, bezierPeak, motion } from './theme';

export const curve = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);

export function timing(
  value: Animated.Value,
  toValue: number,
  token: { duration: number; easing?: Bezier },
  { delay = 0, native = true }: { delay?: number; native?: boolean } = {},
) {
  return Animated.timing(value, {
    toValue,
    duration: token.duration,
    easing: token.easing ? curve(token.easing) : Easing.linear,
    delay,
    useNativeDriver: native,
  });
}

/** O fade único do reduced-motion. */
export function reducedFade(value: Animated.Value, toValue: number, native = true) {
  return timing(value, toValue, motion.reduced, { native });
}

/**
 * Pop em três quadros (`scale: [início, pico, fim]`): o progresso corre 0 → 1 pela
 * curva do token (spring), que passa de 1 até o seu pico de overshoot e volta. A
 * escala acompanha: 0 → início, 1 → fim, pico da curva → pico da escala.
 */
export function popStyle(
  p: Animated.Value,
  token: { easing?: Bezier; scale: readonly number[]; opacity?: readonly number[] },
) {
  const [from, peak, to] = token.scale;
  const top = token.easing ? bezierPeak(token.easing) : 1;
  return {
    opacity: token.opacity
      ? p.interpolate({ inputRange: [0, 1], outputRange: [...token.opacity], extrapolate: 'clamp' })
      : 1,
    transform: [
      {
        scale:
          top > 1
            ? p.interpolate({ inputRange: [0, 1, top], outputRange: [from, to, peak], extrapolate: 'clamp' })
            : p.interpolate({ inputRange: [0, 1], outputRange: [from, to], extrapolate: 'clamp' }),
      },
    ],
  };
}

/**
 * Valor que anima só quando `active` passa de falso para verdadeiro — nunca na
 * montagem (troca de aba, abertura do app). Na volta para falso, pula para `idle`.
 * `animate` devolve a animação de 0 → 1, ou `null` para pular direto ao fim.
 */
export function useRise(
  active: boolean,
  animate: (v: Animated.Value) => Animated.CompositeAnimation | null,
  idle?: number,
): Animated.Value {
  const v = useRef(new Animated.Value(idle ?? (active ? 1 : 0))).current;
  const prev = useRef(active);
  const run = useRef(animate);
  run.current = animate;

  useEffect(() => {
    if (prev.current === active) return;
    prev.current = active;
    v.stopAnimation();
    if (!active) {
      v.setValue(idle ?? 0);
      return;
    }
    v.setValue(0);
    const a = run.current(v);
    if (a) a.start();
    else v.setValue(1);
  }, [active, idle, v]);

  return v;
}
