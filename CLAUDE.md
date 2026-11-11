# gym-fire — instruções do projeto

App mobile de **ficha de treino**: uma única tela, Expo + React Native + TypeScript,
tema escuro neumórfico com acentos em degradê. Sem backend, sem navegação, sem login.

## ⚠️ Primeira tarefa da próxima sessão — mídia dos exercícios

Dois problemas abertos nos `.webp`, levantados em 10/11/2026. Resolver **antes** de escrever
código de tela, porque os dois mudam o `ExerciseMedia`.

**1. Arquivos superdimensionados — e a primeira recodificação falhou, foi revertida.**
Os 8 `.webp` somam 9 MB para exibir num card de 322×136 pt, e são inconsistentes entre si:
de 356×329 a 1080×1080 px, de 12 a 131 frames. Uma tentativa de recodificar com **Pillow** foi
desfeita por dois defeitos:
  - perdeu **12 dos 60 frames** de `remada-baixa.webp`, sem erro nem aviso;
  - não preserva a duração por frame — o Pillow não lê `duration` de WebP animado
    (`im.info['duration']` vem vazio), então a velocidade de reprodução vira um palpite de 80 ms.
Refazer com `img2webp` / `anim_dump` do libwebp (`sudo apt install -y webp`) ou com ffmpeg.
**Validação obrigatória antes de commitar:** contagem de frames idêntica à do original **e**
duração total do loop idêntica, arquivo por arquivo.
Originais intactos em `../gym-fire-assets-originais/` (fora do repo, não versionado).

**2. A proporção da mídia não bate com os assets.**
`size.media` = 136 com largura útil 322 → caixa de **2,37:1** com recorte `cover`. Todas as
mídias são aproximadamente **quadradas**, então só a faixa central (~42% da altura) aparece, e
em vários exercícios ela corta justamente o que importa — no `face-pull-polia` aparecem pernas
e quadril, não ombro e rosto. Não é defeito de compressão: acontece igual com os originais.
Decisão de design pendente — aumentar a altura da mídia, reenquadrar cada asset no movimento,
ou usar `contain` deixando as listras aparecerem nas laterais.

Enquanto isso não se resolve, **não versionar novos `.webp`** nem decidir sobre Git LFS: o
volume final depende da recodificação.

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

1. Gerar `src/theme.ts` a partir de `design/tokens.json`.
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
```

## Assets

`assets/exercises/<pasta-da-sessao>/<slug>.webp`, com `<slug>` = `Exercise.id`.
Hoje existem 8 de 31: os 7 de `pull/` e 1 de `upper/`. Todo exercício sem `.webp` renderiza o placeholder
com listras + ícone + nome do arquivo — isso é **estado de design previsto**, não bug.
Nunca inventar nem gerar os `.webp` que faltam.
