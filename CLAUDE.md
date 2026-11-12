# gym-fire — instruções do projeto

App mobile de **ficha de treino**: uma única tela, Expo + React Native + TypeScript,
tema escuro neumórfico com acentos em degradê. Sem backend, sem navegação, sem login.

## Fontes da verdade (em ordem de prioridade)

1. `design/tokens.json` — todos os valores numéricos e de cor. Importar/converter; **nunca digitar à mão**.
   O app depende dele em runtime (`src/theme.ts` o importa).
2. `design/DESIGN.md` e `design/COMPONENTS.md` — conceito, regras, anatomia e estados. Valem também
   para telas novas.
3. `src/components/` — referência visual de tudo que já existe: foram construídos e conferidos
   contra o design no aparelho. Tela nova reaproveita esses componentes em vez de recriá-los.
4. `design/screens/01`–`06` — a tela como deve ficar em cada estado (2 px/pt); usar para conferir
   regressões visuais.
5. `promp-app.md` — **comportamento, modelo de dados e conteúdo da ficha**.

Conflito **visual** → vence o design (1–4). Conflito de **comportamento ou dados** → vence `promp-app.md`.

As pranchas `07`–`09`, os recortes `design/blocks/` e o HTML de referência serviram para construir
o app e foram removidos em 11/11/2026 (o que valia virou token ou componente). Continuam no
histórico do git se for preciso consultar.

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
- **Altura de linha:** estilos sem `lineHeight` usam a altura "normal" do CSS da fonte
  (`font.lineHeightNormal`) e `includeFontPadding: false`; sem isso o Android desloca a tela ~10 pt.
- **Responsivo (11/11/2026):** o design vale para 390 pt; em outras larguras:
  - distâncias da base (anel, painel, folha, fim da lista) somam `insets.bottom − 34` quando a
    barra do sistema passa da do iPhone do design (Android com 3 botões);
  - rótulos e valores do dado e rótulos da folha usam `fitOneLine` (encolhem até
    `font.minFitScale` = 0,75); o valor do dado reserva o espaço do lápis;
  - fonte do sistema limitada a `font.maxScale` = 1,2 — usar sempre `src/components/Text`,
    nunca o `Text` do react-native;
  - testado no aparelho em 390, 360 e 320 pt (`adb shell wm density 500/542/610`) e com fonte
    1,3×; restaurar com `wm density reset` e `settings put system font_scale 1.0`.
- **"Restaurar" (EditSheet):** volta os steppers ao padrão da ficha; só persiste com "Salvar".
- **Leitor de tela (11/11/2026):** fora deste build. Sem `accessibility*` nas props (foram
  removidas). Hit-area 44, reduced-motion e limite de fonte continuam.
- **Voltar do Android (11/11/2026):** com o `EditSheet` aberto, fecha a folha sem salvar (mesma
  saída animada do scrim/×). Fora dela, o comportamento padrão (sair).
- **Notificação de fim de descanso com o app fechado:** fora do escopo (`promp-app.md §13`);
  o aviso só aparece com o app aberto.
- **Medidas de componente (11/11/2026):** valores que só existem em `COMPONENTS.md` (ou que
  existiam só no antigo HTML de referência) são **transcritos para `tokens.json`** (seção `component`, e sombras/fontes novas
  em `shadow`/`font`), nunca digitados no código. Medidas tiradas de PNG levam a origem em
  `component._fonte`. Header, `EditSheet` e `SessionBanner` transcritos/medidos em 11/11/2026 (`component._fonteTela`).
- **Mídia (11/11/2026):** `resizeMode: contain`, centralizada sobre as listras, que continuam
  no fundo e aparecem nas laterais. `size.media` continua 136. A margem branca de cada asset
  é cortada na recodificação, não em runtime.

## Regras visuais invioláveis

