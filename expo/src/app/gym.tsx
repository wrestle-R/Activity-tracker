import { Check, ChevronDown, Dumbbell, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/screen';
import { AppButton, AppInput, AppText, Card, Pill, SectionHeading } from '@/components/ui/primitives';
import { radius, spacing } from '@/constants/theme';
import { useActivities } from '@/contexts/activity-context';
import { useSweatlineTheme } from '@/contexts/theme-context';
import { workoutTemplates } from '@/data/templates';

type Entry = { name: string; weight: string; reps: string; sets: string };

export default function GymScreen() {
  const { colors } = useSweatlineTheme(); const { addWorkout } = useActivities();
  const [templateIndex, setTemplateIndex] = useState(0); const template = workoutTemplates[templateIndex];
  const initialEntries = (index: number): Entry[] => workoutTemplates[index].exercises.map((item) => ({ name: item.name, weight: '', reps: item.targetReps.match(/\d+/)?.[0] ?? '8', sets: String(item.targetSets) }));
  const [entries, setEntries] = useState<Entry[]>(initialEntries(0)); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const volume = useMemo(() => entries.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.reps || 0) * Number(item.sets || 0), 0), [entries]);
  const chooseTemplate = (index: number) => { setTemplateIndex(index); setEntries(initialEntries(index)); setSaved(false); };
  const update = (index: number, field: keyof Entry, value: string) => setEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry));
  const save = async () => { setSaving(true); await addWorkout({ title: template.name, entries: entries.map((item) => ({ name: item.name, weight: Number(item.weight || 0), reps: Number(item.reps || 0), sets: Number(item.sets || 0) })) }); setSaving(false); setSaved(true); };

  return <Screen header={<View style={styles.header}><View><AppText variant="eyebrow" style={{ color: colors.pulse }}>Gym log</AppText><AppText variant="display">Choose{`\n`}the work.</AppText></View><View style={[styles.icon, { backgroundColor: colors.pulse }]}><Dumbbell size={26} color={colors.pulseText} /></View></View>}>
    <SectionHeading eyebrow="Your split" title="Templates" action={<Pill tone="pulse">6 ready</Pill>} />
    <View style={styles.templateGrid}>{workoutTemplates.map((item, index) => { const active = index === templateIndex; return <Pressable key={item.name} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => chooseTemplate(index)} style={({ pressed }) => [styles.template, { backgroundColor: active ? colors.pulse : colors.surface, borderColor: active ? colors.pulse : colors.border }, pressed && styles.pressed]}><View style={styles.templateTop}><AppText variant="eyebrow" style={{ color: active ? colors.pulseText : colors.muted }}>0{index + 1} · {item.category}</AppText>{active && <Check size={17} color={colors.pulseText} />}</View><AppText variant="title" style={{ color: active ? colors.pulseText : colors.text, fontSize: 21 }}>{item.name}</AppText><AppText muted={!active} style={{ color: active ? colors.pulseText : colors.muted, fontSize: 13 }}>{item.exercises.length} exercises</AppText></Pressable>; })}</View>

    <SectionHeading eyebrow="Today" title={template.name} action={<Pill>{volume.toLocaleString()} kg</Pill>} />
    <Card style={styles.sessionCard}>{entries.map((entry, index) => <View key={`${template.name}-${entry.name}`} style={[styles.exercise, index < entries.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}><View style={styles.exerciseTitle}><View style={[styles.number, { backgroundColor: colors.elevated }]}><AppText variant="eyebrow" muted>{String(index + 1).padStart(2, '0')}</AppText></View><View style={styles.exerciseCopy}><AppText variant="label">{entry.name}</AppText><AppText muted style={styles.target}>{template.exercises[index].targetSets} sets · target {template.exercises[index].targetReps}</AppText></View><ChevronDown size={17} color={colors.muted} /></View><View style={styles.fields}><View style={styles.field}><AppText variant="eyebrow" muted>Kg</AppText><AppInput value={entry.weight} onChangeText={(value) => update(index, 'weight', value)} keyboardType="decimal-pad" placeholder="0" accessibilityLabel={`${entry.name} weight in kilograms`} /></View><View style={styles.field}><AppText variant="eyebrow" muted>Reps</AppText><AppInput value={entry.reps} onChangeText={(value) => update(index, 'reps', value)} keyboardType="number-pad" accessibilityLabel={`${entry.name} repetitions`} /></View><View style={styles.field}><AppText variant="eyebrow" muted>Sets</AppText><AppInput value={entry.sets} onChangeText={(value) => update(index, 'sets', value)} keyboardType="number-pad" accessibilityLabel={`${entry.name} sets`} /></View></View></View>)}</Card>
    {saved && <Card style={[styles.success, { borderColor: colors.pulse }]}><Check size={20} color={colors.pulse} /><View style={styles.successCopy}><AppText variant="label">Session saved locally</AppText><AppText muted>It will sync when your connection and account are available.</AppText></View></Card>}
    <AppButton label="Save gym session" icon={<Plus size={19} color={colors.pulseText} />} loading={saving} onPress={save} full />
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }, icon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, template: { width: '48.7%', minHeight: 132, borderWidth: 1, borderRadius: radius.md, padding: 14, justifyContent: 'space-between' }, templateTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] }, sessionCard: { gap: 0 }, exercise: { gap: 13, paddingVertical: 16 }, exerciseTitle: { flexDirection: 'row', alignItems: 'center', gap: 11 }, number: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, exerciseCopy: { flex: 1 }, target: { fontSize: 13 }, fields: { flexDirection: 'row', gap: spacing.sm }, field: { flex: 1, gap: 6 }, success: { flexDirection: 'row', alignItems: 'center' }, successCopy: { flex: 1 } });

