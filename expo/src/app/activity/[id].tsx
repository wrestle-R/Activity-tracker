import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Dumbbell, Footprints } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/screen';
import { AppText, Card, Pill, SectionHeading, divider } from '@/components/ui/primitives';
import { radius, spacing } from '@/constants/theme';
import { useActivities } from '@/contexts/activity-context';
import { useSweatlineTheme } from '@/contexts/theme-context';
import { formatPace } from '@/lib/fitness';

type WorkoutEntry = { name: string; weight: number; reps: number; sets: number };
export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const { activities } = useActivities(); const { colors } = useSweatlineTheme();
  const activity = activities.find((item) => item.id === id);
  if (!activity) return <Screen header={<Pressable onPress={() => router.back()}><ArrowLeft color={colors.text} /></Pressable>}><Card><AppText variant="title">Activity not found</AppText><AppText muted>It may have been removed from this device.</AppText></Card></Screen>;
  const isRun = activity.kind === 'run'; const exercises = Array.isArray(activity.payload.exercises) ? activity.payload.exercises as WorkoutEntry[] : [];
  return <Screen header={<View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.elevated }]}><ArrowLeft size={21} color={colors.text} /></Pressable><View style={{ flex: 1 }}><AppText variant="eyebrow" style={{ color: colors.pulse }}>{isRun ? 'Run activity' : 'Gym activity'}</AppText><AppText variant="title">{activity.title}</AppText></View></View>}>
    <Card><View style={styles.summary}><View style={[styles.icon, { backgroundColor: colors.elevated }]}>{isRun ? <Footprints color={colors.pulse} /> : <Dumbbell color={colors.pulse} />}</View><View style={{ flex: 1 }}><AppText variant="label">{new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(activity.occurredAt))}</AppText><AppText muted>{isRun ? formatPace(Number(activity.payload.distanceKm), Number(activity.payload.durationSeconds)) : exercises.length + ' exercises completed'}</AppText></View><Pill tone="pulse">{isRun ? Number(activity.payload.distanceKm).toFixed(2) + ' km' : Number(activity.payload.volumeKg ?? 0).toLocaleString() + ' kg'}</Pill></View></Card>
    {isRun ? <><SectionHeading eyebrow="Run summary" title="The details" /><Card><Detail label="Distance" value={Number(activity.payload.distanceKm).toFixed(2) + ' km'} /><Detail label="Elapsed time" value={formatDuration(Number(activity.payload.durationSeconds))} /></Card></> : <><SectionHeading eyebrow={String(exercises.length) + ' exercises'} title="Working sets" /><Card style={styles.list}>{exercises.map((exercise, index) => <View key={String(index) + exercise.name} style={[styles.exercise, index < exercises.length - 1 && divider(colors)]}><View style={[styles.index, { backgroundColor: colors.elevated }]}><AppText variant="eyebrow" muted>{String(index + 1).padStart(2, '0')}</AppText></View><View style={{ flex: 1 }}><AppText variant="label">{exercise.name}</AppText><AppText muted>{exercise.sets} sets × {exercise.reps} reps</AppText></View><AppText variant="label">{exercise.weight} kg</AppText></View>)}</Card></>}
  </Screen>;
}
function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><AppText muted>{label}</AppText><AppText variant="label">{value}</AppText></View>; }
function formatDuration(total: number) { const hours = Math.floor(total / 3600); const minutes = Math.floor((total % 3600) / 60); const seconds = total % 60; return (hours ? hours + 'h ' : '') + minutes + 'm ' + seconds + 's'; }
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.xl }, back: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' }, summary: { flexDirection: 'row', alignItems: 'center', gap: 11 }, icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, list: { gap: 0, paddingVertical: 0 }, exercise: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12 }, index: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, detail: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 32, alignItems: 'center' } });
