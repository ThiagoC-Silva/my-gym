# Ficha de Treino — COMPONENTS.md

Anatomia, estados e regras de cada componente. Tokens referem-se a `tokens.json` / `DESIGN.md`. Imagem de referência: `screens/08-componentes.png`.

---

## WorkoutTab (aba de treino)
Pílula, padding 11 × 18, raio 999, Poppins 14.

| Estado | Fundo | Sombra | Texto |
|---|---|---|---|
| inativa | `surface.bg` | `shadow.raisedSm` | 600 `#7E7E7E` |
| hover | idem | idem | `#BDBDBD` |
| ativa | `surface.sunken` | `shadow.pressed` | 700 `accent.red` |

Regras: rolagem horizontal sem scrollbar; não exibe porcentagem; trocar de aba fecha a folha de edição.

---

## ExerciseCard
Fundo `surface.card`, raio 28, `shadow.raised`, padding 18, coluna com gap 14.

Ordem interna:
1. **Cabeçalho** — número `01` (800/13 `accent.red`) · nome (700/17) + grupo muscular (500/12 muted) · `ExerciseCheck` à direita.
2. **ExerciseMedia** — altura 136, raio 20, listras 135°, `shadow.sunkenLg`. Contém WebP animado em loop (`object-fit: contain`, centralizado, sobre as listras, que ficam sempre no fundo e aparecem nas laterais). Placeholder: ícone de imagem 34 + nome do arquivo. *(Era `cover`; trocado em 11/11/2026 porque `cover` cortava ~58% da altura dos assets quadrados, inclusive a cabeça e as mãos.)*
3. **StatGrid** — 4 colunas iguais, gap 8: Séries · Reps · Carga · Descanso.
4. **SetRow** — esferas à esquerda (wrap, gap 10) · contagem `n/total` à direita (600/12 muted).

| Estado | Diferença |
|---|---|
| pendente | padrão |
| em andamento | algumas esferas concluídas; se em descanso, o StatItem "Descanso" mostra `mm:ss` em `accent.red` |
| concluído | sobreposição com borda 2 px `gradient.brand` (técnica padding-box/border-box) + `shadow.glowCard`, fade 450 ms; `ExerciseCheck` concluído |

---

## ExerciseCheck (círculo de seleção) — 32 px
| Estado | Visual |
|---|---|
| vazio | fundo `#1F1F1F`, borda 2 `#444`, `inset 2 2 5 rgba(0,0,0,.6)` |
| hover | borda `accent.red` |
| concluído | `gradient.fill`, check branco 14 px traço 2.4, sombra `0 4 12 rgba(232,40,43,.4)`, pop 400 ms |

Toque: marca todas as séries ou desmarca todas.

---

## StatItem (dado editável)
Botão, fundo `surface.sunken`, raio 14, padding 10 / 8 / 9, `shadow.sunken`, alinhado à esquerda.
- Rótulo 600/9 uppercase `#727272`.
- Valor 700/17 `#ECECEC` + unidade 600/11 muted com 2 px de margem.
- **Lápis** 10 px, traço 2.4 `accent.orange`, canto inferior direito (bottom 11, right 9).

| Estado | Visual |
|---|---|
| padrão | como acima |
| hover/pressed | fundo `#1E1E1E` |
| contando (só Descanso) | valor `mm:ss` em `accent.red` |
| peso corporal (só Carga) | valor "PC", sem unidade |

Toque: abre `EditSheet` com este campo em foco.

---

## SetSphere (esfera de série) — 38 px (hit-area 44)
| Estado | Fundo | Sombra | Número |
|---|---|---|---|
| pendente | `linear-gradient(145deg,#303030,#262626)` | `shadow.sphere` | 700/14 `#6E6E6E` |
| hover | idem | idem | `accent.orange` |
| pressionada | `#262626` | `inset 3 3 7 rgba(0,0,0,.6)` · escala .94 | `accent.orange` |
| concluída | `gradient.fill` | `shadow.glow` | branco |

Ao concluir: pop 400 ms + onda 600 ms; dispara descanso.

---

## ProgressRing — 92 px, flutuante
Círculo `surface.raised`, `shadow.float`. SVG r = 36, traço 9, `stroke-linecap: round`, começa às 12h (rotação −90°).
- Trilho `#1B1B1B`; progresso `gradient.brand`; circunferência 226.19 → `dashoffset = 226.19 × (1 − p)`.
- Centro: % (800/19) + `d/t séries` (600/9 muted).
- Transição 500 ms `cubic-bezier(.2,.8,.2,1)`.

---

## RestPanel — flutuante
Altura 84, raio 26, `surface.panel`, `shadow.float`, posição left 16 / right 120 / bottom 34.
- Rótulo "DESCANSO" · timer `mm:ss` (800/28, `gradient.text`) · linha "Exercício · série N" (500/10 muted, ellipsis).
- Coluna de mini-botões: `+15s` (`#BDBDBD`) e `Pular` (`accent.red`), raio 10, padding 5 × 9, relevo pequeno.
- Barra inferior 3 px: trilho `#1A1A1A`, preenchimento `gradient.bar` com largura = restante ÷ total.

| Estado | Visual |
|---|---|
| contando | timer em degradê |
| ≤ 5 s | timer `accent.red` sólido pulsando 800 ms |
| fim | painel sai, `RestToast` entra |

---

## RestToast — aviso de fim
Top 54, left/right 16, raio 22, fundo `#1F1F1F`, `shadow.toast`, padding 12 × 14.
Ícone 36 em `gradient.fill` (cronômetro branco) · "Descanso finalizado" 700/14 · "Exercício · próxima série" 500/11 `#9A9A9A`. Desce 450 ms, some após 3,5 s.

---

## SessionBanner — treino concluído
Primeiro item da lista quando 100%. Raio 28, padding 18, `gradient.brand`, sombra `0 14 30 rgba(232,40,43,.3)`.
Círculo branco 44 com check vermelho · "Treino concluído" 700/17 branco · resumo 500/12 · botão "Reiniciar" (fundo `rgba(0,0,0,.22)`, raio 12).

---

## EditSheet — folha de edição
- Scrim `rgba(10,10,10,.6)`; toque fora fecha sem salvar.
- Folha: fundo `surface.bg`, raio 34 no topo, padding 10 / 20 / 34, gap 16; alça 40 × 5 `#444`.
- Cabeçalho: número · "EDITAR EXERCÍCIO" (600/10 uppercase) · nome (700/17) · botão fechar 32.
- **StepperRow** (×4): label 600/13 + dica 500/10 · botão − 44 (relevo neutro) · valor 800/24 + unidade (largura 74, centrado) · botão + 44 (`gradient.fill`).
  - Em foco: fundo `surface.sunken`, `shadow.pressed`, label `accent.orange`.
- Rodapé: "Restaurar" (secundário relevo, altura 52, raio 18) · "Salvar alterações" (flex 1, `gradient.brand`, 700/15 branco).

---

## Header
Avatar 52: anel 3 px `gradient.brand` + círculo `#1F1F1F` com iniciais 700/17. "Olá," 600/13 muted · nome 700/17 `accent.orange`. Data à direita: dia da semana 600/12 · "10" display vermelho + "NOV'26" gravado.
