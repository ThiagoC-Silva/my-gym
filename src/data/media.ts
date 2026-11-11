/**
 * Mapa `<pasta>/<slug>` → require() do .webp. Só os arquivos que existem:
 * o Metro precisa de require estático, e exercício sem entrada aqui mostra o
 * placeholder (estado de design previsto, não bug).
 * Todo .webp novo passa antes por `scripts/recode-media.py` (ver CLAUDE.md > Assets).
 */
const media: Record<string, number> = {
  'pull/pulley-frente': require('../../assets/exercises/pull/pulley-frente.webp'),
  'pull/remada-baixa': require('../../assets/exercises/pull/remada-baixa.webp'),
  'pull/remada-unilateral': require('../../assets/exercises/pull/remada-unilateral.webp'),
  'pull/crucifixo-inverso-fly': require('../../assets/exercises/pull/crucifixo-inverso-fly.webp'),
  'pull/face-pull-polia': require('../../assets/exercises/pull/face-pull-polia.webp'),
  'pull/rosca-direta-barra': require('../../assets/exercises/pull/rosca-direta-barra.webp'),
  'pull/rosca-martelo': require('../../assets/exercises/pull/rosca-martelo.webp'),
  'upper/rosca-concentrada-banco': require('../../assets/exercises/upper/rosca-concentrada-banco.webp'),
};

export function mediaFor(pasta: string, id: string): number | undefined {
  return media[`${pasta}/${id}`];
}
