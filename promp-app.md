# Ficha de Treino — Especificação funcional

> **Status:** validado em 10/11/2026 contra o pacote de design em `design/` e contra a ficha
> oficial de 5 dias de 02/11/2026 (documento externo, fora do repo).
> Esta é a fonte da verdade **de comportamento e de dados** — inclusive do conteúdo do treino. A aparência é decidida por
> `design/tokens.json` → `design/COMPONENTS.md` → `design/DESIGN.md` → `design/screens/*.png`.
> Em caso de conflito visual, o design vence. Em caso de conflito de comportamento ou de
> conteúdo da ficha, este documento vence.

---

## 1. Tarefa

Construir **uma única tela** mobile: a tela de execução da ficha de treino do dia.
Sem navegação, sem outras telas, sem login, sem backend.

Alvo: 390 × 844 pt (iPhone 14/15), Expo Go, tema escuro fixo.

---

## 2. Estado do projeto

| Item | Situação |
|---|---|
| Pacote de design (`design/`) | ✅ completo — tokens, componentes, 9 PNGs, HTML executável |
| Código | ❌ nada ainda (sem `package.json`, sem `src/`) |
| Assets `.webp` | 🟡 parcial — só `assets/exercises/pull/` (8 arquivos) |

Consequência: todo card renderiza o **placeholder da mídia** (listras + ícone + nome do arquivo),
exceto os 7 exercícios de Pull que já têm `.webp`.

---

## 3. Stack

- **Expo (React Native) + TypeScript**, rodando com `npx expo start` no Expo Go.
- Sem backend, sem login. Persistência local apenas (AsyncStorage).

Dependências previstas:

| Pacote | Para quê |
|---|---|
| `react-native-svg` | Anel de progresso (arco com `stroke-dashoffset`) |
| `expo-linear-gradient` | `gradient.brand` / `fill` / `bar`, borda do card concluído |
| `@react-native-masked-view/masked-view` | Texto do timer em degradê (`gradient.text`) |
| `expo-haptics` | Haptic ao marcar série e ao zerar o descanso |
| `@expo/vector-icons` | Ícones (imagem placeholder, cronômetro, check, lápis, ×) |
| `react-native-safe-area-context` | Notch e barra inferior |
| `@react-native-async-storage/async-storage` | Persistência do progresso e das edições |
| `expo-font` + `@expo-google-fonts/poppins` + `@expo-google-fonts/jetbrains-mono` | Poppins 400–800 e JetBrains Mono 500 |

Não adicionar bibliotecas de UI prontas. Nenhum componente visual de terceiros.

---

## 4. Estrutura da tela (de cima para baixo)

Detalhes de pixel em `design/COMPONENTS.md`. Aqui está só a ordem e o comportamento.

1. **Status bar** — fade para o fundo.
2. **`Header`** — avatar 52 com anel em degradê e iniciais · "Olá, Lucas" · data à direita
   (dia da semana + dia em display vermelho + `MÊS'AA` em efeito gravado).
3. **`WorkoutTabs`** — abas horizontais roláveis, sem scrollbar, **sem porcentagem**.
4. **Linha de seção** — "Exercícios" · divisor vermelho 3×22 · foco do treino ·
   contagem `exercícios concluídos / total` (ex.: `1/6`).
5. **Lista de cards** (`ExerciseCard`), scroll vertical, padding inferior **150**
   para o último card não ficar sob os flutuantes.
   Quando a sessão chega a 100%, o **`SessionBanner`** entra como primeiro item da lista.
6. **Flutuantes fixos** — `ProgressRing` (92, direita, bottom 30) e
   `RestPanel` (esquerda, bottom 34, até 120 da direita). Não rolam com a lista.
7. **Overlays** — `RestToast` no topo (top 54) e `EditSheet` inferior com scrim.

---

## 5. Sessões e abas

Cinco abas, nesta ordem:

