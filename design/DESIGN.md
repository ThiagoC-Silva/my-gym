# Ficha de Treino — DESIGN.md

Fonte da verdade visual do app. Valores exatos; não arredondar nem substituir por tokens genéricos de framework.
Arquivos complementares: `COMPONENTS.md` (anatomia e estados), `tokens.json` (valores para código), `screens/` (PNGs dos estados da tela).

## 1. Conceito

- Tela única mobile (390 × 844 pt, iPhone 14/15) para executar a ficha de treino do dia.
- Estética **neumórfica escura + neon quente**: superfícies grafite com relevo/afundamento suave e acentos em degradê laranja → vermelho → magenta.
- Cor só comunica **estado** (ativo, concluído, em contagem). Superfícies neutras nunca recebem cor.
- Hierarquia: abas de treino → lista de cards de exercício → elementos flutuantes (anel de progresso, painel de descanso).

## 2. Cores

### Acentos
| Token | Hex | Uso |
|---|---|---|
| `accent.orange` | `#F7931E` | Nome do usuário, lápis de edição, hover de esfera, label do campo em foco, início do degradê |
| `accent.red` | `#E8282B` | Aba ativa, números de exercício, timer de descanso, divisor da seção, botão "Pular" |
| `accent.magenta` | `#9B2A6E` | Apenas final de degradê |

### Degradês
| Token | Valor | Uso |
|---|---|---|
| `gradient.brand` | `linear-gradient(135deg, #F7931E, #E8282B 55%, #9B2A6E)` | Borda de card concluído, avatar, anel, banner de treino concluído, botão Salvar |
| `gradient.fill` | `linear-gradient(145deg, #F7931E, #E8282B)` | Esfera concluída, check do exercício, botão +, ícone do aviso |
| `gradient.text` | `linear-gradient(90deg, #F7931E, #E8282B)` | Texto do timer (background-clip: text) |
| `gradient.bar` | `linear-gradient(90deg, #F7931E, #E8282B, #9B2A6E)` | Barra de tempo restante |

### Superfícies (do mais claro ao mais escuro)
| Token | Hex | Uso |
|---|---|---|
| `surface.frame` | `#3A3A3A` | Moldura do aparelho (só mockup) |
| `surface.bg` | `#2B2B2B` | Fundo da tela, abas inativas, folha de edição, botões secundários |
| `surface.raised` | `#262626` | Anel de progresso |
| `surface.card` | `#252525` | Card de exercício |
| `surface.panel` | `#232323` | Painel de descanso |
| `surface.sunken` | `#222222` | Itens de dado, aba ativa, linha em foco na folha |
| `surface.sunkenHover` | `#1E1E1E` | Hover de item de dado |
| `surface.deep` | `#1F1F1F` | Seleção vazia, avatar interno, aviso (toast) |
| `surface.track` | `#1B1B1B` | Trilho do anel, trilho da barra (`#1A1A1A`) |
| `media.stripe` | `#202020` / `#232323` | Listras 135° do placeholder da mídia (10 px cada) |

### Texto
| Token | Hex | Uso |
|---|---|---|
| `text.primary` | `#ECECEC` | Títulos, valores |
| `text.heading` | `#D6D6D6` | Título "Exercícios" |
| `text.secondary` | `#BDBDBD` | Hover de aba, labels da folha, +15s |
| `text.muted` | `#7A7A7A` / `#7E7E7E` | Grupo muscular, contagens, unidades, abas inativas |
| `text.label` | `#727272` | Rótulos caixa-alta dos dados |
| `text.disabled` | `#6E6E6E` | Número da esfera pendente, dicas |
| `text.placeholder` | `#5F5F5F` | Ícone e nome do arquivo da mídia |
| `border.idle` | `#444444` | Borda do círculo de seleção vazio, alça da folha |

Texto sobre degradê é sempre `#FFFFFF`.

## 3. Tipografia

