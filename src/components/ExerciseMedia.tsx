/**
 * Mídia do exercício — COMPONENTS.md > ExerciseMedia.
 * Listras 135° sempre ao fundo; WebP animado em `contain` por cima; sem mídia,
 * placeholder com ícone + nome do arquivo (estado de design previsto).
 */
import { Image } from 'expo-image';
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { color, component, radius, shadow, size, text } from '../theme';
import { ImageIcon } from './icons';
import { Surface } from './Surface';

function Stripes() {
  const id = useId().replace(/:/g, '');
  const s = component.media.stripe;
  return (
    <Svg width="100%" height="100%">
      <Defs>
        {/* Faixas verticais giradas 45°: a direção das faixas fica a 135° do CSS. */}
        <Pattern id={id} width={s * 2} height={s * 2} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Rect x={0} y={0} width={s} height={s * 2} fill={color.surface.mediaStripeA} />
          <Rect x={s} y={0} width={s} height={s * 2} fill={color.surface.mediaStripeB} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

export function ExerciseMedia({ source, fileName }: { source?: number; fileName: string }) {
  return (
    <Surface
      radius={radius.media}
      shadow={shadow.sunkenLg}
      background={<Stripes />}
      style={{ height: size.media, alignItems: 'center', justifyContent: 'center' }}
    >
      {source !== undefined ? (
        <Image
          source={source}
          contentFit="contain"
          autoplay
          useAppleWebpCodec={false}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.media }]}
        />
      ) : (
        <View style={{ alignItems: 'center', gap: component.media.placeholderGap }}>
          <ImageIcon size={component.media.placeholderIcon} color={color.text.placeholder} />
          <Text style={[text.file, { color: color.text.placeholder }]}>{fileName}</Text>
        </View>
      )}
    </Surface>
  );
}