| Aba | `id` | Foco | Pasta de assets |
|---|---|---|---|
| Push | `push` | Peito · Ombros · Tríceps | `assets/exercises/push/` |
| Inferiores A | `infA` | Quadríceps · Panturrilha · Abdômen | `assets/exercises/inferiores-a/` |
| Pull | `pull` | Costas · Ombro posterior · Bíceps | `assets/exercises/pull/` |
| Inferiores B | `infB` | Posterior · Glúteo · Panturrilha | `assets/exercises/inferiores-b/` |
| Upper | `upper` | Largura de costas · Ombros · Braços · Abdômen | `assets/exercises/upper/` |

- Só uma ativa por vez.
- **Aba inicial pelo dia da semana:** seg = Push · ter = Inferiores A · qua = Pull ·
  qui = Inferiores B · sex = Upper · sáb e dom = Push.
  (Os PNGs mostram "Terça-feira" com Push ativo — é licença do mock; a regra acima vale.)
- Trocar de aba **não apaga** o progresso das outras sessões.
- Trocar de aba fecha o `EditSheet` e **não** cancela o descanso em andamento.

---

## 6. Card de exercício

1. **Cabeçalho** — número `01` (800/13, `accent.red`) · nome (700/17) +
   grupo muscular (500/12, muted) · `ExerciseCheck` 32 à direita.
2. **`ExerciseMedia`** — altura **136** (`size.media`), raio 20, `shadow.sunkenLg`.
   Com `source`: WebP animado em loop, `resizeMode: cover`.
   Sem `source`: listras 135° (`#202020`/`#232323`, 10 px cada) + ícone de imagem 34 +
   nome do arquivo em JetBrains Mono 10 (ex.: `supino-reto.webp`).
3. **`StatGrid`** — 4 colunas iguais, gap 8: **Séries · Reps · Carga · Descanso**.
   Cada `StatItem` é um botão afundado com lápis laranja; tocar abre o `EditSheet`
   com aquele campo em foco.
   - Séries: número total.
   - Reps: número (ex.: `12`). Unidade opcional `/perna` quando `repsUnidade` existir.
   - Carga: valor em kg. `0` → `PC` sem unidade. `undefined` → `—` sem unidade.
   - Descanso: segundos com unidade `s` (ex.: `150 s`). **Durante a contagem** deste
     exercício, mostra `mm:ss` em `accent.red`.
4. **`SetRow`** — esferas numeradas 1..N à esquerda (wrap, gap 10) ·
   contagem `n/total` à direita (600/12, muted).

**Estado concluído:** borda 2 px em `gradient.brand` (padding-box/border-box, **não** borda sólida)
+ `shadow.glowCard`, fade 450 ms, e `ExerciseCheck` preenchido com check branco.
O status é **derivado** (`todas as séries === true`), nunca armazenado.

---

## 7. Regras de interação

### 7.1 Esfera de série (`SetSphere`, 38 px, hit-area 44)
- Tocar numa esfera **pendente**: marca a série, pop 400 ms + onda 600 ms,
  **haptic leve**, e **inicia o descanso** daquele exercício.
- Tocar numa esfera **concluída**: desfaz. Não inicia timer; se o timer **daquele exercício**
  estiver correndo, ele é cancelado.
- As séries podem ser marcadas em qualquer ordem.
- Se a série marcada for a **última pendente da sessão inteira**, não inicia o descanso —
  entra o `SessionBanner`.

### 7.2 `ExerciseCheck` (círculo do cabeçalho)
- Exercício incompleto → um toque marca **todas** as séries. **Não inicia timer.**
- Exercício concluído → um toque pede confirmação (`Alert`: "Desmarcar todas as séries?")
  e, se confirmado, volta todas para pendente e cancela o descanso daquele exercício.
- Sincronização: marcar a última esfera manualmente preenche o check;
  desmarcar qualquer esfera o esvazia.

### 7.3 Descanso (`RestPanel` → `RestToast`)
- Duração = `descansoSeg` do exercício (já com as edições do usuário aplicadas).
- **Só existe um timer ativo no app.** Iniciar outro substitui o anterior sem aviso.
- Tempo calculado por **timestamp** (`Date.now()` de término), nunca por contador de ticks,
  para não atrasar com re-renders nem com o app em segundo plano.
