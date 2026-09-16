import { Check, CloudOff, RefreshCw, Settings as SettingsIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/screen';
import { AppButton, AppInput, AppText, Card, Pill, SectionHeading } from '@/components/ui/primitives';
import { radius, spacing, ThemePreference } from '@/constants/theme';
import { useActivities } from '@/contexts/activity-context';
import { useSweatlineTheme } from '@/contexts/theme-context';
import { getSupabase, isSupabaseConfigured, syncActivities } from '@/lib/supabase';

const themes: { value: ThemePreference; label: string }[] = [{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }];

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useSweatlineTheme(); const { activities } = useActivities();
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km'); const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [working, setWorking] = useState(false);
  const signIn = async () => { const client = getSupabase(); if (!client) return setMessage('Supabase client key is not configured. Offline logging still works.'); setWorking(true); const { error } = await client.auth.signInWithPassword({ email, password }); setMessage(error ? error.message : 'Signed in. Your local line is ready to sync.'); setWorking(false); };
  const sync = async () => { setWorking(true); try { await syncActivities(activities); setMessage('Everything is synced.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Sync could not finish.'); } finally { setWorking(false); } };
  return <Screen header={<View style={styles.header}><View><AppText variant="eyebrow" style={{ color: colors.pulse }}>Settings</AppText><AppText variant="display">Make it{`\n`}yours.</AppText></View><View style={[styles.icon, { backgroundColor: colors.pulse }]}><SettingsIcon size={26} color={colors.pulseText} /></View></View>}>
    <SectionHeading eyebrow="Appearance" title="Theme" /><View style={[styles.segment, { backgroundColor: colors.elevated }]}>{themes.map((theme) => { const active = preference === theme.value; return <Pressable key={theme.value} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setPreference(theme.value)} style={[styles.segmentButton, active && { backgroundColor: colors.pulse }]}><AppText variant="label" style={{ color: active ? colors.pulseText : colors.muted }}>{theme.label}</AppText></Pressable>; })}</View>
    <SectionHeading eyebrow="Training" title="Units" /><Card style={styles.unitCard}><ChoiceRow title="Run distance" description="Distance and pace display" options={['km', 'mi']} value={distanceUnit} onChange={(value) => setDistanceUnit(value as 'km' | 'mi')} /><View style={{ height: 1, backgroundColor: colors.border }} /><ChoiceRow title="Gym weight" description="Working-set load" options={['kg', 'lb']} value={weightUnit} onChange={(value) => setWeightUnit(value as 'kg' | 'lb')} /></Card>
    <SectionHeading eyebrow="Account" title="Supabase sync" action={<Pill tone={isSupabaseConfigured ? 'pulse' : 'neutral'}>{isSupabaseConfigured ? 'Ready' : 'Offline'}</Pill>} /><Card><View style={styles.syncStatus}>{isSupabaseConfigured ? <Check size={20} color={colors.pulse} /> : <CloudOff size={20} color={colors.muted} />}<View style={styles.syncCopy}><AppText variant="label">{isSupabaseConfigured ? 'Client configured' : 'Local mode is active'}</AppText><AppText muted>{isSupabaseConfigured ? 'Sign in to sync your private rows.' : 'Add the project public key to enable Auth and sync.'}</AppText></View></View>{isSupabaseConfigured && <><AppInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" textContentType="emailAddress" /><AppInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" textContentType="password" /><AppButton label="Sign in" variant="secondary" onPress={signIn} loading={working} full /></>}<AppButton label="Sync now" icon={<RefreshCw size={18} color={colors.pulseText} />} onPress={sync} loading={working} disabled={!isSupabaseConfigured} full />{message ? <AppText muted>{message}</AppText> : null}</Card>
    <Card><AppText variant="eyebrow" muted>About</AppText><AppText variant="title">Sweatline 1.0.0</AppText><AppText muted>Manual by design. Offline by default. Your Sweat Score explains every point.</AppText></Card>
  </Screen>;
}

function ChoiceRow({ title, description, options, value, onChange }: { title: string; description: string; options: string[]; value: string; onChange: (value: string) => void }) {
  const { colors } = useSweatlineTheme();
  return <View style={styles.choiceRow}><View style={styles.choiceCopy}><AppText variant="label">{title}</AppText><AppText muted>{description}</AppText></View><View style={styles.choices}>{options.map((option) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: value === option }} onPress={() => onChange(option)} style={[styles.choice, { borderColor: value === option ? colors.pulse : colors.border, backgroundColor: value === option ? colors.elevated : 'transparent' }]}><AppText variant="label" style={{ color: value === option ? colors.pulse : colors.muted }}>{option}</AppText></Pressable>)}</View></View>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }, icon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, segment: { padding: 4, borderRadius: radius.md, flexDirection: 'row', gap: 4 }, segmentButton: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, unitCard: { gap: 0 }, choiceRow: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12 }, choiceCopy: { flex: 1 }, choices: { flexDirection: 'row', gap: 6 }, choice: { minWidth: 52, minHeight: 44, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' }, syncStatus: { flexDirection: 'row', gap: 12, alignItems: 'center' }, syncCopy: { flex: 1 } });

