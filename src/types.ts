/** Modelo de dados — `promp-app.md §8`. */

export type SessionId = 'push' | 'infA' | 'pull' | 'infB' | 'upper';

export type Exercise = {
  /** Slug estável, = nome do arquivo de mídia sem extensão. */
  id: string;
  nome: string;
  /** Subtítulo do card, ex.: "Peitoral superior". */
  grupo: string;
  series: number;
  /** Número único (topo da faixa original). */
  reps: number;
  /** Ex.: "/perna". */
  repsUnidade?: string;
  descansoSeg: number;
  /** kg. 0 = peso corporal ("PC"); undefined = "—". */
  carga?: number;
  /** "supino-reto.webp" — sempre exibido no placeholder. */
  midia: string;
};

export type Session = {
  id: SessionId;
  /** "Inferiores A" */
  nome: string;
  /** "Quadríceps · Panturrilha · Abdômen" */
  foco: string;
  /** Pasta em assets/exercises/, ex.: "inferiores-a". */
  pasta: string;
  exercicios: Exercise[];
};

/** Séries concluídas por exercício, por sessão. */
export type Progress = Record<SessionId, Record<string, boolean[]>>;

/** Edições do usuário sobrepostas à ficha padrão. */
export type Overrides = Record<
  SessionId,
  Record<string, Partial<Pick<Exercise, 'series' | 'reps' | 'carga' | 'descansoSeg'>>>
>;

export type RestState = {
  sessionId: SessionId;
  exerciseId: string;
  /** Série que disparou (0-based). */
  setIndex: number;
  /** Date.now() + duração. */
  endsAt: number;
  /** Cresce com +15s. */
  totalMs: number;
} | null;
