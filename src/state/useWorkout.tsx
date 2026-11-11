/**
 * Estado único do app (promp-app.md §7–§8): sessão ativa, progresso, edições,
 * descanso, aviso de fim e folha de edição. `Progress` e `Overrides` são
 * persistidos no AsyncStorage; descanso, aviso e folha não.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { StatField } from '../components/ExerciseCard';
import { ficha, sessionById } from '../data/ficha';
import { useRestTimer } from '../hooks/useRestTimer';
import { motion } from '../theme';
import type { Exercise, Overrides, Progress, RestState, SessionId } from '../types';
import {
  applyEdit,
  type Edit,
  effective,
  emptyOverrides,
  emptyProgress,
  isDone,
  setsOf,
  summarize,
  withSets,
} from './progress';
import { sessionForDate } from './schedule';

const STORAGE_KEY = 'gym-fire:v1';
const PLUS_MS = 15_000;

export interface Editing {
  sessionId: SessionId;
  exerciseId: string;
  field: StatField;
}

interface WorkoutValue {
  ready: boolean;
  activeId: SessionId;
  setActive: (id: SessionId) => void;
  progress: Progress;
  overrides: Overrides;
  exercise: (sessionId: SessionId, exerciseId: string) => Exercise;
  /** Exercício como está na ficha, sem edições (para o "Restaurar"). */
  baseExercise: (sessionId: SessionId, exerciseId: string) => Exercise;
  rest: RestState;
  restRemainingMs: number;
  toast: string | null;
  editing: Editing | null;
  toggleSet: (sessionId: SessionId, exerciseId: string, index: number) => void;
  toggleAll: (sessionId: SessionId, exerciseId: string) => void;
  addRest: () => void;
  skipRest: () => void;
  restartSession: (sessionId: SessionId) => void;
  openEdit: (sessionId: SessionId, exerciseId: string, field: StatField) => void;
  closeEdit: () => void;
  saveEdit: (edit: Edit) => void;
}

const WorkoutContext = createContext<WorkoutValue | null>(null);

function baseExercise(sessionId: SessionId, exerciseId: string): Exercise {
  const ex = sessionById[sessionId].exercicios.find((e) => e.id === exerciseId);
  if (!ex) throw new Error(`Exercício desconhecido: ${sessionId}/${exerciseId}`);
  return ex;
}

