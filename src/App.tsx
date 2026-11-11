/**
 * Tela provisória: prova de fumaça do tema no aparelho.
 * Confere se fontes, sombras duplas, sombra inset e degradê saem do `theme.ts`
 * como esperado no Expo Go. Será substituída pela ficha de treino.
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
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { color, fontFiles, gradient, gradientProps, radius, shadow, size, space, text } from './theme';

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
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        {loaded && (
          <View style={styles.card}>
            <Text style={[text.section, { color: color.text.heading }]}>Tema carregado</Text>
            <Text style={[text.caption, { color: color.text.muted }]}>
              Prova de fumaça do theme.ts — 32,5 kg
            </Text>
            <View style={styles.media}>
              <Text style={[text.file, { color: color.text.placeholder }]}>supino-reto.webp</Text>
            </View>
            <View style={styles.sphere}>
              <LinearGradient {...gradientProps(gradient.fill)} style={StyleSheet.absoluteFill} />
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.surface.bg,
    paddingHorizontal: space.listX,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: color.surface.card,
    borderRadius: radius.card,
    boxShadow: shadow.raised,
    padding: space.cardPad,
    gap: space.cardGap,
  },
  media: {
    height: size.media,
    borderRadius: radius.media,
    backgroundColor: color.surface.mediaStripeA,
    boxShadow: shadow.sunkenLg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphere: {
    width: size.sphere,
    height: size.sphere,
    borderRadius: radius.pill,
    overflow: 'hidden',
    boxShadow: shadow.glow,
  },
});
