import { useRouter } from 'expo-router';
import { ArrowRight, CloudOff, Dumbbell, Footprints } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandMark } from '@/components/brand-mark';
import { ScoreRing } from '@/components/score-ring';
import { Screen } from '@/components/screen';
import { AppButton, AppText, Card, Pill, SectionHeading, divider } from '@/components/ui/primitives';
import { spacing } from '@/constants/theme';
import { useActivities } from '@/contexts/activity-context';
import { useSweatlineTheme } from '@/contexts/theme-context';
import { formatPace } from '@/lib/fitness';

export default function HomeScreen() {
  const router = useRouter(); const { colors } = useSweatlineTheme(); const { activities, score, loading } = useActivities();
  const [now] = useState(() => Date.now());
  const week = activities.filter((item) => now - new Date(item.occurredAt).getTime() < 7 * 86400000);
  const gymCount = week.filter((item) => item.kind === 'workout').length;
  const runKm = week.filter((item) => item.kind === 'run').reduce((sum, item) => sum + Number(item.payload.distanceKm ?? 0), 0);
  const header = <View style={styles.header}><View style={styles.brand}><View style={[styles.mark, { backgroundColor: colors.pulse }]}><BrandMark size={30} inverse /></View><View><AppText variant="title">Sweatline</AppText><AppText variant="eyebrow" muted>{new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(now))}</AppText></View></View><Pill tone="pulse"><CloudOff size={12} color={colors.pulse} /> Local</Pill></View>;
  return <Screen header={header} refreshing={loading}>
    <Card style={[styles.scoreCard, { backgroundColor: colors.surface }]}><View style={styles.scoreTop}><View><AppText variant="eyebrow" style={{ color: colors.pulse }}>Sweat score</AppText><AppText variant="display">Your week{`\n`}has a pulse.</AppText></View>{__DEV__ && <Pill>Preview</Pill>}</View><View style={styles.scoreBody}><ScoreRing score={score} /><View style={styles.breakdown}>{[['Consistency', score.consistency, 40], ['Momentum', score.momentum, 30], ['Recency', score.recency, 30]].map(([label, value, max]) => <View key={String(label)} style={styles.scoreRow}><View style={styles.scoreLabel}><View style={[styles.tick, { backgroundColor: colors.pulse }]} /><AppText variant="label">{label}</AppText></View><AppText variant="label" muted>{value}/{max}</AppText></View>)}</View></View><AppText muted style={styles.explainer}>Built from sessions, four-week momentum, and how recently you moved.</AppText></Card>

    <View style={styles.actions}><AppButton label="Log workout" full icon={<Dumbbell size={19} color={colors.pulseText} />} onPress={() => router.navigate('/gym')} /><AppButton label="Log run" variant="secondary" full icon={<Footprints size={19} color={colors.text} />} onPress={() => router.navigate('/run')} /></View>

    <View style={styles.stats}><Card style={styles.stat}><AppText variant="eyebrow" muted>This week</AppText><AppText variant="metric">{gymCount}</AppText><AppText muted>gym sessions</AppText></Card><Card style={styles.stat}><AppText variant="eyebrow" muted>Distance</AppText><AppText variant="metric">{runKm.toFixed(1)}</AppText><AppText muted>kilometres</AppText></Card></View>

    <SectionHeading eyebrow="Latest" title="Recent line" />
    <Card style={styles.feed}>{activities.slice(0, 4).map((item, index) => <View key={item.id} style={[styles.feedRow, index < Math.min(activities.length, 4) - 1 && divider(colors)]}><View style={[styles.activityIcon, { backgroundColor: colors.elevated }]}>{item.kind === 'run' ? <Footprints size={20} color={colors.pulse} /> : <Dumbbell size={20} color={colors.pulse} />}</View><View style={styles.feedCopy}><AppText variant="label">{item.title}</AppText><AppText muted>{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(item.occurredAt))}</AppText></View><View style={styles.feedValue}><AppText variant="label">{item.kind === 'run' ? `${Number(item.payload.distanceKm).toFixed(2)} km` : `${Number(item.payload.volumeKg).toLocaleString()} kg`}</AppText>{item.kind === 'run' && <AppText muted>{formatPace(Number(item.payload.distanceKm), Number(item.payload.durationSeconds))}</AppText>}</View><ArrowRight size={17} color={colors.muted} /></View>)}</Card>
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, mark: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, scoreCard: { padding: spacing.lg }, scoreTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }, scoreBody: { alignItems: 'center', gap: spacing.md }, breakdown: { width: '100%', gap: 13 }, scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, scoreLabel: { flexDirection: 'row', alignItems: 'center', gap: 9 }, tick: { width: 9, height: 9 }, explainer: { fontSize: 14, lineHeight: 20 }, actions: { gap: spacing.sm }, stats: { flexDirection: 'row', gap: spacing.sm }, stat: { flex: 1 }, feed: { gap: 0, paddingVertical: 0 }, feedRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13 }, activityIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, feedCopy: { flex: 1 }, feedValue: { alignItems: 'flex-end' } });
