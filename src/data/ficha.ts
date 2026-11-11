/**
 * Ficha de treino — transcrita de `promp-app.md §9`, a única fonte do conteúdo
 * (conferida contra a ficha oficial de 02/11/2026 em 10/11/2026).
 * Descanso: compostos 150 s, isoladores 75 s. Carga vazia (undefined) em todos.
 * Não copiar dados dos PNGs do design: são mock.
 */
import type { Exercise, Session, SessionId } from '../types';

const COMPOSTO = 150;
const ISOLADOR = 75;

function ex(
  id: string,
  nome: string,
  grupo: string,
  series: number,
  reps: number,
  descansoSeg: number,
  repsUnidade?: string,
): Exercise {
  return { id, nome, grupo, series, reps, descansoSeg, midia: `${id}.webp`, ...(repsUnidade ? { repsUnidade } : {}) };
}

export const ficha: Session[] = [
  {
    id: 'push',
    nome: 'Push',
    foco: 'Peito · Ombros · Tríceps',
    pasta: 'push',
    exercicios: [
      ex('supino-inclinado', 'Supino inclinado', 'Peitoral superior', 4, 10, COMPOSTO),
      ex('supino-reto', 'Supino reto', 'Peitoral', 3, 10, COMPOSTO),
      ex('peck-deck', 'Peck deck', 'Peitoral interno', 3, 12, ISOLADOR),
      ex('desenvolvimento', 'Desenvolvimento', 'Ombros', 3, 10, COMPOSTO),
      ex('elevacao-lateral', 'Elevação lateral', 'Deltoide lateral', 4, 15, ISOLADOR),
      ex('triceps-cross-over', 'Tríceps no cross over', 'Tríceps', 3, 12, ISOLADOR),
    ],
  },
  {
    id: 'infA',
    nome: 'Inferiores A',
    foco: 'Quadríceps · Panturrilha · Abdômen',
    pasta: 'inferiores-a',
    exercicios: [
      ex('leg-press-45', 'Leg press 45°', 'Quadríceps e glúteo', 4, 12, COMPOSTO),
      ex('hack-machine', 'Hack machine', 'Quadríceps', 3, 12, COMPOSTO),
      ex('extensora', 'Extensora', 'Quadríceps', 3, 15, ISOLADOR),
      ex('afundo', 'Afundo', 'Quadríceps e glúteo', 3, 10, COMPOSTO, '/perna'),
      ex('panturrilha-em-pe', 'Panturrilha em pé', 'Panturrilha', 4, 15, ISOLADOR),
      ex('abdominal', 'Abdominal', 'Abdômen', 3, 15, ISOLADOR),
    ],
  },
  {
    id: 'pull',
    nome: 'Pull',
    foco: 'Costas · Ombro posterior · Bíceps',
    pasta: 'pull',
    exercicios: [
      ex('pulley-frente', 'Pulley frente', 'Dorsal', 4, 10, COMPOSTO),
      ex('remada-baixa', 'Remada baixa', 'Costas (meio)', 4, 10, COMPOSTO),
      ex('remada-unilateral', 'Remada unilateral', 'Dorsal', 3, 12, COMPOSTO),
      ex('crucifixo-inverso-fly', 'Crucifixo inverso no fly', 'Deltoide posterior', 3, 15, ISOLADOR),
      ex('face-pull-polia', 'Face pull na polia', 'Deltoide posterior', 3, 15, ISOLADOR),
      ex('rosca-direta-barra', 'Rosca direta', 'Bíceps', 3, 10, ISOLADOR),
      ex('rosca-martelo', 'Rosca martelo', 'Braquial', 3, 12, ISOLADOR),
    ],
  },
  {
    id: 'infB',
    nome: 'Inferiores B',
    foco: 'Posterior · Glúteo · Panturrilha',
    pasta: 'inferiores-b',
    exercicios: [
      ex('flexora-horizontal', 'Flexora horizontal', 'Posterior de coxa', 4, 12, ISOLADOR),
      ex('flexora-sentada', 'Flexora sentada', 'Posterior de coxa', 3, 12, ISOLADOR),
      ex('elevacao-pelvica', 'Elevação pélvica no aparelho', 'Glúteo', 4, 12, COMPOSTO),
      ex('agachamento-sumo', 'Agachamento sumô', 'Glúteo e adutores', 3, 12, COMPOSTO),
      ex('abducao', 'Abdução', 'Glúteo médio', 3, 15, ISOLADOR),
      ex('panturrilha-sentada', 'Panturrilha sentada', 'Sóleo', 4, 15, ISOLADOR),
    ],
  },
  {
    id: 'upper',
    nome: 'Upper',
    foco: 'Largura de costas · Ombros · Braços · Abdômen',
    pasta: 'upper',
    exercicios: [
      ex('pulley-neutro', 'Pulley com pegada neutra', 'Dorsal', 3, 12, COMPOSTO),
      ex('supino-inclinado-halteres', 'Supino inclinado com halteres', 'Peitoral superior', 3, 12, COMPOSTO),
      ex('elevacao-lateral', 'Elevação lateral', 'Deltoide lateral', 4, 15, ISOLADOR),
      ex('triceps-frances-cross-over', 'Tríceps francês no cross over', 'Tríceps', 3, 12, ISOLADOR),
      ex('rosca-concentrada-banco', 'Rosca concentrada ou Scott', 'Bíceps', 3, 12, ISOLADOR),
      ex('abdominal', 'Abdominal', 'Abdômen', 3, 15, ISOLADOR),
    ],
  },
];

export const sessionById = Object.fromEntries(ficha.map((s) => [s.id, s])) as Record<SessionId, Session>;
