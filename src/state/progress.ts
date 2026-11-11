/**
 * Regras puras de progresso e edição — promp-app.md §7 e §8. Sem React, testáveis.
 * "Concluído" é sempre derivado das séries; nada aqui armazena status.
 */
import type { Exercise, Overrides, Progress, Session, SessionId } from '../types';

export type Edit = Partial<Pick<Exercise, 'series' | 'reps' | 'carga' | 'descansoSeg'>>;

export const emptyProgress = (): Progress => ({ push: {}, infA: {}, pull: {}, infB: {}, upper: {} });
export const emptyOverrides = (): Overrides => ({ push: {}, infA: {}, pull: {}, infB: {}, upper: {} });

/** Exercício da ficha com as edições do usuário aplicadas. */
export function effective(ex: Exercise, overrides: Overrides, sessionId: SessionId): Exercise {
  return { ...ex, ...overrides[sessionId][ex.id] };
}

/** Séries marcadas no tamanho atual do exercício (completa com pendentes, corta o excesso). */
export function setsOf(progress: Progress, sessionId: SessionId, ex: Exercise): boolean[] {
  const stored = progress[sessionId][ex.id] ?? [];
  return Array.from({ length: ex.series }, (_, i) => stored[i] === true);
}

export const isDone = (sets: boolean[]) => sets.length > 0 && sets.every(Boolean);

export interface SessionSummary {
  exercises: number;
  exercisesDone: number;
  sets: number;
  setsDone: number;
}

export function summarize(session: Session, progress: Progress, overrides: Overrides): SessionSummary {
  let exercisesDone = 0;
  let sets = 0;
  let setsDone = 0;
  for (const base of session.exercicios) {
    const ex = effective(base, overrides, session.id);
    const s = setsOf(progress, session.id, ex);
    sets += s.length;
    setsDone += s.filter(Boolean).length;
    if (isDone(s)) exercisesDone++;
  }
  return { exercises: session.exercicios.length, exercisesDone, sets, setsDone };
}

/** Grava as séries de um exercício, devolvendo um novo Progress. */
export function withSets(progress: Progress, sessionId: SessionId, exerciseId: string, sets: boolean[]): Progress {
  return { ...progress, [sessionId]: { ...progress[sessionId], [exerciseId]: sets } };
}

/**
 * Aplica uma edição. Reduzir séries preserva as marcadas até o novo limite (o excesso
 * é descartado de vez); aumentar acrescenta pendentes. Campos iguais ao padrão da ficha
 * não ficam guardados como override.
 */
export function applyEdit(
  base: Exercise,
  edit: Edit,
  sessionId: SessionId,
  progress: Progress,
  overrides: Overrides,
): { progress: Progress; overrides: Overrides } {
  const clean: Edit = {};
  for (const k of ['series', 'reps', 'carga', 'descansoSeg'] as const) {
    if (edit[k] !== undefined && edit[k] !== base[k]) (clean as Record<string, number>)[k] = edit[k] as number;
  }
  const nextOverrides = { ...overrides, [sessionId]: { ...overrides[sessionId] } };
  if (Object.keys(clean).length) nextOverrides[sessionId][base.id] = clean;
  else delete nextOverrides[sessionId][base.id];

  const ex = effective(base, nextOverrides, sessionId);
  const nextProgress = withSets(progress, sessionId, base.id, setsOf(progress, sessionId, ex));
  return { progress: nextProgress, overrides: nextOverrides };
}
