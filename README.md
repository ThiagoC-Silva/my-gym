# gym-fire

App mobile de **ficha de treino**: uma tela única para executar o treino do dia — marcar séries,
acompanhar o progresso e controlar o descanso entre séries.

Estética **neumórfica escura** com acentos em degradê laranja → vermelho → magenta.
Alvo: 390 × 844 pt (iPhone 14/15), tema escuro fixo, pt-BR.

| ![Início](design/screens/01-inicio.png) | ![Descanso](design/screens/03-descanso.png) | ![Concluído](design/screens/05-concluido.png) |
|:--:|:--:|:--:|
| Início do treino | Descanso ativo | Treino concluído |

---

## Estado atual

> ✅ **Concluído.** A ficha completa roda no Expo Go, com animações, edição e persistência
> local. Faltam só mídias de exercícios (abaixo).

| Área | Situação |
|---|---|
| Design (tokens, regras, componentes, estados 01–06) | ✅ completo |
| Especificação funcional (`promp-app.md`) | ✅ validada em 10/11/2026 |
| Scaffold Expo (SDK 58) + `src/theme.ts` | ✅ 11/11/2026 |
| Componentes, tela, estado e persistência | ✅ 11/11/2026, conferidos no aparelho |
| Animações e reduced-motion | ✅ 11/11/2026, gravadas e conferidas no aparelho |
| Assets `.webp` dos exercícios | 🟡 14 de 31 (Pull e Inferiores B completos, 1 do Upper), recodificados (2,6 MB) |

---

## O que o app faz

- **5 sessões** em abas: Push, Inferiores A, Pull, Inferiores B, Upper.
  A aba inicial segue o dia da semana; o progresso de cada sessão é preservado ao alternar.
- **Card por exercício** com mídia animada (`.webp`), séries, repetições, carga e descanso.
- **Esferas de série** — tocar marca a série e dispara o descanso daquele exercício.
- **Anel de progresso flutuante** — séries feitas ÷ séries totais da sessão.
- **Painel de descanso** — contagem por timestamp, `+15s`, `Pular`, pulso nos últimos 5 s,
  e um aviso no topo quando zera.
- **Edição inline** — tocar em qualquer dado abre uma folha com steppers
  (séries, reps, carga de 2,5 em 2,5 kg, descanso de 15 em 15 s).
- **Treino concluído** — banner no topo da lista com resumo e botão "Reiniciar".
- Progresso e edições **persistidos localmente**.

---

## Stack

Expo SDK 58 (React Native 0.88) + TypeScript, rodando no Expo Go. Sem backend e sem login.
Node LTS instalado via nvm.

`expo-image` (WebP animado) · `react-native-svg` · `expo-linear-gradient` · `@react-native-masked-view/masked-view` ·
`expo-haptics` · `react-native-safe-area-context` ·
`@react-native-async-storage/async-storage` · `expo-font` + Poppins e JetBrains Mono

Sem bibliotecas de UI nem de ícones prontas — todos os componentes e ícones (SVG) são próprios,
para manter a fidelidade ao design neumórfico. Animações com o `Animated` nativo do React Native.

---

## Como rodar

```bash
npm install
npx expo start      # abra no Expo Go pelo QR code
npx tsc --noEmit    # checagem de tipos
```

---

## Instalar no celular (APK)

Para usar no dia a dia sem depender do Expo Go nem do PC ligado:

```bash
scripts/build-apk.sh --install    # compila o APK de release e instala por adb
scripts/build-apk.sh              # só compila, em dist/gym-fire.apk
scripts/build-apk.sh --clean      # regenera android/ do zero antes de compilar
```

O script cuida de tudo: `expo prebuild`, assinatura de release e `gradlew assembleRelease`.
A primeira compilação leva ~20 min (o Gradle baixa o distribuível, o AGP e o SDK alvo);
as seguintes são bem mais rápidas.

**Toolchain local** (fora do repo, instalado sem `sudo`, ~3 GB):

| Peça | Onde |
|---|---|
| Node LTS 26 | `~/.nvm` (nvm) |
| JDK 17 (Temurin) | `~/.local/android-toolchain/jdk-17.*` |
| Android SDK | `~/.local/android-toolchain/android-sdk` |

O script acha tudo sozinho; dá para apontar outro lugar com `GYMFIRE_TOOLCHAIN`.