/** Aceita só o formato esperado; qualquer coisa estranha no storage vira estado vazio. */
function parseStored(raw: string | null): { progress: Progress; overrides: Overrides } {
  const fallback = { progress: emptyProgress(), overrides: emptyOverrides() };
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw) as { progress?: Progress; overrides?: Overrides };
    const progress = emptyProgress();
    const overrides = emptyOverrides();
    for (const s of ficha) {
      Object.assign(progress[s.id], data.progress?.[s.id] ?? {});
      Object.assign(overrides[s.id], data.overrides?.[s.id] ?? {});
    }
    return { progress, overrides };
  } catch {
    return fallback;
  }
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<SessionId>(() => sessionForDate(new Date()));
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [overrides, setOverrides] = useState<Overrides>(emptyOverrides);
  const [rest, setRest] = useState<RestState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ---- persistência ----
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(parseStored)
      .catch(() => ({ progress: emptyProgress(), overrides: emptyOverrides() }))
      .then((s) => {
        setProgress(s.progress);
        setOverrides(s.overrides);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, overrides })).catch(() => undefined);
  }, [ready, progress, overrides]);

  // ---- leitura ----
  const exercise = useCallback(
    (sessionId: SessionId, exerciseId: string) => effective(baseExercise(sessionId, exerciseId), overrides, sessionId),
    [overrides],
  );

  // ---- descanso ----
  const showToast = useCallback((line: string) => {
    clearTimeout(toastTimer.current);
    setToast(line);
    toastTimer.current = setTimeout(() => setToast(null), motion.toastIn.holdMs);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Efeitos colaterais fora do updater do setState (que o modo estrito chama duas vezes).
  const restRef = useRef<RestState>(null);
  restRef.current = rest;
  const onRestFinish = useCallback(() => {
    const r = restRef.current;
    if (!r) return;
    restRef.current = null;
    setRest(null);
    showToast(`${baseExercise(r.sessionId, r.exerciseId).nome} · próxima série`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [showToast]);

  const restRemainingMs = useRestTimer(rest, onRestFinish);

  const cancelRestOf = (sessionId: SessionId, exerciseId: string) =>
    setRest((r) => (r && r.sessionId === sessionId && r.exerciseId === exerciseId ? null : r));

  // ---- séries ----
  const toggleSet = useCallback(
    (sessionId: SessionId, exerciseId: string, index: number) => {
      const ex = effective(baseExercise(sessionId, exerciseId), overrides, sessionId);
      const sets = setsOf(progress, sessionId, ex);
      const marking = !sets[index];
      sets[index] = marking;
      const next = withSets(progress, sessionId, exerciseId, sets);
      setProgress(next);

      if (!marking) {
        cancelRestOf(sessionId, exerciseId);
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      // Última série pendente da sessão: entra o banner, não o descanso.
      const s = summarize(sessionById[sessionId], next, overrides);
      if (s.setsDone === s.sets) {
        setRest(null);
        return;
      }
      const totalMs = ex.descansoSeg * 1000;
      if (totalMs > 0) setRest({ sessionId, exerciseId, setIndex: index, endsAt: Date.now() + totalMs, totalMs });
    },
    [progress, overrides],
  );

  const toggleAll = useCallback(
    (sessionId: SessionId, exerciseId: string) => {
      const ex = effective(baseExercise(sessionId, exerciseId), overrides, sessionId);
      const sets = setsOf(progress, sessionId, ex);
      if (!isDone(sets)) {
        // Marca todas, sem iniciar timer.
        setProgress(withSets(progress, sessionId, exerciseId, sets.map(() => true)));
        return;
      }
      Alert.alert('Desmarcar todas as séries?', ex.nome, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desmarcar',
          style: 'destructive',
          onPress: () => {
            setProgress((p) => withSets(p, sessionId, exerciseId, sets.map(() => false)));
            cancelRestOf(sessionId, exerciseId);
          },
        },
      ]);
    },
    [progress, overrides],
  );

  const addRest = useCallback(
    () => setRest((r) => (r ? { ...r, endsAt: r.endsAt + PLUS_MS, totalMs: r.totalMs + PLUS_MS } : r)),
    [],
  );
  const skipRest = useCallback(() => setRest(null), []);

  const restartSession = useCallback((sessionId: SessionId) => {
    setProgress((p) => ({ ...p, [sessionId]: {} }));
    setRest((r) => (r && r.sessionId === sessionId ? null : r));
  }, []);

  // ---- abas e edição ----
  const setActive = useCallback((id: SessionId) => {
    setActiveId(id);
    setEditing(null); // trocar de aba fecha a folha; o descanso continua
  }, []);

  const openEdit = useCallback(
    (sessionId: SessionId, exerciseId: string, field: StatField) => setEditing({ sessionId, exerciseId, field }),
    [],
  );
  const closeEdit = useCallback(() => setEditing(null), []);

  const saveEdit = useCallback(
    (edit: Edit) => {
      if (!editing) return;
      const base = baseExercise(editing.sessionId, editing.exerciseId);
      const current = effective(base, overrides, editing.sessionId);
      const r = applyEdit(base, { ...current, ...edit }, editing.sessionId, progress, overrides);
      setProgress(r.progress);
      setOverrides(r.overrides);
      setEditing(null);
    },
    [editing, progress, overrides],
  );

  const value = useMemo<WorkoutValue>(
    () => ({
      ready,
      activeId,
      setActive,
      progress,
      overrides,
      exercise,
      baseExercise,
      rest,
      restRemainingMs,
      toast,
      editing,
      toggleSet,
      toggleAll,
      addRest,
      skipRest,
      restartSession,
      openEdit,
      closeEdit,
      saveEdit,
    }),
    [ready, activeId, setActive, progress, overrides, exercise, rest, restRemainingMs, toast, editing, toggleSet,
      toggleAll, addRest, skipRest, restartSession, openEdit, closeEdit, saveEdit],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout(): WorkoutValue {
  const v = useContext(WorkoutContext);
  if (!v) throw new Error('useWorkout fora do WorkoutProvider');
  return v;
}
