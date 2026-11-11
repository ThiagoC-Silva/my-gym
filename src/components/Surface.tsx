/**
 * Superfície neumórfica: fundo (cor ou degradê) + sombras do token, na ordem de
 * pintura do CSS:
 *   sombras externas → fundo → `background` extra → sombras inset → conteúdo.
 *
 * No RN as sombras `inset` de um View ficam abaixo dos filhos; se o fundo for um
 * degradê (filho), ele cobriria a sombra. Por isso as inset vão num overlay próprio,
 * desenhado logo depois do fundo e antes do conteúdo.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View, type ViewProps } from 'react-native';

import { type Gradient, gradientProps, type ShadowLayer } from '../theme';

export type Fill = string | Gradient;

export interface SurfaceProps extends ViewProps {
  radius: number;
  fill?: Fill;
  shadow?: ShadowLayer[];
  borderWidth?: number;
  borderColor?: string;
  /** Camada entre o fundo e as sombras inset (ex.: listras da mídia). */
  background?: ReactNode;
}

export function Surface({
  radius,
  fill,
  shadow = [],
  borderWidth = 0,
  borderColor,
  background,
  style,
  children,
  onLayout,
  ...rest
}: SurfaceProps) {
  const outer = shadow.filter((l) => !l.inset);
  const inner = shadow.filter((l) => l.inset);
  const solid = typeof fill === 'string' ? fill : undefined;
  const grad = typeof fill === 'object' ? fill : undefined;

  // O ângulo do degradê CSS depende da proporção da caixa.
  const [aspect, setAspect] = useState(1);
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (grad && height > 0) setAspect(width / height);
    onLayout?.(e);
  };

  // Filhos absolutos se posicionam na padding box (dentro da borda).
  const innerRadius = Math.max(0, radius - borderWidth);

  return (
    <View
      {...rest}
      onLayout={handleLayout}
      style={[
        {
          borderRadius: radius,
          backgroundColor: solid,
          boxShadow: outer.length ? outer : undefined,
          borderWidth: borderWidth || undefined,
          borderColor,
        },
        style,
      ]}
    >
      {grad && (
        <LinearGradient
          {...gradientProps(grad, aspect)}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: innerRadius, overflow: 'hidden' }]}
        />
      )}
      {background && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: innerRadius, overflow: 'hidden' }]}>
          {background}
        </View>
      )}
      {inner.length > 0 && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: innerRadius, boxShadow: inner }]} />
      )}
      {children}
    </View>
  );
}
