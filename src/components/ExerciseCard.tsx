/**
 * Card de exercício — COMPONENTS.md > ExerciseCard e promp-app.md §6.
 * Puramente visual: recebe o exercício já com as edições aplicadas e as séries
 * marcadas. "Concluído" é derivado (todas as séries marcadas), nunca armazenado.
 */
import { StyleSheet, Text, View } from 'react-native';

import { formatClock, formatLoad, formatNumber } from '../format';
import { color, component, gradient, radius, shadow, space, text } from '../theme';
import type { Exercise } from '../types';
import { ExerciseCheck } from './ExerciseCheck';
import { ExerciseMedia } from './ExerciseMedia';
import { SetSphere } from './SetSphere';
import { StatItem } from './StatItem';
import { Surface } from './Surface';

export type StatField = 'series' | 'reps' | 'carga' | 'descansoSeg';

export interface ExerciseCardProps {
  /** Posição na sessão, 1-based. */
  number: number;
  exercise: Exercise;
  source?: number;
  sets: boolean[];
  /** Restante do descanso, só quando o timer ativo é deste exercício. */
  restRemainingMs?: number;
  onToggleSet: (index: number) => void;
  onToggleAll: () => void;
  onEdit: (field: StatField) => void;
}

/** Borda 2 pt em degradê + brilho, desenhada atrás do conteúdo (padding-box/border-box do CSS). */
function DoneBorder() {
  const b = component.card.doneBorder;
  return (
    <Surface radius={radius.card} fill={gradient.brand} shadow={shadow.glowCard} style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: b,
          left: b,
          right: b,
          bottom: b,
          borderRadius: radius.card - b,
          backgroundColor: color.surface.card,
        }}
      />
    </Surface>
  );
}

export function ExerciseCard({
  number,
  exercise,
  source,
  sets,
  restRemainingMs,
  onToggleSet,
  onToggleAll,
  onEdit,
}: ExerciseCardProps) {
  const doneCount = sets.filter(Boolean).length;
  const done = sets.length > 0 && doneCount === sets.length;
  const counting = restRemainingMs !== undefined;
  const load = formatLoad(exercise.carga);
  const c = component.card;

  return (
    <Surface
      radius={radius.card}
      fill={color.surface.card}
      shadow={shadow.raised}
      style={{ padding: space.cardPad, gap: space.cardGap }}
    >
      {done && <DoneBorder />}

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: c.headerGap }}>
        <Text style={[text.cardNumber, { color: color.accent.red, paddingTop: c.numberTop }]}>
          {String(number).padStart(2, '0')}
        </Text>
        <View style={{ flex: 1, gap: c.titleGap }}>
          <Text style={[text.cardTitle, { color: color.text.primary }]} numberOfLines={2}>
            {exercise.nome}
          </Text>
          <Text style={[text.caption, { color: color.text.muted }]}>{exercise.grupo}</Text>
        </View>
        <ExerciseCheck done={done} onPress={onToggleAll} />
      </View>

      <ExerciseMedia source={source} fileName={exercise.midia} />

      <View style={{ flexDirection: 'row', gap: space.statGap }}>
        <StatItem label="Séries" value={formatNumber(exercise.series)} onPress={() => onEdit('series')} />
        <StatItem
          label="Reps"
          value={formatNumber(exercise.reps)}
          unit={exercise.repsUnidade}
          onPress={() => onEdit('reps')}
        />
        <StatItem label="Carga" value={load.value} unit={load.unit} onPress={() => onEdit('carga')} />
        <StatItem
          label="Descanso"
          value={counting ? formatClock(restRemainingMs) : formatNumber(exercise.descansoSeg)}
          unit="s"
          counting={counting}
          onPress={() => onEdit('descansoSeg')}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space.sphereGap }}>
          {sets.map((d, i) => (
            <SetSphere key={i} n={i + 1} done={d} onPress={() => onToggleSet(i)} />
          ))}
        </View>
        <Text style={[text.count, { color: color.text.muted }]}>
          {doneCount}/{sets.length}
        </Text>
      </View>
    </Surface>
  );
}
