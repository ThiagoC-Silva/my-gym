/**
 * Anel de progresso — COMPONENTS.md > ProgressRing. 92 pt.
 * O SVG replica o da referência: rotação −90° (começa às 12h) e degradê do
 * `gradient.brand` com vetor (0,0)→(1,1) na caixa do SVG já rotacionado.
 */
import { useId } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { color, component, gradient, shadow, size, text } from '../theme';
import { Surface } from './Surface';

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const id = useId().replace(/:/g, '');
  const p = total > 0 ? done / total : 0;
  const center = size.ring / 2;

  return (
    <Surface
      radius={size.ring / 2}
      fill={color.surface.raised}
      shadow={shadow.float}
      style={{ width: size.ring, height: size.ring, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: done }}
      accessibilityLabel={`${done} de ${total} séries`}
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
        {p < 1 && (
          <Circle
            cx={center}
            cy={center}
            r={size.ringRadius}
            fill="none"
            stroke={color.surface.track}
            strokeWidth={size.ringStroke}
          />
        )}
        {p > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={size.ringRadius}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={size.ringStroke}
            strokeLinecap="round"
            strokeDasharray={`${size.ringCircumference}`}
            strokeDashoffset={size.ringCircumference * (1 - p)}
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
