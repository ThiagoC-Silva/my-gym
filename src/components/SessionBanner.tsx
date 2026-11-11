/**
 * Banner de treino concluído — COMPONENTS.md > SessionBanner e promp-app.md §7.5.
 * A entrada (sobe com fade) é da tela; aqui, o pop do check com atraso (DESIGN.md §7).
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Text } from './Text';

import { useMinHitSlop } from '../hooks/useMinHitSlop';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { popStyle, timing } from '../motion';
import { color, component, gradient, motion, radius, shadow, space, text } from '../theme';
import { CheckIcon } from './icons';
import { Surface } from './Surface';

export interface SessionBannerProps {
  summary: string;
  onRestart: () => void;
  /** Montou pela conclusão do treino (anima o check) e não por troca de aba. */
  entering?: boolean;
}

export function SessionBanner({ summary, onRestart, entering = false }: SessionBannerProps) {
  const b = component.banner;
  const [restartHit, onRestartLayout] = useMinHitSlop();
  const reduced = useReducedMotion();
  // Com reduced-motion o check entra junto com o fade do banner, sem pop próprio.
  const pop = useRef(new Animated.Value(entering && !reduced ? 0 : 1)).current;
  useEffect(() => {
    if (!entering || reduced) return;
    const a = timing(pop, 1, motion.checkPop, { delay: motion.bannerIn.checkDelay });
    a.start();
    return () => a.stop();
    // Só na montagem.
  }, []);
  return (
    <Surface
      radius={radius.card}
      fill={gradient.brand}
      shadow={shadow.banner}
      style={{ flexDirection: 'row', alignItems: 'center', padding: space.cardPad, gap: b.gap }}
    >
      <Animated.View
        style={{
          ...popStyle(pop, motion.checkPop),
          width: b.circle,
          height: b.circle,
          borderRadius: radius.pill,
          backgroundColor: color.text.onAccent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckIcon size={b.check} color={color.accent.red} strokeWidth={component.check.iconStroke} />
      </Animated.View>
      <View style={{ flex: 1, gap: b.titleGap }}>
        <Text style={[text.cardTitle, { color: color.text.onAccent }]}>Treino concluído</Text>
        <Text style={[text.caption, { color: color.text.onAccent }]} numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <Pressable onPress={onRestart} hitSlop={restartHit} onLayout={onRestartLayout}>
        <View
          style={{
            backgroundColor: color.restartFill,
            borderRadius: b.restartRadius,
            paddingVertical: b.restartPadY,
            paddingHorizontal: b.restartPadX,
          }}
        >
          <Text style={[text.toastTitle, { color: color.text.onAccent }]}>Reiniciar</Text>
        </View>
      </Pressable>
    </Surface>
  );
}
