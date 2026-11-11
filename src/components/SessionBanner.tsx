/** Banner de treino concluído — COMPONENTS.md > SessionBanner e promp-app.md §7.5. */
import { Pressable, View } from 'react-native';
import { Text } from './Text';

import { useMinHitSlop } from '../hooks/useMinHitSlop';
import { color, component, gradient, radius, shadow, space, text } from '../theme';
import { CheckIcon } from './icons';
import { Surface } from './Surface';

export function SessionBanner({ summary, onRestart }: { summary: string; onRestart: () => void }) {
  const b = component.banner;
  const [restartHit, onRestartLayout] = useMinHitSlop();
  return (
    <Surface
      radius={radius.card}
      fill={gradient.brand}
      shadow={shadow.banner}
      style={{ flexDirection: 'row', alignItems: 'center', padding: space.cardPad, gap: b.gap }}
      accessibilityRole="summary"
    >
      <View
        style={{
          width: b.circle,
          height: b.circle,
          borderRadius: radius.pill,
          backgroundColor: color.text.onAccent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckIcon size={b.check} color={color.accent.red} strokeWidth={component.check.iconStroke} />
      </View>
      <View style={{ flex: 1, gap: b.titleGap }}>
        <Text style={[text.cardTitle, { color: color.text.onAccent }]}>Treino concluído</Text>
        <Text style={[text.caption, { color: color.text.onAccent }]} numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <Pressable onPress={onRestart} hitSlop={restartHit} onLayout={onRestartLayout} accessibilityRole="button">
        <View
          style={{
            backgroundColor: color.restartFill,
            borderRadius: b.restartRadius,
            paddingVertical: b.restartPadY,
            paddingHorizontal: b.restartPadX,
          }}
        >
          <Text style={[text.toastTitle, { color: color.text.onAccent }]}>Reiniciar</Text>
        </View>
      </Pressable>
    </Surface>
  );
}
