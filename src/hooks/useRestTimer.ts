/**
 * Contagem do descanso por timestamp (promp-app.md §7.3): o restante é sempre
 * `endsAt - Date.now()`, então re-render atrasado ou app em segundo plano não
 * atrasam o timer. O intervalo só serve para redesenhar.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { RestState } from '../types';

const TICK_MS = 250;

export function useRestTimer(rest: RestState, onFinish: () => void): number {
  const [now, setNow] = useState(() => Date.now());
  const finish = useRef(onFinish);
  finish.current = onFinish;

  useEffect(() => {
    if (!rest) return;
    const check = () => {
      const t = Date.now();
      setNow(t);
      if (t >= rest.endsAt) finish.current();
    };
    check();
    const id = setInterval(check, TICK_MS);
    // Ao voltar do segundo plano, confere na hora em vez de esperar o próximo tick.
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [rest]);

  return rest ? Math.max(0, rest.endsAt - now) : 0;
}
