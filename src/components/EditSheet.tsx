/**
 * Folha de edição — COMPONENTS.md > EditSheet e promp-app.md §7.4.
 * Valores locais até "Salvar". "Restaurar" volta os steppers ao padrão da ficha
 * (só persiste ao salvar). Toque no scrim fecha sem salvar.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

import { formatLoad, formatNumber } from '../format';
import { useMinHitSlop } from '../hooks/useMinHitSlop';
import type { Edit } from '../state/progress';
import { color, component, edit as steps, fitOneLine, gradient, radius, shadow, size, text } from '../theme';
import type { Exercise } from '../types';
import type { StatField } from './ExerciseCard';
import { CloseIcon, MinusIcon, PlusIcon } from './icons';
import { Surface } from './Surface';

type Values = Required<Pick<Exercise, 'series' | 'reps' | 'descansoSeg'>> & { carga: number | undefined };

const fields: { key: StatField; label: string; step: { step: number; min: number; max: number }; hint: string }[] = [
  { key: 'series', label: 'Séries', step: steps.sets, hint: `passo ${formatNumber(steps.sets.step)}` },
  { key: 'reps', label: 'Repetições', step: steps.reps, hint: `passo ${formatNumber(steps.reps.step)}` },
  {
    key: 'carga',
    label: 'Carga',
    step: steps.load,
    hint: `passo ${formatNumber(steps.load.step)} ${steps.load.unit} · 0 = peso corporal`,
  },
  {
    key: 'descansoSeg',
    label: 'Descanso',
    step: steps.rest,
    hint: `passo ${formatNumber(steps.rest.step)} ${steps.rest.unit}`,
  },
];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Carga vazia (undefined): "+" começa no primeiro passo; "−" não faz nada. */
function stepValue(key: StatField, current: number | undefined, dir: 1 | -1): number | undefined {
  const f = fields.find((x) => x.key === key)!.step;
  if (current === undefined) return dir > 0 ? clamp(f.min + f.step, f.min, f.max) : undefined;
  return clamp(Math.round((current + dir * f.step) * 100) / 100, f.min, f.max);
}

function display(key: StatField, v: Values, repsUnidade?: string): { value: string; unit?: string } {
  if (key === 'carga') return formatLoad(v.carga);
  if (key === 'descansoSeg') return { value: formatNumber(v.descansoSeg), unit: steps.rest.unit };
  if (key === 'reps') return { value: formatNumber(v.reps), unit: repsUnidade };
  return { value: formatNumber(v.series) };
}

function StepButton({ kind, onPress, label }: { kind: 'minus' | 'plus'; onPress: () => void; label: string }) {
  const s = component.sheet;
  const plus = kind === 'plus';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Surface
        radius={radius.pill}
        fill={plus ? gradient.fill : color.surface.bg}
        shadow={plus ? shadow.glow : shadow.sphere}
        style={{ width: size.stepper, height: size.stepper, alignItems: 'center', justifyContent: 'center' }}
      >
        {plus ? (
          <PlusIcon size={s.plusGlyph} color={color.text.onAccent} strokeWidth={s.glyphStroke} />
        ) : (
          <MinusIcon size={s.minusGlyph} color={color.text.secondary} strokeWidth={s.glyphStroke} />
        )}
      </Surface>
    </Pressable>
  );
}

