/**
 * Raiz do app. Por ora mostra a vitrine de componentes (etapa 2 do fluxo);
 * será trocada pela tela da ficha na etapa 3.
 */
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ComponentShowcase } from './dev/ComponentShowcase';
import { color, fontFiles } from './theme';

const fonts = {
  [fontFiles.sans[400]]: Poppins_400Regular,
  [fontFiles.sans[500]]: Poppins_500Medium,
  [fontFiles.sans[600]]: Poppins_600SemiBold,
  [fontFiles.sans[700]]: Poppins_700Bold,
  [fontFiles.sans[800]]: Poppins_800ExtraBold,
  [fontFiles.mono[500]]: JetBrainsMono_500Medium,
};

export default function App() {
  const [loaded] = useFonts(fonts);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: color.surface.bg }}>{loaded && <ComponentShowcase />}</View>
    </SafeAreaProvider>
  );
}
