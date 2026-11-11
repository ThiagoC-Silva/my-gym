/** Linha de seção: "Exercícios" · divisor 3×22 · foco · concluídos/total (promp-app.md §4). */
import { View } from 'react-native';
import { Text } from './Text';

import { color, component, text } from '../theme';

export function SectionRow({ focus, done, total }: { focus: string; done: number; total: number }) {
  const s = component.section;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: s.gap }}>
      <Text style={[text.section, { color: color.text.heading }]}>Exercícios</Text>
      <View style={{ width: s.dividerWidth, height: s.dividerHeight, backgroundColor: color.accent.red }} />
      <Text style={[text.body, { color: color.text.mutedAlt, flex: 1 }]} numberOfLines={1}>
        {focus}
      </Text>
      <Text style={[text.count, { color: color.text.mutedAlt }]}>
        {done}/{total}
      </Text>
    </View>
  );
}
