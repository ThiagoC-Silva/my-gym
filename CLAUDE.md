# gym-fire — instruções do projeto

App mobile de **ficha de treino**: uma única tela, Expo + React Native + TypeScript,
tema escuro neumórfico com acentos em degradê. Sem backend, sem navegação, sem login.

## Fontes da verdade (em ordem de prioridade)

1. `design/tokens.json` — todos os valores numéricos e de cor. Importar/converter; **nunca digitar à mão**.
2. `design/COMPONENTS.md` — anatomia, estados e regras de cada componente.
3. `design/DESIGN.md` — conceito, layout, movimento e regras de comportamento.
4. `design/screens/*.png` — aparência esperada de cada estado (comparar visualmente após implementar).
5. `design/reference/Ficha de Treino - Referência.dc.html` — implementação de referência executável.
   Abrir no navegador para ver as animações reais; ler os estilos inline em caso de dúvida.
6. `promp-app.md` — **comportamento, modelo de dados e conteúdo da ficha**.

Conflito **visual** → vence o design (1–5). Conflito de **comportamento ou dados** → vence `promp-app.md`.

## Decisões travadas (10/11/2026 — não reabrir sem perguntar)

- **Ficha:** `promp-app.md §9` é a **única** fonte do conteúdo do treino, já conferida linha a
  linha contra a ficha oficial de 02/11/2026 em 10/11/2026 (Push 6 ex/20 séries, InfA 6/20, Pull 7/23, InfB 6/21, Upper 6/19; descanso 150 s
  compostos e 75 s isoladores; carga vazia). Os PNGs mostram uma ficha de mock diferente
  (5 ex/17 séries, 90 s, 80 kg) — é só ilustração; **não copiar dados dos PNGs**.
- **Usuário:** o Header mostra **Thiago / TH**. "Lucas"/"LM" nos PNGs é mock.
- **Sessões:** `push` · `infA` · `pull` · `infB` · `upper`, nas pastas `push/`, `inferiores-a/`,
  `pull/`, `inferiores-b/` e `upper/` (já criadas e com os nomes corretos).
- **Escopo do build:** tela completa, incluindo `EditSheet` e persistência local (AsyncStorage).
- **Reps:** número único (`reps: number` + `repsUnidade?`), não faixa. O card mostra `12`, não `10–12`.
- **Anel:** sempre `gradient.brand`. Não existe "cor de concluído" separada nos tokens; 100% apenas
  fecha o arco.
- **Aba inicial:** pelo dia da semana (`promp-app.md §5`), mesmo que os PNGs mostrem terça com Push.
- **Mídia (11/11/2026):** `resizeMode: contain`, centralizada sobre as listras, que continuam
  no fundo e aparecem nas laterais. `size.media` continua 136. A margem branca de cada asset
  é cortada na recodificação, não em runtime.

## Regras visuais invioláveis

- Fidelidade pixel a pixel aos PNGs. Não "melhorar", simplificar nem trocar por componentes
  padrão de bibliotecas de UI. Nenhuma lib de UI pronta.
- Nenhuma cor, sombra, raio, espaçamento ou fonte fora de `tokens.json`. Se faltar, **perguntar**.
- Cor só indica **estado** (ativo / concluído / em contagem). Superfícies são sempre neutras.
- Sombras neumórficas: **sempre as duas camadas** (escura embaixo-direita + realce claro
  em cima-esquerda). Nunca remover o realce.
- Borda do card concluído: 2 px em **degradê** (`gradient.brand`), não borda sólida.
- Abas de treino **não** mostram porcentagem.
- Hit-area mínima de 44 pt mesmo quando o visual é menor (esfera 38, check 32).
- Animações com as durações/curvas de `tokens.json > motion`; respeitar reduced-motion
  (`AccessibilityInfo.isReduceMotionEnabled` → fade 150 ms, sem pulso).
- Textos da interface em **pt-BR**, decimais com **vírgula** (`32,5 kg`).

## Restrições de React Native (como entregar o design)

| Efeito do design | Técnica |
|---|---|
| Sombra dupla neumórfica | `boxShadow` (RN ≥ 0.76, aceita múltiplas sombras como no CSS). Se indisponível, dois `View` aninhados — um por camada. |
| Sombra `inset` (afundado) | `boxShadow` com `inset`. Sem ele, `LinearGradient` interno simulando o degradê de profundidade. |
| Borda 2 px em degradê | `LinearGradient` externo com `padding: 2` + `borderRadius: 28` envolvendo um `View` com `surface.card` e `borderRadius: 26`. |
| Texto em degradê (timer) | `MaskedView` + `LinearGradient`. |
| Anel de progresso | `react-native-svg`: `r=36`, `strokeWidth=9`, `strokeLinecap="round"`, rotação −90°, `strokeDashoffset = 226.19 × (1 − p)`. |
| Listras 135° da mídia | `LinearGradient` com stops repetidos, ou SVG `<Pattern>`. |
| WebP animado da mídia | `expo-image` com `contentFit="contain"` sobre as listras e `useAppleWebpCodec={false}` (o codec da Apple pode tocar WebP animado na velocidade errada). |
| Degradê em ângulo CSS | `<LinearGradient {...gradientProps(gradient.brand, largura / altura)}>`: o ângulo CSS depende da proporção da caixa; omitir `aspect` só em elementos quadrados ou circulares. |
| "NOV'26" gravado | Texto `#1C1C1C` com `textShadowColor` claro deslocado. |

