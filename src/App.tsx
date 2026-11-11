/** Raiz do app: fontes, safe area, estado e a tela única da ficha. */
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

import { WorkoutScreen } from './screens/WorkoutScreen';
import { useWorkout, WorkoutProvider } from './state/useWorkout';
import { color, fontFiles } from './theme';

const fonts = {
  [fontFiles.sans[400]]: Poppins_400Regular,
  [fontFiles.sans[500]]: Poppins_500Medium,
  [fontFiles.sans[600]]: Poppins_600SemiBold,
  [fontFiles.sans[700]]: Poppins_700Bold,
  [fontFiles.sans[800]]: Poppins_800ExtraBold,
  [fontFiles.mono[500]]: JetBrainsMono_500Medium,
};

function Root() {
  const [fontsLoaded] = useFonts(fonts);
  const { ready } = useWorkout();
  return fontsLoaded && ready ? <WorkoutScreen /> : null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: color.surface.bg }}>
        <WorkoutProvider>
          <Root />
        </WorkoutProvider>
      </View>
    </SafeAreaProvider>
  );
}
