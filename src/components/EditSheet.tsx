/**
 * Folha de edição — COMPONENTS.md > EditSheet e promp-app.md §7.4.
 * Valores locais até "Salvar". "Restaurar" volta os steppers ao padrão da ficha
 * (só persiste ao salvar). Toque no scrim, no × ou no "voltar" do Android fecha sem salvar.
 * Movimento (DESIGN.md §7): scrim em fade, folha sobe; ao fechar ou salvar, a saída
 * invertida roda antes de avisar a tela.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

import { formatLoad, formatNumber } from '../format';
import { useMinHitSlop } from '../hooks/useMinHitSlop';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { reducedFade, timing } from '../motion';
import type { Edit } from '../state/progress';
import { color, component, edit as steps, fitOneLine, gradient, motion, radius, shadow, size, text } from '../theme';
import type { Exercise } from '../types';
import type { StatField } from './ExerciseCard';
import { CloseIcon, MinusIcon, PlusIcon } from './icons';
import { SlideIn } from './SlideIn';
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

function StepButton({ kind, onPress }: { kind: 'minus' | 'plus'; onPress: () => void }) {
  const s = component.sheet;
  const plus = kind === 'plus';
  return (
    <Pressable onPress={onPress}>
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
    <Pressable onPress={onFocus}>
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
        <StepButton kind="minus" onPress={() => onStep(-1)} />
        <Text
          style={[text.sheetValue, { width: s.valueWidth, textAlign: 'center', color: color.text.primary }]}
          numberOfLines={1}
        >
          {shown.value}
          {shown.unit !== undefined && (
            <>
              <View style={{ width: component.stat.unitGap, height: 0 }} />
              <Text style={[text.unit, { color: color.text.muted }]}>{shown.unit}</Text>
            </>
          )}
        </Text>
        <StepButton kind="plus" onPress={() => onStep(1)} />
      </Surface>
    </Pressable>
  );
}

export interface EditSheetProps {
  number: number;
  exercise: Exercise;
  base: Exercise;
  initialField: StatField;
  /** Chamado depois da animação de saída. */
  onClose: () => void;
  /** Persiste na hora; a folha sai em seguida e chama `onClose`. */
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

  // Ação pendente (fechar ou salvar) que roda quando a saída termina.
  const [closing, setClosing] = useState<(() => void) | null>(null);
  const dismiss = (after: () => void) => setClosing((c) => c ?? after);

  // "Voltar" do Android = fechar sem salvar. Fica registrado enquanto a folha existe
  // (inclusive durante a saída, para um segundo toque não sair do app).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setClosing((c) => c ?? closeRef.current);
      return true;
    });
    return () => sub.remove();
  }, []);

  const reduced = useReducedMotion();
  const scrim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const to = closing ? 0 : 1;
    const a = reduced
      ? reducedFade(scrim, to)
      : timing(scrim, to, { duration: motion.sheetIn.scrimFade, easing: motion.sheetIn.easing });
    a.start();
    return () => a.stop();
  }, [closing, reduced, scrim]);

  const step = (key: StatField, dir: 1 | -1) => {
    setFocus(key);
    setValues((v) => ({ ...v, [key]: stepValue(key, v[key], dir) ?? v[key] }));
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={closing ? 'none' : 'auto'}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: scrim }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: color.scrim }]}
          onPress={() => dismiss(onClose)}
        />
      </Animated.View>
      <SlideIn
        show={!closing}
        token={motion.sheetIn}
        onExited={() => closing?.()}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <View
          style={{
            backgroundColor: color.surface.bg,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingTop: s.padTop,
            paddingHorizontal: s.padX,
            paddingBottom: s.padBottom + extraBottom,
            gap: s.gap,
          }}
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
              onPress={() => dismiss(onClose)}
              hitSlop={closeHit}
              onLayout={onCloseLayout}
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
            <Pressable
              onPress={() => {
                if (closing) return;
                onSave(values);
                dismiss(onClose);
              }}
              style={{ flex: 1 }}
            >
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
      </SlideIn>
    </View>
  );
}