## Mapa de componentes

`Header` · `WorkoutTabs` / `WorkoutTab` · `SectionRow` · `ExerciseCard` · `ExerciseCheck` ·
`ExerciseMedia` · `StatGrid` / `StatItem` · `SetRow` / `SetSphere` · `ProgressRing` ·
`RestPanel` · `RestToast` · `SessionBanner` · `EditSheet` / `StepperRow` · `Neumorphic` (helpers).

Hooks: `useWorkout` (sessão ativa, progresso, overrides, persistência) ·
`useRestTimer` (timer único por timestamp) · `useReducedMotion`.

Estado: um único hook/contexto `useWorkout`. "Exercício concluído" é **derivado**
(`todas as séries === true`), nunca armazenado.

## Fluxo de trabalho

1. ~~Gerar `src/theme.ts` a partir de `design/tokens.json`.~~ Feito em 11/11/2026. O
   `theme.ts` **importa** o `tokens.json` e converte os valores na carga do módulo, sem gerar
   arquivo. Para mudar um valor, edite o JSON, nunca o `theme.ts`. Usar sempre `color.*`,
   `shadow.*`, `text.*`, `radius.*`, `space.*`, `size.*`, `motion.*` e `gradientProps(...)`.
   `src/App.tsx` é por ora uma prova de fumaça do tema, a ser substituída pela ficha.
2. Implementar componentes isolados e comparar com `design/screens/08-componentes.png`.
3. Montar a tela e validar cada estado contra `design/screens/01` a `06`.
4. Implementar movimento conforme `DESIGN.md §7` e comparar com
   `design/reference/Ficha de Treino - Referência.dc.html` aberto no navegador.

Trabalhar por partes (tema → componentes → tela → estados → animações) e pedir uma comparação
com o PNG correspondente ao final de cada etapa.

## Comandos

```bash
npx expo start          # Expo Go
npx tsc --noEmit        # checagem de tipos — precisa passar limpo
npx expo install <pkg>  # sempre usar este em vez de npm install: escolhe a versão do SDK
npx expo-doctor         # diagnóstico de dependências e configuração
```

Stack: Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript 6. O Node (LTS 26) foi
instalado via **nvm**. Em shell não interativo, carregar o nvm antes:
`export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"`.
O Expo muda APIs a cada SDK: conferir a documentação versionada
(`https://docs.expo.dev/versions/v58.0.0/`) antes de usar uma API de memória.

## Assets

`assets/exercises/<pasta-da-sessao>/<slug>.webp`, com `<slug>` = `Exercise.id`.
Hoje existem 8 de 31: os 7 de `pull/` e 1 de `upper/`. Todo exercício sem `.webp` renderiza o placeholder
com listras + ícone + nome do arquivo — isso é **estado de design previsto**, não bug.
Nunca inventar nem gerar os `.webp` que faltam.

**Todo `.webp` novo passa por `scripts/recode-media.py` antes de ser versionado:**

```bash
cp novo.webp ../gym-fire-assets-originais/<pasta-da-sessao>/<slug>.webp   # guardar o original
python3 scripts/recode-media.py ../gym-fire-assets-originais/<pasta>/<slug>.webp \
        assets/exercises/<pasta>/<slug>.webp
```

O script corta a margem branca com um único retângulo para todos os frames, cabe o resultado
em 966×408 px (3× a caixa de 322×136) e só grava se nº de frames, duração por frame, duração do
loop e ordem baterem com o original (sai com código 1 se não baterem). Requer `webp`
(`sudo apt install -y webp`) e Pillow. Sempre recodificar a partir do **original** em
`../gym-fire-assets-originais/` (fora do repo), nunca de um arquivo já recodificado.

Não usar Pillow para montar WebP animado: ele não lê a duração dos frames. Também não
confiar só no `img2webp`: em modo lossy, o encoder do libwebp junta frames quase idênticos
(foi assim que `remada-baixa` caía de 60 para 51 frames). O script detecta isso e remonta frame
a frame com `cwebp` + `webpmux`.
