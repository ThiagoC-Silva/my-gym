/** Folga de toque para um alvo visualmente menor que `size.minHitArea` (44 pt), medida no layout. */
import { useState } from 'react';
import type { Insets, LayoutChangeEvent } from 'react-native';

import { size } from '../theme';

export function useMinHitSlop(): [Insets, (e: LayoutChangeEvent) => void] {
  const [box, setBox] = useState({ width: size.minHitArea, height: size.minHitArea });
  const v = Math.max(0, (size.minHitArea - box.height) / 2);
  const h = Math.max(0, (size.minHitArea - box.width) / 2);
  return [{ top: v, bottom: v, left: h, right: h }, (e) => setBox(e.nativeEvent.layout)];
}
