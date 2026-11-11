/** Texto preenchido com degradê (equivalente a `background-clip: text`). */
import MaskedViewUntyped from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType, ReactElement } from 'react';
import { Text, type TextStyle, type ViewProps } from 'react-native';

import { type Gradient, gradientProps } from '../theme';

/**
 * A declaração de tipos do masked-view 0.3.2 compõe a classe com `NativeMethods`
 * do RN, que no RN 0.88 deixou de satisfazer `React.Component` (TS2786). O
 * componente funciona; só a tipagem está defasada. Reexpomos com a assinatura
 * das props documentadas.
 */
const MaskedView = MaskedViewUntyped as unknown as ComponentType<
  ViewProps & { maskElement: ReactElement; androidRenderingMode?: 'software' | 'hardware' }
>;

export function GradientText({ children, style, fill }: { children: string; style: TextStyle; fill: Gradient }) {
  return (
    // alignSelf: o degradê acompanha a largura do texto, não a da coluna (senão
    // um "00:48" curto mostraria só o começo laranja do degradê).
    <MaskedView style={{ alignSelf: 'flex-start' }} maskElement={<Text style={style}>{children}</Text>}>
      {/* O degradê precisa do mesmo tamanho do texto: um Text invisível o dimensiona. */}
      <LinearGradient {...gradientProps(fill)}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
