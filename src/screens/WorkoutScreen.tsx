/**
 * Tela única da ficha — DESIGN.md §6 e promp-app.md §4.
 * Ordem das camadas: lista rolável → anel e painel flutuantes → aviso → folha.
 * Movimento (entradas, pop, pulso) fica para a etapa 4.
 */
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EditSheet } from '../components/EditSheet';
import { ExerciseCard } from '../components/ExerciseCard';
import { Header } from '../components/Header';
import { ProgressRing } from '../components/ProgressRing';
import { RestPanel } from '../components/RestPanel';
import { RestToast } from '../components/RestToast';
import { SectionRow } from '../components/SectionRow';
import { SessionBanner } from '../components/SessionBanner';
import { WorkoutTabs } from '../components/WorkoutTabs';
import { sessionById } from '../data/ficha';
import { mediaFor } from '../data/media';
import { setsOf, summarize } from '../state/progress';
import { useWorkout } from '../state/useWorkout';
import { color, component, space } from '../theme';

export function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const w = useWorkout();
  const session = sessionById[w.activeId];
  const summary = summarize(session, w.progress, w.overrides);
  const complete = summary.sets > 0 && summary.setsDone === summary.sets;

  // O design mede tudo abaixo de uma status bar de 50 pt; no aparelho vale o inset real.
  const below = (designTop: number) => insets.top + designTop - component.screen.statusBar;
  // As distâncias da base no design já incluem a área inferior do iPhone (34 pt). Se a
  // barra do sistema for maior (ex.: Android com 3 botões), tudo sobe a diferença.
  const extraBottom = Math.max(0, insets.bottom - component.screen.homeIndicator);

  const restEx = w.rest ? w.exercise(w.rest.sessionId, w.rest.exerciseId) : undefined;
  const editing = w.editing;
  const editIndex = editing ? sessionById[editing.sessionId].exercicios.findIndex((e) => e.id === editing.exerciseId) : -1;

  return (
    <View style={{ flex: 1, backgroundColor: color.surface.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + component.header.top, paddingBottom: component.screen.listBottom + extraBottom }}
      >
        <Header date={new Date()} />
        <View style={{ height: component.header.bottom }} />
        <WorkoutTabs active={w.activeId} onSelect={w.setActive} />
        <View style={{ height: component.tabs.bottom }} />
        <View style={{ paddingHorizontal: space.screenX }}>
          <SectionRow focus={session.foco} done={summary.exercisesDone} total={summary.exercises} />
        </View>
        <View style={{ height: component.section.bottom }} />

        <View style={{ paddingHorizontal: space.listX, gap: space.listGap }}>
          {complete && (
            <SessionBanner
              summary={`${session.nome} · ${summary.exercises} exercícios · ${summary.sets} séries`}
              onRestart={() => w.restartSession(session.id)}
            />
          )}
          {session.exercicios.map((base, i) => {
            const ex = w.exercise(session.id, base.id);
            const resting = w.rest?.sessionId === session.id && w.rest.exerciseId === base.id;
            return (
              <ExerciseCard
                key={base.id}
                number={i + 1}
                exercise={ex}
                source={mediaFor(session.pasta, base.id)}
                sets={setsOf(w.progress, session.id, ex)}
                restRemainingMs={resting ? w.restRemainingMs : undefined}
                onToggleSet={(j) => w.toggleSet(session.id, base.id, j)}
                onToggleAll={() => w.toggleAll(session.id, base.id)}
                onEdit={(field) => w.openEdit(session.id, base.id, field)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={{ position: 'absolute', right: space.listX, bottom: component.ring.bottom + extraBottom }}>
        <ProgressRing done={summary.setsDone} total={summary.sets} />
      </View>

      {w.rest && restEx && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: space.listX,
            right: component.restPanel.right,
            bottom: component.restPanel.bottom + extraBottom,
          }}
        >
          <RestPanel
            remainingMs={w.restRemainingMs}
            totalMs={w.rest.totalMs}
            line={`${restEx.nome} · série ${w.rest.setIndex + 1}`}
            onAdd15={w.addRest}
            onSkip={w.skipRest}
          />
        </View>
      )}

      {editing && editIndex >= 0 && (
        <EditSheet
          key={`${editing.sessionId}/${editing.exerciseId}`}
          number={editIndex + 1}
          exercise={w.exercise(editing.sessionId, editing.exerciseId)}
          base={w.baseExercise(editing.sessionId, editing.exerciseId)}
          initialField={editing.field}
          onClose={w.closeEdit}
          onSave={w.saveEdit}
        />
      )}

      {w.toast && (
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', top: below(component.toast.top), left: space.listX, right: space.listX }}
        >
          <RestToast subtitle={w.toast} />
        </View>
      )}
    </View>
  );
}