- Família: **Poppins** (400, 500, 600, 700, 800). Monoespaçada auxiliar: **JetBrains Mono 500** (somente nome de arquivo da mídia).
- Números sempre em Poppins 700/800; decimais com vírgula (`32,5`).

| Estilo | Peso / tamanho / altura | Uso |
|---|---|---|
| Display | 800 / 32 · letter-spacing −0.02em | Dia "10" |
| Display 2 | 800 / 26 · −0.02em, cor `#1C1C1C` com text-shadow | "NOV'26" (efeito gravado) |
| Timer | 800 / 28 / 1.1 · −0.01em | Painel de descanso |
| Valor da folha | 800 / 24 | Valores editáveis |
| Seção | 700 / 19 | "Exercícios" |
| Anel | 800 / 19 · −0.02em | Porcentagem |
| Título card | 700 / 17 / 1.25 | Nome do exercício, nome do usuário |
| Valor de dado | 700 / 17 / 1.1 | Séries, reps, carga, descanso |
| Aba | 600 inativa · 700 ativa / 14 | Abas |
| Corpo | 500 / 13 | Foco do treino, labels da folha |
| Apoio | 500–600 / 12 | Grupo muscular, contagens, dia da semana |
| Unidade | 600 / 11 | kg, s |
| Rótulo | 600 / 9 · uppercase · letter-spacing 0.08–0.1em | SÉRIES, REPS, CARGA, DESCANSO |
| Arquivo | JetBrains Mono 500 / 10 | `supino-reto.webp` |

## 4. Elevação (sombras neumórficas)

Luz vem do canto superior esquerdo. Sombra escura para baixo-direita, realce claro para cima-esquerda.

| Token | Valor | Uso |
|---|---|---|
| `shadow.raised` | `8px 8px 18px rgba(0,0,0,.45), -5px -5px 14px rgba(255,255,255,.03)` | Card |
| `shadow.raisedSm` | `5px 5px 12px rgba(0,0,0,.40), -3px -3px 10px rgba(255,255,255,.035)` | Aba inativa |
| `shadow.sphere` | `5px 5px 10px rgba(0,0,0,.45), -3px -3px 8px rgba(255,255,255,.04)` | Esfera pendente, botão − |
| `shadow.float` | `10px 10px 24px rgba(0,0,0,.60), -4px -4px 12px rgba(255,255,255,.05)` | Anel, painel de descanso |
| `shadow.sunken` | `inset 2px 2px 6px rgba(0,0,0,.50), inset -1px -1px 4px rgba(255,255,255,.03)` | Item de dado |
| `shadow.sunkenLg` | `inset 3px 3px 9px rgba(0,0,0,.55), inset -2px -2px 6px rgba(255,255,255,.03)` | Mídia |
| `shadow.pressed` | `inset 3px 3px 8px rgba(0,0,0,.55), inset -2px -2px 6px rgba(255,255,255,.04)` | Aba ativa, linha em foco |
| `shadow.glow` | `0 5px 14px rgba(232,40,43,.38), inset 0 1px 0 rgba(255,255,255,.25)` | Esfera concluída, botão + |
| `shadow.glowCard` | `0 0 0 1px rgba(232,40,43,.08), 0 10px 30px rgba(232,40,43,.18)` | Card concluído |
| `shadow.toast` | `0 14px 30px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.05)` | Aviso |

Regra: **relevo = tocável e inativo; afundado = selecionado ou campo de dado; brilho vermelho = concluído.**

## 5. Raios e espaçamento

- Raios: card 28 · painel 26 · aviso 22 · mídia 20 · linha da folha 20 · botões da folha 18 · dado 14 · mini-botões 10 · folha 34 (topo) · pílula/esfera/anel 999.
- Margem lateral da tela 20 (cabeçalho, abas) / 16 (lista e flutuantes).
- Padding do card 18; gap interno do card 14; gap entre cards 18.
- Gap entre esferas 10; gap da grade de dados 8; gap entre abas 10.
- Alvos de toque: esfera 38 (área mínima recomendada 44 — expandir hit-area no código), seleção 32 (hit-area 44), botões −/+ 44.

