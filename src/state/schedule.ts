/** Regras puras de calendário e de sessão — promp-app.md §5. Sem React, testáveis. */
import type { SessionId } from '../types';

/** seg = Push · ter = Inferiores A · qua = Pull · qui = Inferiores B · sex = Upper · sáb/dom = Push. */
const byWeekday: Record<number, SessionId> = { 0: 'push', 1: 'push', 2: 'infA', 3: 'pull', 4: 'infB', 5: 'upper', 6: 'push' };

export function sessionForDate(d: Date): SessionId {
  return byWeekday[d.getDay()];
}

const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/** Partes da data do Header: "Quarta-feira", "11", "NOV'26". */
export function headerDate(d: Date): { weekday: string; day: string; monthYear: string } {
  return {
    weekday: weekdays[d.getDay()],
    day: String(d.getDate()),
    monthYear: `${months[d.getMonth()]}'${String(d.getFullYear()).slice(-2)}`,
  };
}
