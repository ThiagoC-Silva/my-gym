/** Abas de treino roláveis, sem scrollbar e sem porcentagem — COMPONENTS.md > WorkoutTab. */
import { ScrollView } from 'react-native';

import { ficha } from '../data/ficha';
import { component, space } from '../theme';
import type { SessionId } from '../types';
import { WorkoutTab } from './WorkoutTab';

export function WorkoutTabs({ active, onSelect }: { active: SessionId; onSelect: (id: SessionId) => void }) {
  // O ScrollView recorta o que passa das bordas; `shadowRoom` abre espaço para a
  // sombra das pílulas e a margem negativa devolve o layout ao lugar.
  const room = component.tabs.shadowRoom;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: -room, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: space.screenX, paddingVertical: room, gap: space.tabGap }}
      accessibilityRole="tablist"
    >
      {ficha.map((s) => (
        <WorkoutTab key={s.id} label={s.nome} active={s.id === active} onPress={() => onSelect(s.id)} />
      ))}
    </ScrollView>
  );
}