- Fidelidade pixel a pixel aos PNGs `01`–`06` e aos componentes já construídos. Não "melhorar", simplificar nem trocar por componentes
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
| Qualquer superfície com fundo + sombra | `<Surface radius fill shadow>` (`src/components/Surface.tsx`): sombras externas no View, fundo (cor ou degradê), sombras `inset` num overlay e só então o conteúdo, como no CSS. Não pôr `inset` direto num View cujo fundo seja um filho (o filho cobre a sombra). Não usar `overflow: hidden` no View que tem a sombra externa; recortar dentro de um filho `absoluteFill`. |
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
2. ~~Componentes isolados vs a prancha `08-componentes.png`~~ Feito e conferido no aparelho em 11/11/2026.
3. ~~Montar a tela e validar cada estado contra `design/screens/01` a `06`~~ Feito em
   11/11/2026: `src/screens/WorkoutScreen.tsx` + `src/state/useWorkout.tsx`. Posições do topo
   conferidas em pt contra `01-inicio.png` (desvio < 2 pt); estados 02–06 exercitados no
   aparelho (descanso, +15s, Pular, últimos 5 s, aviso, edição, persistência, banner, Reiniciar,
   alerta de desmarcar, troca de aba).
4. ~~Implementar movimento conforme `DESIGN.md §7`~~ Feito em 11/11/2026 com `Animated` nativo
   (`src/motion.ts`, `src/components/SlideIn.tsx`, `src/hooks/useReducedMotion.ts`), gravado no
   aparelho (`adb shell screenrecord`) e conferido quadro a quadro. Valores que faltavam no §7
   foram transcritos dos keyframes do HTML de referência para `tokens.json > motion` (ver `_fonte`).
   Regras: animação só no gatilho, nunca na montagem (abrir o app, trocar de aba); saídas =
   entrada invertida; fade de grupo com camadas sobrepostas precisa de
   `needsOffscreenAlphaCompositing` no Android (mas ele corta sombra externa); a troca de aba
   vai em `startTransition` para a pílula (driver JS) não travar enquanto os cards montam.

Telas ou estados novos: trabalhar por partes (componentes → tela → estados → animações),
reaproveitando `src/components/`, e pedir uma comparação com o design da tela nova ao final de
cada etapa. O projeto está concluído até aqui; commits vão direto na `main`.

## Verificação no aparelho (Android, adb)

O celular do usuário (Motorola Edge 60 Pro, 1220×2712 px, densidade 450 → 2,8125 px/pt, tela de
~434 pt) pode ser conectado por **depuração sem fio** (`adb pair` com o código que o usuário
passa; a conexão é descoberta por mDNS). Com o `npx expo start` do usuário rodando:
`adb shell am start -a android.intent.action.VIEW -d exp://<ip-do-pc>:8081` abre o projeto no
Expo Go; `adb exec-out screencap -p` captura; `adb shell input tap/swipe` interage.
- Medir em pt e comparar com os PNGs (2 px/pt, tela em x=50, y=84), não "no olho".
- Não ler nem comentar notificações ou outros apps; capturar só o app.
- Testes que mudam dados do app (edições, séries) devem ser **desfeitos** ao final.
- `am force-stop host.exp.exponent` costuma devolver para a tela anterior; reabrir com o
  `am start` e esperar o foco em `ExperienceActivity`.

## Comandos

```bash
npx expo start          # Expo Go
npx tsc --noEmit        # checagem de tipos — precisa passar limpo
npx expo install <pkg>  # sempre usar este em vez de npm install: escolhe a versão do SDK
npx expo-doctor         # diagnóstico de dependências e configuração
scripts/build-apk.sh --install   # APK de release assinado + instala por adb
```

**APK instalável (11/11/2026):** o app roda instalado, fora do Expo Go
(`com.thiagoc.gymfire`). O toolchain fica fora do repo, sem `sudo`: Node em `~/.nvm`, JDK 17 e
Android SDK em `~/.local/android-toolchain/`. A pasta `android/` é **gerada** pelo
`expo prebuild` a cada build e é gitignored — nunca editar nada dentro dela à mão; mudança
nativa vai em `app.json` ou no `scripts/build-apk.sh`, que reaplica a `signingConfig` de release
em cima do template do Expo. A chave de assinatura mora em `../gym-fire-release/` (fora do
repo): **não trocar nem perder** — chave diferente impede atualizar por cima e a reinstalação
apaga os treinos salvos. Atualização = subir `expo.android.versionCode` no `app.json`.

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