- O painel mostra: rótulo "DESCANSO" · `mm:ss` em `gradient.text` ·
  "Nome do exercício · série N" · botões `+15s` e `Pular` · barra inferior 3 px
  com largura = restante ÷ total.
- **`+15s`** estende o restante **e** o total (a barra não dá salto).
- **`Pular`** encerra na hora, sem aviso e sem haptic.
- **≤ 5 s**: o timer vira `accent.red` sólido e pulsa 800 ms em loop.
- **Ao zerar**: haptic de notificação, o painel sai, o `RestToast` desce do topo
  (450 ms) e some após 3,5 s. O `StatItem` Descanso volta ao valor padrão.
- Tocar no `StatItem` Descanso **não** pula o descanso — abre o `EditSheet`.
  Pular só pelo botão do painel.

### 7.4 Edição (`EditSheet`)
- Abre ao tocar em qualquer `StatItem`, com aquele campo em foco
  (fundo afundado, label em `accent.orange`).
- Quatro `StepperRow`, passos de `tokens.json > edit`:
  séries 1 (1–10) · reps 1 (1–50) · carga 2,5 kg (0–500; `0` = `PC`) · descanso 15 s (0–600).
- **"Restaurar"** volta o exercício ao padrão da ficha. **"Salvar alterações"** persiste.
- Toque no scrim fecha **sem salvar**.
- Reduzir o número de séries **preserva as marcadas até o novo limite**;
  aumentar acrescenta séries pendentes.
- Editar `descansoSeg` do exercício que está em descanso **não** altera a contagem em curso.

### 7.5 `SessionBanner`
- Entra como primeiro item da lista quando a sessão chega a 100%.
- Texto: "Treino concluído" · `Push · 6 exercícios · 20 séries`.
- Botão **"Reiniciar"** zera o progresso **só da sessão ativa** (não mexe nas edições).

---

## 8. Modelo de dados

```ts
export type SessionId = 'push' | 'infA' | 'pull' | 'infB' | 'upper';

export type Exercise = {
  id: string;            // slug estável, = nome do arquivo sem extensão
  nome: string;
  grupo: string;         // subtítulo do card, ex.: "Peitoral superior"
  series: number;
  reps: number;          // número único (topo da faixa original)
  repsUnidade?: string;  // ex.: "/perna"
  descansoSeg: number;
  carga?: number;        // kg. 0 = peso corporal ("PC"); undefined = "—"
  midia: string;         // "supino-reto.webp" — sempre exibido no placeholder
};

export type Session = {
  id: SessionId;
  nome: string;          // "Inferiores A"
  foco: string;          // "Quadríceps · Panturrilha · Abdômen"
  pasta: string;         // "inferiores-a"
  exercicios: Exercise[];
};

/** Séries concluídas por exercício, por sessão. */
export type Progress = Record<SessionId, Record<string, boolean[]>>;

/** Edições do usuário sobrepostas à ficha padrão. */
export type Overrides = Record<SessionId, Record<string, Partial<
  Pick<Exercise, 'series' | 'reps' | 'carga' | 'descansoSeg'>
>>>;

export type RestState = {
  sessionId: SessionId;
  exerciseId: string;
  setIndex: number;      // série que disparou (0-based)
  endsAt: number;        // Date.now() + duração
  totalMs: number;       // cresce com +15s
} | null;
```

Todo o estado vive num único hook/contexto **`useWorkout`**, com `useRestTimer` isolado
para a contagem. `Progress` e `Overrides` são persistidos; `RestState` não.

---

## 9. Ficha (`src/data/ficha.ts`)

Conteúdo conferido exercício a exercício contra a ficha oficial de 02/11/2026, em 10/11/2026:
séries, repetições e ordem batem nos 5 treinos (20 · 20 · 23 · 21 · 19 = 97 séries semanais).
A ficha oficial não vive no repo — o que o app precisa dela está todo aqui.

**Descanso:** compostos **150 s**, isoladores **75 s** — ponto médio das faixas prescritas na
ficha oficial ("2 a 3 minutos nos compostos e 60 a 90 segundos nos isoladores"). O usuário
ajusta de 15 em 15 s pelo `EditSheet`.