**Chave de assinatura** — em `../gym-fire-release/` (fora do repo, modo 600):
`gym-fire.keystore` + `keystore.properties`. Faça backup dos dois. Se a chave se perder, o
Android recusa a atualização por cima e só resta desinstalar e reinstalar — **o que apaga os
treinos salvos no aparelho**. O `build-apk.sh` se recusa a compilar sem ela, justamente para
não gerar um APK assinado com a chave de depuração.

Para publicar uma atualização, suba o `versionCode` em `app.json` (`expo.android.versionCode`)
e rode o script de novo; o `adb install -r` instala por cima preservando os dados.

A pasta `android/` é gerada e fica fora do git: o script a recria a cada execução a partir do
`app.json`, então não há nada nativo para versionar ou manter à mão.

**Dados:** o app instalado tem armazenamento próprio — o que estiver salvo no Expo Go não migra.

---

## Estrutura do repositório

```
CLAUDE.md                 regras do projeto para o Claude Code
promp-app.md              especificação funcional: comportamento, dados, ficha, aceite
README.md                 este arquivo

design/                   fonte da verdade visual
  tokens.json             cores, sombras, raios, espaços, tipografia, motion (lido pelo app)
  DESIGN.md               conceito, layout, movimento, regras
  COMPONENTS.md           anatomia e estados de cada componente
  screens/                01–06 estados da tela (2 px/pt)

assets/exercises/<sessao>/<slug>.webp    mídias dos exercícios (recodificadas)
scripts/recode-media.py                  recodifica um .webp original para o card

index.ts                  ponto de entrada do Expo → src/App.tsx
src/
  App.tsx                 fontes, safe area, WorkoutProvider e a tela
  theme.ts                importa design/tokens.json e converte para RN
  motion.ts               helpers de animação (timing, pop, useRise)
  types.ts · format.ts    modelo de dados (promp-app §8) e formatação pt-BR
  data/                   ficha.ts (§9) · media.ts · usuario.ts
  state/                  useWorkout (contexto) · progress.ts e schedule.ts (regras puras)
  screens/WorkoutScreen.tsx
  hooks/                  useRestTimer · useMinHitSlop · useReducedMotion
  components/             Surface, SlideIn, Header, WorkoutTabs, ExerciseCard, ProgressRing, RestPanel, EditSheet, …
```

---

## Fontes da verdade

Nesta ordem: `design/tokens.json` → `design/DESIGN.md` e `design/COMPONENTS.md` →
`src/components/` (o que já existe) → `design/screens/01`–`06` → `promp-app.md`.

Conflito **visual** → vence o design. Conflito de **comportamento ou de dados** → vence
`promp-app.md`. Nenhum valor de cor, sombra, raio ou fonte é digitado à mão: tudo sai de
`tokens.json`.

As regras completas de implementação estão em [`CLAUDE.md`](CLAUDE.md).

---

## Roadmap

1. ~~Scaffold do Expo + `src/theme.ts` gerado de `tokens.json`.~~ ✅
2. ~~Componentes isolados, comparados com `design/screens/08-componentes.png`.~~ ✅
3. ~~Montagem da tela e validação dos estados `01`–`06`.~~ ✅
4. ~~Movimento conforme `DESIGN.md §7`, incluindo reduced-motion.~~ ✅
5. ~~Persistência local e `EditSheet`.~~ ✅
6. *(depois)* Histórico de cargas por semana, como nas colunas Sem. 1–4 da ficha.

---

## Pendências conhecidas

- Faltam 23 dos 31 arquivos `.webp` que a ficha pede — Push (6), Inferiores A (6),
  Inferiores B (6) e Upper (5). Exercícios sem mídia mostram o placeholder: é o estado de
  design previsto, não um bug.
- Os PNGs usam uma ficha de mock (5 exercícios, 17 séries, descanso de 90 s) diferente da
  ficha real em `promp-app.md §9`. Os PNGs valem como referência **visual**, não de conteúdo.
- Nome e iniciais do usuário ficam constantes (**Thiago / TH**) — não há tela de perfil.
  "Lucas" / "LM" nos PNGs é nome de mock.
- A ficha original registra cargas por semana (4 semanas por bloco). O app guarda só o valor
  atual; o histórico semanal é a próxima feature.

---

## Fora do escopo

Outras telas, navegação, histórico de cargas por semana, login, sincronização, notificações
em segundo plano, cadastro ou reordenação de exercícios.
