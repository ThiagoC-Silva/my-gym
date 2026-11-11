/**
 * Text do app: o RN Text com teto de crescimento pela fonte do sistema
 * (`font.maxScale`). Usar este em vez do Text do react-native em todo o app.
 * (React 19: `ref` chega como prop comum e segue no spread.)
 */
import type { ComponentProps } from 'react';
import { Text as RNText } from 'react-native';

import { maxFontScale } from '../theme';

export function Text(props: ComponentProps<typeof RNText>) {
  return <RNText maxFontSizeMultiplier={maxFontScale} {...props} />;
}
