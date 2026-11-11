/**
 * Vitrine provisória dos componentes, na ordem de `design/screens/08-componentes.png`.
 * Serve para comparar no aparelho, estado a estado. Usa dados reais da ficha (Pull),
 * não o mock dos PNGs. Será removida quando a tela da ficha estiver pronta.
 */
import { type ReactNode, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseCard } from '../components/ExerciseCard';
import { CheckVisual } from '../components/ExerciseCheck';
import { ProgressRing } from '../components/ProgressRing';
import { RestPanel } from '../components/RestPanel';
import { RestToast } from '../components/RestToast';
import { SphereVisual } from '../components/SetSphere';
import { StatVisual } from '../components/StatItem';
import { TabVisual } from '../components/WorkoutTab';
import { sessionById } from '../data/ficha';
import { mediaFor } from '../data/media';
import { color, size, space, text } from '../theme';

const pull = sessionById.pull;
const exercicio = (id: string) => pull.exercicios.find((e) => e.id === id)!;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: space.cardGap }}>
      <Text style={[text.section, { color: color.text.heading }]}>{title}</Text>
      {children}
    </View>
  );
}

function Labeled({ label, children, flex }: { label: string; children: ReactNode; flex?: boolean }) {
  return (
    <View style={{ alignItems: flex ? 'stretch' : 'center', gap: space.sphereGap, flex: flex ? 1 : undefined }}>
      {children}
      <Text style={[text.file, { color: color.text.muted }]}>{label}</Text>
    </View>
  );
}

const row = { flexDirection: 'row', flexWrap: 'wrap', gap: space.listGap, alignItems: 'flex-start' } as const;

function DemoCard({ id, number, initial, restMs }: { id: string; number: number; initial: boolean[]; restMs?: number }) {
  const [sets, setSets] = useState(initial);
  const ex = exercicio(id);
  return (
    <ExerciseCard
      number={number}
      exercise={ex}
      source={mediaFor(pull.pasta, ex.id)}
      sets={sets}
      restRemainingMs={restMs}
      onToggleSet={(i) => setSets((s) => s.map((v, j) => (j === i ? !v : v)))}
      onToggleAll={() => setSets((s) => s.map(() => !s.every(Boolean)))}
      onEdit={() => undefined}
    />
  );
}

export function ComponentShowcase() {
  const insets = useSafeAreaInsets();
  const total = pull.exercicios.reduce((n, e) => n + e.series, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.surface.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + space.listGap,
        paddingBottom: insets.bottom + space.listGap,
        paddingHorizontal: space.listX,
        gap: space.listGap,
      }}
    >
      <Section title="Aba de treino">
        <View style={row}>
          <Labeled label="inativa">
            <TabVisual label="Pull" state="inactive" />
          </Labeled>
          <Labeled label="hover">
            <TabVisual label="Pull" state="hover" />
          </Labeled>
          <Labeled label="ativa">
            <TabVisual label="Push" state="active" />
          </Labeled>
        </View>
      </Section>

      <Section title={`Esfera de série · ${size.sphere} px`}>
        <View style={row}>
          <Labeled label="pendente">
            <SphereVisual n={3} state="pending" />
          </Labeled>
          <Labeled label="hover">
            <SphereVisual n={3} state="hover" />
          </Labeled>
          <Labeled label="pressionada">
            <SphereVisual n={3} state="pressed" />
          </Labeled>
          <Labeled label="concluída">
            <SphereVisual n={3} state="done" />
          </Labeled>
        </View>
      </Section>

      <Section title={`Seleção do exercício · ${size.check} px`}>
        <View style={row}>
          <Labeled label="vazio">
            <CheckVisual state="idle" />
          </Labeled>
          <Labeled label="hover">
            <CheckVisual state="hover" />
          </Labeled>
          <Labeled label="concluído">
            <CheckVisual state="done" />
          </Labeled>
        </View>
      </Section>

      <Section title="Item de dado">
        <View style={{ flexDirection: 'row', gap: space.statGap }}>
          <Labeled label="unidade" flex>
            <StatVisual label="Carga" value="32,5" unit="kg" />
          </Labeled>
          <Labeled label="corporal" flex>
            <StatVisual label="Carga" value="PC" />
          </Labeled>
          <Labeled label="parado" flex>
            <StatVisual label="Descanso" value="150" unit="s" />
          </Labeled>
          <Labeled label="contando" flex>
            <StatVisual label="Descanso" value="00:48" counting />
          </Labeled>
        </View>
        <View style={{ flexDirection: 'row', gap: space.statGap }}>
          <Labeled label="pressionado" flex>
            <StatVisual label="Reps" value="10" pressed />
          </Labeled>
          <Labeled label="vazia" flex>
            <StatVisual label="Carga" value="—" />
          </Labeled>
          <Labeled label="/perna" flex>
            <StatVisual label="Reps" value="10" unit="/perna" />
          </Labeled>
          <View style={{ flex: 1 }} />
        </View>
      </Section>

      <Section title={`Anel de progresso · ${size.ring} px`}>
        <View style={row}>
          {[0, 8, 16, total].map((d) => (
            <Labeled key={d} label={d === 0 ? 'vazio' : d === total ? 'completo' : 'em andamento'}>
              <ProgressRing done={d} total={total} />
            </Labeled>
          ))}
        </View>
      </Section>

      <Section title="Painel de descanso">
        <View style={{ gap: space.listGap }}>
          <Labeled label="contando · barra = tempo restante">
            <View style={{ alignSelf: 'stretch' }}>
              <RestPanel remainingMs={48000} totalMs={150000} line="Remada baixa · série 2" onAdd15={() => undefined} onSkip={() => undefined} />
            </View>
          </Labeled>
          <Labeled label="últimos 5 s · vermelho (pulso na etapa de movimento)">
            <View style={{ alignSelf: 'stretch' }}>
              <RestPanel remainingMs={4000} totalMs={150000} line="Remada baixa · série 2" onAdd15={() => undefined} onSkip={() => undefined} />
            </View>
          </Labeled>
          <Labeled label="aviso no topo · 3,5 s">
            <View style={{ alignSelf: 'stretch' }}>
              <RestToast subtitle="Remada baixa · próxima série" />
            </View>
          </Labeled>
        </View>
      </Section>

      <Section title="Card de exercício">
        <View style={{ gap: space.listGap }}>
          <Labeled label="pendente · com mídia">
            <View style={{ alignSelf: 'stretch' }}>
              <DemoCard id="face-pull-polia" number={5} initial={[false, false, false]} />
            </View>
          </Labeled>
          <Labeled label="em andamento · descanso ativo">
            <View style={{ alignSelf: 'stretch' }}>
              <DemoCard id="remada-baixa" number={2} initial={[true, true, false, false]} restMs={48000} />
            </View>
          </Labeled>
          <Labeled label="concluído · borda degradê 2 px + brilho">
            <View style={{ alignSelf: 'stretch' }}>
              <DemoCard id="rosca-direta-barra" number={6} initial={[true, true, true]} />
            </View>
          </Labeled>
          <Labeled label="pendente · sem mídia (placeholder)">
            <View style={{ alignSelf: 'stretch' }}>
              <ExerciseCard
                number={1}
                exercise={sessionById.push.exercicios[0]}
                sets={[false, false, false, false]}
                onToggleSet={() => undefined}
                onToggleAll={() => undefined}
                onEdit={() => undefined}
              />
            </View>
          </Labeled>
        </View>
      </Section>
    </ScrollView>
  );
}