**Carga:** vazia (`undefined`) em todos. A ficha manda usar "as cargas que você já treina" e
começar leve nos exercícios novos, então não há valor inicial a semear.

**Reps:** topo da faixa original (anotada entre parênteses nas tabelas). Isso casa com a regra
de progressão da ficha — "a carga sobe quando você completa o teto de repetições em todas as
séries" —, mas o piso da faixa (o 8 de "8–10") não aparece na tela. Ver pendência 2.

**Nomes:** a coluna *Exercício* é o nome **exibido no card** — encurtado onde a ficha oficial
usa variantes entre parênteses, porque o card quebra em no máximo 2 linhas. O nome oficial
está anotado logo abaixo da tabela do treino.

### Push — Peito · Ombros · Tríceps — 6 exercícios · 20 séries
| # | Exercício | Grupo | Séries | Reps | Descanso | Mídia |
|---|---|---|---|---|---|---|
| 1 | Supino inclinado | Peitoral superior | 4 | 10 (8–10) | 150 | `supino-inclinado.webp` |
| 2 | Supino reto | Peitoral | 3 | 10 (8–10) | 150 | `supino-reto.webp` |
| 3 | Peck deck | Peitoral interno | 3 | 12 (10–12) | 75 | `peck-deck.webp` |
| 4 | Desenvolvimento | Ombros | 3 | 10 (8–10) | 150 | `desenvolvimento.webp` |
| 5 | Elevação lateral | Deltoide lateral | 4 | 15 (12–15) | 75 | `elevacao-lateral.webp` |
| 6 | Tríceps no cross over | Tríceps | 3 | 12 (10–12) | 75 | `triceps-cross-over.webp` |

### Inferiores A — Quadríceps · Panturrilha · Abdômen — 6 exercícios · 20 séries
| # | Exercício | Grupo | Séries | Reps | Descanso | Mídia |
|---|---|---|---|---|---|---|
| 1 | Leg press 45° | Quadríceps e glúteo | 4 | 12 (10–12) | 150 | `leg-press-45.webp` |
| 2 | Hack machine | Quadríceps | 3 | 12 (10–12) | 150 | `hack-machine.webp` |
| 3 | Extensora | Quadríceps | 3 | 15 (12–15) | 75 | `extensora.webp` |
| 4 | Afundo | Quadríceps e glúteo | 3 | 10 `/perna` | 150 | `afundo.webp` |
| 5 | Panturrilha em pé | Panturrilha | 4 | 15 (12–15) | 75 | `panturrilha-em-pe.webp` |
| 6 | Abdominal | Abdômen | 3 | 15 (12–15) | 75 | `abdominal.webp` |

### Pull — Costas · Ombro posterior · Bíceps — 7 exercícios · 23 séries
| # | Exercício | Grupo | Séries | Reps | Descanso | Mídia |
|---|---|---|---|---|---|---|
| 1 | Pulley frente | Dorsal | 4 | 10 (8–10) | 150 | `pulley-frente.webp` ✅ |
| 2 | Remada baixa | Costas (meio) | 4 | 10 (8–10) | 150 | `remada-baixa.webp` ✅ |
| 3 | Remada unilateral | Dorsal | 3 | 12 (10–12) | 150 | `remada-unilateral.webp` ✅ |
| 4 | Crucifixo inverso no fly | Deltoide posterior | 3 | 15 (12–15) | 75 | `crucifixo-inverso-fly.webp` ✅ |
| 5 | Face pull na polia | Deltoide posterior | 3 | 15 (12–15) | 75 | `face-pull-polia.webp` ✅ |
| 6 | Rosca direta | Bíceps | 3 | 10 (8–10) | 75 | `rosca-direta-barra.webp` ✅ |
| 7 | Rosca martelo | Braquial | 3 | 12 (10–12) | 75 | `rosca-martelo.webp` ✅ |

*Nome na ficha:* #3 = "Remada unilateral (máquina ou polia)".

