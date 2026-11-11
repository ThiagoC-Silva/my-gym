/**
 * Anel de progresso — COMPONENTS.md > ProgressRing. 92 pt.
 * O SVG replica o da referência: rotação −90° (começa às 12h) e degradê do
 * `gradient.brand` com vetor (0,0)→(1,1) na caixa do SVG já rotacionado.
 * O arco anima `strokeDashoffset` (DESIGN.md §7); o texto central troca sem animação.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Text } from './Text';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { timing } from '../motion';
import { color, component, gradient, motion, shadow, size, text } from '../theme';
import { Surface } from './Surface';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const id = useId().replace(/:/g, '');
  const p = total > 0 ? done / total : 0;
  const center = size.ring / 2;
  const reduced = useReducedMotion();

  // `shown` = fração em que o arco está parado. Com cap redondo, arco de 0 ainda
  // desenha um ponto e o trilho aparece na emenda em 100%: por isso cada um só
  // some depois que a animação chega lá.
  const offset = useRef(new Animated.Value(size.ringCircumference * (1 - p))).current;
  const [shown, setShown] = useState(p);
  useEffect(() => {
    const to = size.ringCircumference * (1 - p);
    if (reduced) {
      offset.stopAnimation();
      offset.setValue(to);
      setShown(p);
      return;
    }
    const a = timing(offset, to, motion.ring, { native: false });
    a.start(({ finished }) => finished && setShown(p));
    return () => a.stop();
  }, [p, reduced, offset]);

  return (
    <Surface
      radius={size.ring / 2}
      fill={color.surface.raised}
      shadow={shadow.float}
      style={{ width: size.ring, height: size.ring, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg
        width={size.ring}
        height={size.ring}
        viewBox={`0 0 ${size.ring} ${size.ring}`}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {gradient.brand.colors.map((c, i) => (
              <Stop key={i} offset={gradient.brand.locations[i]} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        {(p < 1 || shown < 1) && (
          <Circle
            cx={center}
            cy={center}
            r={size.ringRadius}
            fill="none"
            stroke={color.surface.track}
            strokeWidth={size.ringStroke}
          />
        )}
        {(p > 0 || shown > 0) && (
          <AnimatedCircle
            cx={center}
            cy={center}
            r={size.ringRadius}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={size.ringStroke}
            strokeLinecap="round"
            strokeDasharray={`${size.ringCircumference}`}
            strokeDashoffset={offset}
          />
        )}
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={[text.ring, { color: color.text.primary, lineHeight: text.ring.fontSize }]}>
          {Math.round(p * 100)}%
        </Text>
        <Text
          style={[
            text.ringCaption,
            { color: color.text.muted, marginTop: component.ring.captionGap, lineHeight: text.ringCaption.fontSize },
          ]}
        >
          {done}/{total} séries
        </Text>
      </View>
    </Surface>
  );
}
