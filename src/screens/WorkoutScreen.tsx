/**
 * Tela única da ficha — DESIGN.md §6 e promp-app.md §4.
 * Ordem das camadas: lista rolável → anel e painel flutuantes → folha → aviso.
 * Movimento (DESIGN.md §7): painel sobe, aviso desce, banner sobe com fade e a lista
 * entra em fade ao trocar de aba. Painel e aviso guardam o último conteúdo para a saída.
 */
import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EditSheet } from '../components/EditSheet';
import { ExerciseCard } from '../components/ExerciseCard';
import { Header } from '../components/Header';
import { ProgressRing } from '../components/ProgressRing';
import { RestPanel } from '../components/RestPanel';
import { RestToast } from '../components/RestToast';
import { SectionRow } from '../components/SectionRow';
import { SessionBanner } from '../components/SessionBanner';
import { SlideIn } from '../components/SlideIn';
import { WorkoutTabs } from '../components/WorkoutTabs';
import { sessionById } from '../data/ficha';
import { mediaFor } from '../data/media';
import { setsOf, summarize } from '../state/progress';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { reducedFade, timing } from '../motion';
import { useWorkout } from '../state/useWorkout';
import { color, component, motion, space } from '../theme';

/** Mantém o último valor definido (conteúdo de algo que está saindo). */
function useLast<T>(value: T | undefined): T | undefined {
  const last = useRef(value);
  if (value !== undefined) last.current = value;
  return last.current;
}

/**
 * Lista de cards: entra em fade quando monta por troca de aba (não na abertura).
 * O fade só começa depois do primeiro layout: antes disso o thread de UI ainda está
 * montando os cards e os quadros iniciais seriam pulados.
 */
function ListFade({ appear, style, children }: { appear: boolean; style: object; children: ReactNode }) {
  const reduced = useReducedMotion();
  const o = useRef(new Animated.Value(appear ? 0 : 1)).current;
  const started = useRef(!appear);
  const start = () => {
    if (started.current) return;
    started.current = true;
    requestAnimationFrame(() =>
      (reduced
        ? reducedFade(o, 1)
        : timing(o, 1, { duration: motion.tabSwitch.listFade, easing: motion.tabSwitch.listEasing })
      ).start(),
    );
  };
  useEffect(() => () => o.stopAnimation(), [o]);
  // Composição fora da tela: sem ela, cada camada do card desbota sozinha e as de baixo aparecem.
  return (
    <Animated.View needsOffscreenAlphaCompositing onLayout={start} style={[style, { opacity: o }]}>
      {children}
    </Animated.View>
  );
}

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

  const panel = useLast(
    w.rest && restEx
      ? {
          remainingMs: w.restRemainingMs,
          endsAt: w.rest.endsAt,
          totalMs: w.rest.totalMs,
          line: `${restEx.nome} · série ${w.rest.setIndex + 1}`,
        }
      : undefined,
  );
  const toast = useLast(w.toast ?? undefined);

  // A lista é remontada a cada aba (key); só faz fade depois da primeira troca.
  const firstSession = useRef(w.activeId);
  const switched = useRef(false);
  if (w.activeId !== firstSession.current) switched.current = true;

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

        <ListFade key={session.id} appear={switched.current} style={{ paddingHorizontal: space.listX, gap: space.listGap }}>
          {/* Atrás dos cards (z), o banner sobe por baixo deles. Some na hora ao reiniciar. */}
          <SlideIn show={complete} token={motion.bannerIn} appear={false} exit={false}>
            {(entering) => (
              <SessionBanner
                summary={`${session.nome} · ${summary.exercises} exercícios · ${summary.sets} séries`}
                onRestart={() => w.restartSession(session.id)}
                entering={entering}
              />
            )}
          </SlideIn>
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
        </ListFade>
      </ScrollView>

      <View pointerEvents="box-none" style={{ position: 'absolute', right: space.listX, bottom: component.ring.bottom + extraBottom }}>
        <ProgressRing done={summary.setsDone} total={summary.sets} />
      </View>

      <SlideIn
        show={!!(w.rest && restEx)}
        token={motion.restPanelIn}
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: space.listX,
          right: component.restPanel.right,
          bottom: component.restPanel.bottom + extraBottom,
        }}
      >
        {panel && <RestPanel {...panel} onAdd15={w.addRest} onSkip={w.skipRest} />}
      </SlideIn>

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

      <SlideIn
        show={!!w.toast}
        token={motion.toastIn}
        pointerEvents="box-none"
        style={{ position: 'absolute', top: below(component.toast.top), left: space.listX, right: space.listX }}
      >
        {toast !== undefined && <RestToast subtitle={toast} />}
      </SlideIn>
    </View>
  );
}

