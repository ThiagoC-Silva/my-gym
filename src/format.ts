/** Formatação pt-BR dos valores exibidos (decimais com vírgula). */
import { edit } from './theme';

/** 32.5 → "32,5"; 30 → "30". */
export function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
}

/** Carga: 0 → "PC" sem unidade; undefined → "—" sem unidade; senão valor + "kg". */
export function formatLoad(carga: number | undefined): { value: string; unit?: string } {
  if (carga === undefined) return { value: '—' };
  if (carga === 0) return { value: edit.load.zeroLabel };
  return { value: formatNumber(carga), unit: edit.load.unit };
}

/** Milissegundos restantes → "mm:ss", arredondando para cima (00:01 até zerar). */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
