/**
 * Abas de treino roláveis, sem scrollbar e sem porcentagem — COMPONENTS.md > WorkoutTab.
 * Troca de aba (DESIGN.md §7, proposta): a pílula afundada desliza até a aba tocada
 * enquanto o relevo da nova aba some e o da antiga volta. Com reduced-motion, a
 * pílula muda de lugar e entra em fade.
 * A aba tocada muda aqui na hora; a troca da lista vai como transição (render
 * fatiado), para não travar os quadros da pílula enquanto os cards novos montam.
 */
import { startTransition, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

import { ficha } from '../data/ficha';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { reducedFade, timing } from '../motion';
import { component, motion, space } from '../theme';
import type { SessionId } from '../types';
import { TabBackground, WorkoutTab } from './WorkoutTab';

type Rect = { x: number; y: number; width: number; height: number };

/** Relevo de uma aba inativa: some quando ela fica ativa, volta quando deixa de ser. */
function Raised({ rect, active }: { rect: Rect; active: boolean }) {
  const reduced = useReducedMotion();
  const o = useRef(new Animated.Value(active ? 0 : 1)).current;
  useEffect(() => {
    const to = active ? 0 : 1;
    const a = reduced ? reducedFade(o, to) : timing(o, to, motion.tabSwitch);
    a.start();
    return () => a.stop();
  }, [active, reduced, o]);
  return (
    <TabBackground
      state="inactive"
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, opacity: o }}
    />
  );
}

export function WorkoutTabs({ active: activeProp, onSelect }: { active: SessionId; onSelect: (id: SessionId) => void }) {
  const [active, setActive] = useState(activeProp);
  const [prevProp, setPrevProp] = useState(activeProp);
  if (activeProp !== prevProp) {
    setPrevProp(activeProp);
    setActive(activeProp);
  }

  // O ScrollView recorta o que passa das bordas; `shadowRoom` abre espaço para a
  // sombra das pílulas e a margem negativa devolve o layout ao lugar.
  const room = component.tabs.shadowRoom;
  const reduced = useReducedMotion();
  const [rects, setRects] = useState<Partial<Record<SessionId, Rect>>>({});
  const layered = ficha.every((s) => rects[s.id]);
  const target = rects[active];

  // Posição e largura da pílula (as abas têm larguras diferentes, e a ativa é em negrito).
  const x = useRef(new Animated.Value(0)).current;
  const w = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const placed = useRef(false);
  const prevActive = useRef(active);

  useEffect(() => {
    if (!target) return;
    const switched = prevActive.current !== active;
    prevActive.current = active;
    if (!placed.current || reduced) {
      placed.current = true;
      x.setValue(target.x);
      w.setValue(target.width);
      if (reduced && switched) {
        fade.setValue(0);
        reducedFade(fade, 1, false).start();
      }
      return;
    }
    const a = Animated.parallel([
      timing(x, target.x, motion.tabSwitch, { native: false }),
      timing(w, target.width, motion.tabSwitch, { native: false }),
    ]);
    a.start();
    return () => a.stop();
  }, [active, target, reduced, x, w, fade]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: -room, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: space.screenX, paddingVertical: room, gap: space.tabGap }}
    >
      {layered && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {ficha.map((s) => (
            <Raised key={s.id} rect={rects[s.id]!} active={s.id === active} />
          ))}
          <TabBackground
            state="active"
            style={{ left: x, top: target!.y, width: w, height: target!.height, opacity: fade }}
          />
        </View>
      )}
      {ficha.map((s) => (
        <WorkoutTab
          key={s.id}
          label={s.nome}
          active={s.id === active}
          layered={layered}
          onPress={() => {
            setActive(s.id);
            startTransition(() => onSelect(s.id));
          }}
          onLayout={(e) => {
            const r = e.nativeEvent.layout;
            setRects((prev) => {
              const old = prev[s.id];
              if (old && old.x === r.x && old.y === r.y && old.width === r.width && old.height === r.height) return prev;
              return { ...prev, [s.id]: { x: r.x, y: r.y, width: r.width, height: r.height } };
            });
          }}
        />
      ))}
    </ScrollView>
  );
}
