import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/primitives';
import { useSweatlineTheme } from '@/contexts/theme-context';
import type { SweatScore } from '@/lib/fitness';

export function SweatLevelBar({ score }: { score: SweatScore }) {
  const { colors } = useSweatlineTheme();
  const width = `${Math.max(0, Math.min(100, score.total))}%` as `${number}%`;

  return <View accessible accessibilityRole="progressbar" accessibilityLabel={`Sweat Level ${score.total} out of 100. ${score.label}`} accessibilityValue={{ min: 0, max: 100, now: score.total, text: score.label }} style={styles.container}>
    <View style={styles.heading}>
      <View style={styles.labelGroup}><AppText variant="eyebrow" style={{ color: colors.pulse }}>Sweat level</AppText><AppText variant="display" style={styles.level}>{score.label}</AppText></View>
      <View style={styles.value}><AppText variant="metric" style={styles.score}>{score.total}</AppText><AppText variant="label" muted>/100</AppText></View>
    </View>
    <View style={[styles.track, { backgroundColor: colors.elevated }]}>
      <View style={[styles.fill, { width, backgroundColor: colors.pulse }]} />
      {[25, 50, 75].map((tick) => <View key={tick} style={[styles.tick, { left: `${tick}%`, backgroundColor: colors.background }]} />)}
    </View>
    <View style={styles.scale}><AppText style={styles.scaleText} muted>COOLING OFF</AppText><AppText style={styles.scaleText} muted>BUILDING</AppText><AppText style={styles.scaleText} muted>LOCKED IN</AppText></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 10 },
  heading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  labelGroup: { flex: 1 },
  level: { fontSize: 32, lineHeight: 36, textTransform: 'uppercase' },
  value: { flexDirection: 'row', alignItems: 'baseline' },
  score: { fontSize: 52, lineHeight: 54 },
  track: { height: 22, position: 'relative', overflow: 'hidden' },
  fill: { height: '100%' },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 1, opacity: 0.45 },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { fontSize: 9, letterSpacing: 0.8 },
});
