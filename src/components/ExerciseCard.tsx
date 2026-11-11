/**
 * Card de exercício — COMPONENTS.md > ExerciseCard e promp-app.md §6.
 * Puramente visual: recebe o exercício já com as edições aplicadas e as séries
 * marcadas. "Concluído" é derivado (todas as séries marcadas), nunca armazenado.
 */
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { formatClock, formatLoad, formatNumber } from '../format';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { reducedFade, timing, useRise } from '../motion';
import { color, component, gradient, motion, radius, shadow, space, text } from '../theme';
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

/**
 * Borda 2 pt em degradê + brilho, desenhada atrás do conteúdo (padding-box/border-box
 * do CSS). Duas camadas para o fade: o brilho (fora do card) e a borda, que é um
 * degradê coberto pelo miolo na cor do card — esta precisa de composição fora da
 * tela, senão no Android o degradê aparece através do miolo semitransparente.
 */
function DoneBorder({ opacity }: { opacity: Animated.Value }) {
  const b = component.card.doneBorder;
  return (
    <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
        <Surface radius={radius.card} shadow={shadow.glowCard} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View pointerEvents="none" needsOffscreenAlphaCompositing style={[StyleSheet.absoluteFill, { opacity }]}>
        <Surface radius={radius.card} fill={gradient.brand} style={StyleSheet.absoluteFill}>
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
      </Animated.View>
    </>
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
  const reduced = useReducedMotion();
  // Borda + brilho entram em fade ao concluir (DESIGN.md §7); somem na hora ao desmarcar.
  const border = useRise(done, (v) => (reduced ? reducedFade(v, 1) : timing(v, 1, motion.cardBorder)));

  return (
    <Surface
      radius={radius.card}
      fill={color.surface.card}
      shadow={shadow.raised}
      style={{ padding: space.cardPad, gap: space.cardGap }}
    >
      {done && <DoneBorder opacity={border} />}

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
