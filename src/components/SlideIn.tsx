/**
 * Entrada e saída de um elemento que surge (painel de descanso, aviso, banner,
 * folha). Desloca `token.fromTranslateY` × a própria altura e, se o token tiver
 * `opacity`, faz o fade junto (rfUp/rfDown da referência). A saída é a entrada
 * invertida, com a mesma duração e curva. Continua montado durante a saída, então
 * quem usa deve manter o último conteúdo.
 */
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, type ViewProps } from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { reducedFade, timing } from '../motion';
import type { Bezier } from '../theme';

export interface SlideInProps extends Omit<ViewProps, 'children'> {
  show: boolean;
  token: { duration: number; easing?: Bezier; fromTranslateY?: number; opacity?: readonly number[] };
  /** Se já começa visível: anima a entrada (true) ou aparece pronto (false). */
  appear?: boolean;
  /** false = some na hora, sem animar a saída. */
  exit?: boolean;
  onExited?: () => void;
  /** `entering` = montou por uma entrada animada (para animações internas atrasadas). */
  children: ReactNode | ((entering: boolean) => ReactNode);
}

export function SlideIn({
  show,
  token,
  appear = true,
  exit = true,
  onExited,
  style,
  pointerEvents,
  onLayout,
  children,
  ...rest
}: SlideInProps) {
  const reduced = useReducedMotion();
  const [height, setHeight] = useState(0);
  const [mounted, setMounted] = useState(show);
  const [entering, setEntering] = useState(show && appear);
  const [prevShow, setPrevShow] = useState(show);
  const p = useRef(new Animated.Value(show && !appear ? 1 : 0)).current;
  const exited = useRef(onExited);
  exited.current = onExited;
  const measured = height > 0;

  // Monta no mesmo render em que `show` vira true (sem esperar um efeito e outro commit).
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) {
      setMounted(true);
      setEntering(true);
    } else if (!exit) {
      setMounted(false);
    }
  }

  useEffect(() => {
    if (show || exit) return;
    p.stopAnimation();
    p.setValue(0);
    exited.current?.();
  }, [show, exit, p]);

  useEffect(() => {
    if (!mounted || (!show && !exit)) return;
    if (!measured) {
      // Saiu antes de medir: não há o que animar.
      if (!show) {
        setMounted(false);
        exited.current?.();
      }
      return;
    }
    const target = show ? 1 : 0;
    const a = reduced ? reducedFade(p, target) : timing(p, target, token);
    a.start(({ finished }) => {
      if (finished && !show) {
        setMounted(false);
        exited.current?.();
      }
    });
    return () => a.stop();
  }, [show, exit, mounted, measured, reduced, token, p]);

  if (!mounted) return null;

  const fade = reduced || token.opacity !== undefined;
  const opacity = !measured
    ? 0
    : fade
      ? p.interpolate({ inputRange: [0, 1], outputRange: reduced ? [0, 1] : [...token.opacity!] })
      : 1;
  const translateY =
    reduced || !token.fromTranslateY
      ? 0
      : p.interpolate({ inputRange: [0, 1], outputRange: [token.fromTranslateY * height, 0] });

  return (
    <Animated.View
      {...rest}
      pointerEvents={show ? pointerEvents : 'none'}
      onLayout={(e) => {
        setHeight(e.nativeEvent.layout.height);
        onLayout?.(e);
      }}
      style={[style, { opacity, transform: [{ translateY }] }]}
    >
      {typeof children === 'function' ? children(entering) : children}
    </Animated.View>
  );
}
