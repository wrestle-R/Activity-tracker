import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '@/components/ui/primitives';
import { useSweatlineTheme } from '@/contexts/theme-context';
import type { SweatScore } from '@/lib/fitness';

export function ScoreRing({ score, size = 210 }: { score: SweatScore; size?: number }) {
  const { colors } = useSweatlineTheme();
  const radius = 76; const circumference = 2 * Math.PI * radius;
  return <View accessible accessibilityRole="summary" accessibilityLabel={`Sweat Score ${score.total} out of 100. ${score.label}`} style={{ width: size, height: size }}><Svg width={size} height={size} viewBox="0 0 190 190" style={styles.svg}><Circle cx="95" cy="95" r={radius} stroke={colors.elevated} strokeWidth={11} fill="none" /><Circle cx="95" cy="95" r={radius} stroke={colors.pulse} strokeWidth={11} fill="none" strokeLinecap="square" strokeDasharray={[circumference * score.total / 100, circumference]} rotation={-90} origin="95,95" /></Svg><View style={styles.copy}><AppText variant="metric" style={styles.score}>{score.total}</AppText><AppText variant="eyebrow" muted>{score.label}</AppText></View></View>;
}
const styles = StyleSheet.create({ svg: { position: 'absolute' }, copy: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', gap: 4 }, score: { fontSize: 58, lineHeight: 60 } });