## 6. Layout da tela

1. Status bar (50) com fade para o fundo.
2. Cabeçalho: avatar 52 com anel em degradê + "Olá, Lucas" · data à direita.
3. Abas horizontais roláveis (sem scrollbar). **Sem porcentagem nas abas.**
4. Linha de seção: "Exercícios" · divisor vermelho 3×22 · foco do treino · contagem `x/5`.
5. Lista de cards (padding inferior 150 para não ficar sob os flutuantes).
6. Flutuantes fixos: anel 92 (direita, bottom 30) e painel de descanso (esquerda, bottom 34, até 120 da direita).
7. Overlays: aviso no topo (top 54), folha de edição inferior com scrim `rgba(10,10,10,.6)`.

## 7. Movimento

| Animação | Gatilho | Duração / curva |
|---|---|---|
| Pop da esfera | Série marcada | 400 ms · `cubic-bezier(.34,1.56,.64,1)` · escala .6 → 1.15 → 1 |
| Onda da esfera | Série marcada | 600 ms · ease-out · anel 2 px escala 1 → 1.9, opacidade .7 → 0 |
| Check do exercício | Seleção ou última série | 400 ms · mesma curva spring |
| Borda do card | Exercício concluído | 450 ms · fade ease-out |
| Anel de progresso | Qualquer série | 500 ms · `cubic-bezier(.2,.8,.2,1)` em `stroke-dashoffset` |
| Painel de descanso | Série marcada (auto) | Entrada 450 ms subindo · barra linear pela duração |
| Pulso final | Restante ≤ 5 s | 800 ms ease-in-out infinito, opacidade 1 ↔ .35, texto vira `#E8282B` sólido |
| Aviso de fim | Timer chega a 0 | Entrada 450 ms descendo · permanece 3,5 s · sugerido haptic leve |
| Banner concluído | 100% das séries | 500 ms subindo · check com pop atrasado 150 ms |
| Folha de edição | Toque em dado | Scrim fade 250 ms · folha sobe 400 ms `cubic-bezier(.2,.8,.2,1)` |
| Troca de aba (proposta) | Toque na aba | Pílula afundada desliza 300 ms · lista fade 200 ms |

Respeitar `prefers-reduced-motion`: trocar todas por fade de 150 ms e remover pulso.

## 8. Regras de comportamento

- Tocar numa esfera alterna a série. Ao marcar: inicia o descanso do exercício (se `autoRest`).
- Tocar na seleção do card marca/desmarca todas as séries. Desmarcar cancela o descanso daquele exercício.
- Exercício concluído ⇔ todas as séries marcadas → borda degradê + check.
- Anel = séries feitas ÷ séries totais do treino ativo.
- Descanso: `+15s` estende tempo e duração total; `Pular` encerra sem aviso. Ao zerar: some o painel e aparece o aviso.
- Edição: tocar em qualquer dado abre a folha com aquele campo em foco. Passos: séries 1 (1–10), reps 1 (1–50), carga 2,5 kg (0–500; 0 = "PC"), descanso 15 s (0–600). "Restaurar" volta ao padrão da ficha; "Salvar" persiste.
- Alterar o número de séries preserva as marcadas até o novo limite.
- Estado persistido localmente por treino: séries marcadas e edições.

## 9. Inventário de telas (`screens/`)

| Arquivo | Estado |
|---|---|
| `01-inicio.png` | Nenhuma série feita |
| `02-andamento.png` | Exercício 1 concluído, exercício 2 em 2/3 |
| `03-descanso.png` | Painel de descanso ativo |
| `04-aviso.png` | Aviso "Descanso finalizado" |
| `05-concluido.png` | Treino 100% com banner |
| `06-edicao.png` | Folha de edição com Carga em foco |