### Inferiores B — Posterior · Glúteo · Panturrilha — 6 exercícios · 21 séries
| # | Exercício | Grupo | Séries | Reps | Descanso | Mídia |
|---|---|---|---|---|---|---|
| 1 | Flexora horizontal | Posterior de coxa | 4 | 12 (10–12) | 75 | `flexora-horizontal.webp` |
| 2 | Flexora sentada | Posterior de coxa | 3 | 12 (10–12) | 75 | `flexora-sentada.webp` |
| 3 | Elevação pélvica no aparelho | Glúteo | 4 | 12 (8–12) | 150 | `elevacao-pelvica.webp` |
| 4 | Agachamento sumô | Glúteo e adutores | 3 | 12 (10–12) | 150 | `agachamento-sumo.webp` |
| 5 | Abdução | Glúteo médio | 3 | 15 (12–15) | 75 | `abducao.webp` |
| 6 | Panturrilha sentada | Sóleo | 4 | 15 (12–15) | 75 | `panturrilha-sentada.webp` |

### Upper — Largura de costas · Ombros · Braços · Abdômen — 6 exercícios · 19 séries
| # | Exercício | Grupo | Séries | Reps | Descanso | Mídia |
|---|---|---|---|---|---|---|
| 1 | Pulley com pegada neutra | Dorsal | 3 | 12 (10–12) | 150 | `pulley-neutro.webp` |
| 2 | Supino inclinado com halteres | Peitoral superior | 3 | 12 (10–12) | 150 | `supino-inclinado-halteres.webp` |
| 3 | Elevação lateral | Deltoide lateral | 4 | 15 (12–15) | 75 | `elevacao-lateral.webp` |
| 4 | Tríceps francês no cross over | Tríceps | 3 | 12 (10–12) | 75 | `triceps-frances-cross-over.webp` |
| 5 | Rosca concentrada ou Scott | Bíceps | 3 | 12 (10–12) | 75 | `rosca-concentrada-banco.webp` ✅ |
| 6 | Abdominal | Abdômen | 3 | 15 (12–15) | 75 | `abdominal.webp` |

*Nome na ficha:* #1 = "Pulley com pegada neutra ou supinada" · #5 = "Rosca concentrada ou Scott".

✅ arquivo já existe

---

## 10. Organização do código

```
App.tsx
src/
  theme.ts                  gerado a partir de design/tokens.json
  data/ficha.ts
  data/media.ts             mapa slug → require() do .webp (só os existentes)
  hooks/useWorkout.ts       sessão ativa, progresso, overrides, persistência
  hooks/useRestTimer.ts     timer único por timestamp
  hooks/useReducedMotion.ts
  components/
    Header.tsx
    WorkoutTabs.tsx         + WorkoutTab
    SectionRow.tsx
    ExerciseCard.tsx
    ExerciseCheck.tsx
    ExerciseMedia.tsx
    StatGrid.tsx            + StatItem
    SetRow.tsx              + SetSphere
    ProgressRing.tsx
    RestPanel.tsx
    RestToast.tsx
    SessionBanner.tsx
    EditSheet.tsx           + StepperRow
    Neumorphic.tsx          helpers de relevo/afundado/borda em degradê
```

---

## 11. Movimento

Durações e curvas vêm de `tokens.json > motion`; a tabela completa está em `DESIGN.md §7`.
Usar `react-native-reanimated` só se o `Animated` nativo não der conta.
Respeitar `prefers-reduced-motion` (`AccessibilityInfo.isReduceMotionEnabled` + listener):
todas as animações viram fade de 150 ms e o pulso dos 5 s é removido.

---

## 12. Acessibilidade

- `accessibilityLabel` em: esfera ("Série 2 de 4, concluída"), `ExerciseCheck`
  ("Supino reto, 4 de 4 séries concluídas"), anel ("Progresso do treino: 35%, 6 de 17 séries"),
  abas, `+15s`, `Pular`, steppers.
- `accessibilityRole` correto (`button`, `tab`, `progressbar`, `checkbox`).
- Hit-area mínima **44 × 44** mesmo onde o visual é menor (esfera 38, check 32).
- Respeitar a safe area (notch e barra inferior).

---

## 13. Fora do escopo

Outras telas, navegação, login, sincronização, notificações em segundo plano,
cadastro/remoção de exercícios, reordenar exercícios, criação dos `.webp` que faltam.

