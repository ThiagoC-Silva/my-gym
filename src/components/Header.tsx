/** Cabeçalho — COMPONENTS.md > Header. Avatar com anel em degradê, saudação e data. */
import { StyleSheet, Text, View } from 'react-native';

import { usuario } from '../data/usuario';
import { headerDate } from '../state/schedule';
import { color, component, gradient, radius, shadow, size, space, text, textShadow } from '../theme';
import { Surface } from './Surface';

function Avatar() {
  const ring = component.header.ring;
  return (
    <Surface radius={radius.pill} fill={gradient.brand} style={{ width: size.avatar, height: size.avatar }}>
      <View
        style={{
          position: 'absolute',
          top: ring,
          left: ring,
          right: ring,
          bottom: ring,
          borderRadius: radius.pill,
          backgroundColor: color.surface.deep,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={[text.cardTitle, { color: color.text.primary, lineHeight: undefined }]}>{usuario.iniciais}</Text>
      </View>
    </Surface>
  );
}

/**
 * "NOV'26" gravado: texto #1C1C1C com sombra escura difusa embaixo e realce claro
 * em cima-esquerda. O RN aceita uma sombra por texto, então são duas camadas.
 */
function Engraved({ children }: { children: string }) {
  const base = [text.display2, { color: color.text.engraved }];
  return (
    <View>
      <Text style={[...base, textShadow(shadow.engravedDark[0])]}>{children}</Text>
      <Text style={[...base, StyleSheet.absoluteFill, textShadow(shadow.engravedLight[0])]}>{children}</Text>
    </View>
  );
}

export function Header({ date }: { date: Date }) {
  const d = headerDate(date);
  const h = component.header;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.screenX,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: h.gap }}>
        <Avatar />
        <View style={{ gap: h.nameGap }}>
          <Text style={[text.greeting, { color: color.text.mutedAlt }]}>Olá,</Text>
          <Text style={[text.cardTitle, { color: color.accent.orange }]}>{usuario.nome}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: h.dateGap }}>
        <Text style={[text.count, { color: color.text.disabled }]}>{d.weekday}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: h.dayGap }}>
          <Text style={[text.display, { color: color.accent.red }]}>{d.day}</Text>
          <Engraved>{d.monthYear}</Engraved>
        </View>
      </View>
    </View>
  );
}
