/**
 * Preferência de "reduzir movimento" do sistema (promp-app.md §11). Uma única
 * assinatura para o app todo: cada esfera da tela usa o hook, então não vale abrir
 * um listener por componente.
 */
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

let reduced = false;
const listeners = new Set<() => void>();

function set(v: boolean) {
  if (v === reduced) return;
  reduced = v;
  listeners.forEach((l) => l());
}

AccessibilityInfo.isReduceMotionEnabled()
  .then(set)
  .catch(() => undefined);
AccessibilityInfo.addEventListener('reduceMotionChanged', set);

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => reduced);
}