**Histórico de cargas por semana** também fica de fora deste build, mas merece nota: a ficha
oficial é construída em torno dele (colunas *Sem. 1* a *Sem. 4* em cada treino, mais a regra
"suba a carga no menor incremento possível e anote na tabela do dia"). Hoje o `EditSheet`
guarda **um** valor de carga por exercício, sem dimensão de semana. É a próxima feature
natural, e o formato de `Overrides` já deve ser pensado para comportar essa chave depois.

---

## 14. Critérios de aceite

- [ ] As 5 abas trocam a lista, e o progresso de cada sessão é preservado ao alternar.
- [ ] A aba inicial corresponde ao dia da semana.
- [ ] Marcar uma esfera atualiza o anel na hora (500 ms, `cubic-bezier(.2,.8,.2,1)`) e abre o `RestPanel`.
- [ ] Iniciar um descanso em outro card substitui o anterior.
- [ ] O timer não atrasa ao voltar do segundo plano (timestamp, não ticks).
- [ ] `+15s` estende restante e total; `Pular` encerra sem aviso; ≤ 5 s pulsa em vermelho.
- [ ] Ao zerar: haptic, painel sai, `RestToast` desce e some em 3,5 s.
- [ ] O `ExerciseCheck` marca todas as séries; marcar todas as esferas preenche o check.
- [ ] Card concluído com borda 2 px em **degradê** (não sólida) + `shadow.glowCard`.
- [ ] 100% da sessão → `SessionBanner` no topo da lista; "Reiniciar" zera só a sessão ativa.
- [ ] `EditSheet` abre no campo tocado, respeita passos/limites e "Restaurar" volta ao padrão.
- [ ] Reduzir séries preserva as marcadas até o novo limite.
- [ ] Progresso e edições sobrevivem a fechar e reabrir o app.
- [ ] Nenhuma cor, sombra, raio ou fonte fora de `theme.ts` (gerado de `tokens.json`).
- [ ] Todas as sombras neumórficas têm as **duas** camadas (escura + realce claro).
- [ ] Reduced-motion ativo → fades de 150 ms, sem pulso.
- [ ] `npx tsc --noEmit` sem erros.
- [ ] Comparação visual feita contra `screens/01` a `06`.

---

## 15. Pendências abertas

1. **Assets faltando** — a ficha pede **31 arquivos** (29 slugs únicos; `elevacao-lateral.webp`
   e `abdominal.webp` aparecem em duas sessões e precisam de uma cópia em cada pasta).
   Existem **8, todos no caminho certo** (os 7 de Pull + `rosca-concentrada-banco.webp` no Upper).
   **Faltam 23**, distribuídos entre Push (6), Inferiores A (6), Inferiores B (6) e Upper (5).
   As 5 pastas de sessão já existem com os nomes corretos.
2. **Reps como faixa** — a ficha oficial prescreve faixas ("4 × 8–10"); o modelo guarda só o
   topo, para casar com o stepper do `EditSheet`. O topo é o número que importa para a
   progressão, mas o piso some da tela e ele é a meta mínima da série. Custo baixo de
   recuperar: um campo `repsMin?` só para exibição, com o card mostrando "8–10" e o stepper
   continuando a editar o topo. Decidir antes de implementar o `StatItem`.
3. **Header** — os PNGs trazem "Lucas"/"LM", que é nome de mock. O usuário real é **Thiago**
   (iniciais **TH**). Sem tela de perfil, fica constante em `src/data/usuario.ts`.
4. **`EditSheet` para reps `/perna`** — o stepper edita o número; o sufixo `/perna` é fixo
   da ficha e não editável.
5. **Aquecimento não modelado** — a ficha pede "5 minutos leves e 1 ou 2 séries leves do
   primeiro exercício do dia". As esferas contam só as séries valendo, então o primeiro
   exercício terá séries de aquecimento invisíveis no app. Combinado assim por ora.
6. **Ficha de 4 dias** — a ficha oficial cita uma alternativa de 4 dias para semanas de
   recuperação. O app assume uma única ficha; suportar duas exigiria um seletor acima das abas.