function StepperRow({
  label,
  hint,
  focused,
  shown,
  onFocus,
  onStep,
}: {
  label: string;
  hint: string;
  focused: boolean;
  shown: { value: string; unit?: string };
  onFocus: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const s = component.sheet;
  return (
    <Pressable onPress={onFocus} accessible={false}>
      <Surface
        radius={radius.sheetRow}
        fill={focused ? color.surface.sunken : undefined}
        shadow={focused ? shadow.pressed : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: s.rowPadY,
          paddingLeft: s.rowPadLeft,
          paddingRight: s.rowPadRight,
          gap: s.rowGap,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[text.stepLabel, { color: focused ? color.accent.orange : color.text.secondary }]} {...fitOneLine}>
            {label}
          </Text>
          <Text style={[text.stepHint, { color: color.text.disabled }]}>{hint}</Text>
        </View>
        <StepButton kind="minus" label={`Diminuir ${label}`} onPress={() => onStep(-1)} />
        <Text
          style={[text.sheetValue, { width: s.valueWidth, textAlign: 'center', color: color.text.primary }]}
          numberOfLines={1}
          accessibilityLabel={`${label}: ${shown.value}${shown.unit ? ` ${shown.unit}` : ''}`}
        >
          {shown.value}
          {shown.unit !== undefined && (
            <>
              <View style={{ width: component.stat.unitGap, height: 0 }} />
              <Text style={[text.unit, { color: color.text.muted }]}>{shown.unit}</Text>
            </>
          )}
        </Text>
        <StepButton kind="plus" label={`Aumentar ${label}`} onPress={() => onStep(1)} />
      </Surface>
    </Pressable>
  );
}

export interface EditSheetProps {
  number: number;
  exercise: Exercise;
  base: Exercise;
  initialField: StatField;
  onClose: () => void;
  onSave: (edit: Edit) => void;
}

export function EditSheet({ number, exercise, base, initialField, onClose, onSave }: EditSheetProps) {
  const s = component.sheet;
  const c = component.card;
  const [focus, setFocus] = useState<StatField>(initialField);
  const [values, setValues] = useState<Values>({
    series: exercise.series,
    reps: exercise.reps,
    carga: exercise.carga,
    descansoSeg: exercise.descansoSeg,
  });
  const [closeHit, onCloseLayout] = useMinHitSlop();
  const insets = useSafeAreaInsets();
  const extraBottom = Math.max(0, insets.bottom - component.screen.homeIndicator);

  const step = (key: StatField, dir: 1 | -1) => {
    setFocus(key);
    setValues((v) => ({ ...v, [key]: stepValue(key, v[key], dir) ?? v[key] }));
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: color.scrim }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar sem salvar"
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color.surface.bg,
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
          paddingTop: s.padTop,
          paddingHorizontal: s.padX,
          paddingBottom: s.padBottom + extraBottom,
          gap: s.gap,
        }}
        accessibilityViewIsModal
      >
        <View
          style={{
            alignSelf: 'center',
            width: s.handleWidth,
            height: s.handleHeight,
            borderRadius: radius.pill,
            backgroundColor: color.border.idle,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: c.headerGap }}>
          <Text style={[text.cardNumber, { color: color.accent.red, paddingTop: c.numberTop }]}>
            {String(number).padStart(2, '0')}
          </Text>
          <View style={{ flex: 1, gap: c.titleGap }}>
            <Text style={[text.sheetKicker, { color: color.text.muted }]}>Editar exercício</Text>
            <Text style={[text.cardTitle, { color: color.text.primary }]} numberOfLines={2}>
              {exercise.nome}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={closeHit}
            onLayout={onCloseLayout}
            accessibilityRole="button"
            accessibilityLabel="Fechar sem salvar"
          >
            <Surface
              radius={radius.pill}
              fill={color.surface.bg}
              shadow={shadow.sphere}
              style={{ width: s.close, height: s.close, alignItems: 'center', justifyContent: 'center' }}
            >
              <CloseIcon size={s.closeGlyph} color={color.text.toastSub} strokeWidth={s.glyphStroke} />
            </Surface>
          </Pressable>
        </View>

        <View>
          {fields.map((f) => (
            <StepperRow
              key={f.key}
              label={f.label}
              hint={f.hint}
              focused={focus === f.key}
              shown={display(f.key, values, exercise.repsUnidade)}
              onFocus={() => setFocus(f.key)}
              onStep={(dir) => step(f.key, dir)}
            />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: s.footerGap, height: s.footerHeight }}>
          <Pressable
            onPress={() =>
              setValues({ series: base.series, reps: base.reps, carga: base.carga, descansoSeg: base.descansoSeg })
            }
            accessibilityRole="button"
          >
            <Surface
              radius={radius.button}
              fill={color.surface.bg}
              shadow={shadow.raisedSm}
              style={{ height: '100%', paddingHorizontal: s.restorePadX, justifyContent: 'center' }}
            >
              <Text style={[text.buttonSecondary, { color: color.text.toastSub }]}>Restaurar</Text>
            </Surface>
          </Pressable>
          <Pressable onPress={() => onSave(values)} style={{ flex: 1 }} accessibilityRole="button">
            <Surface
              radius={radius.button}
              fill={gradient.brand}
              shadow={shadow.cta}
              style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[text.button, { color: color.text.onAccent }]}>Salvar alterações</Text>
            </Surface>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
