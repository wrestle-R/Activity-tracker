import { Children, forwardRef, PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text, TextInput, TextInputProps, TextProps, View, ViewProps } from 'react-native';
import { Palette, radius, spacing, typography } from '@/constants/theme';
import { useSweatlineTheme } from '@/contexts/theme-context';

export function AppText({ variant = 'body', muted, style, ...props }: TextProps & { variant?: 'body' | 'label' | 'title' | 'display' | 'metric' | 'eyebrow'; muted?: boolean }) {
  const { colors } = useSweatlineTheme();
  const variants = { body: styles.body, label: styles.label, title: styles.title, display: styles.display, metric: styles.metric, eyebrow: styles.eyebrow };
  return <Text maxFontSizeMultiplier={1.35} {...props} style={[variants[variant], { color: muted ? colors.muted : colors.text }, style]} />;
}

export function Card({ style, children, ...props }: PropsWithChildren<ViewProps>) {
  const { colors } = useSweatlineTheme();
  return <View {...props} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function Pill({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'pulse' | 'warm' }>) {
  const { colors } = useSweatlineTheme();
  const color = tone === 'pulse' ? colors.pulse : tone === 'warm' ? colors.warm : colors.muted;
  return <View style={[styles.pill, { borderColor: color }]}>{Children.map(children, (child) => typeof child === 'string' || typeof child === 'number' ? <AppText variant="eyebrow" style={{ color }}>{child}</AppText> : child)}</View>;
}

type AppButtonProps = PressableProps & { label: string; icon?: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean; full?: boolean };
export function AppButton({ label, icon, variant = 'primary', loading, disabled, full, style, ...props }: AppButtonProps) {
  const { colors } = useSweatlineTheme();
  const buttonColors = variant === 'primary' ? { backgroundColor: colors.pulse, borderColor: colors.pulse } : variant === 'secondary' ? { backgroundColor: colors.elevated, borderColor: colors.border } : { backgroundColor: 'transparent', borderColor: 'transparent' };
  const textColor = variant === 'primary' ? colors.pulseText : colors.text;
  return <Pressable accessibilityRole="button" disabled={disabled || loading} {...props} style={(state) => [styles.button, buttonColors, full && styles.full, state.pressed && styles.pressed, (disabled || loading) && styles.disabled, typeof style === 'function' ? style(state) : style]}>{loading ? <ActivityIndicator color={textColor} /> : <>{icon}<AppText variant="label" style={{ color: textColor }}>{label}</AppText></>}</Pressable>;
}

export const AppInput = forwardRef<TextInput, TextInputProps>(function AppInput({ style, placeholderTextColor, ...props }, ref) {
  const { colors } = useSweatlineTheme();
  return <TextInput ref={ref} accessibilityRole="text" placeholderTextColor={placeholderTextColor ?? colors.muted} {...props} style={[styles.input, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.text }, style]} />;
});

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <View style={styles.headingRow}><View style={styles.headingCopy}>{eyebrow && <AppText variant="eyebrow" muted>{eyebrow}</AppText>}<AppText variant="title">{title}</AppText></View>{action}</View>;
}

export function divider(colors: Palette) { return { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }; }

const styles = StyleSheet.create({
  body: { fontFamily: typography.body, fontSize: 16, lineHeight: 24 }, label: { fontFamily: typography.bodyBold, fontSize: 15, lineHeight: 20 },
  title: { fontFamily: typography.display, fontSize: 26, lineHeight: 29, textTransform: 'uppercase', letterSpacing: -0.5 },
  display: { fontFamily: typography.display, fontSize: 42, lineHeight: 42, textTransform: 'uppercase', letterSpacing: -1.2 },
  metric: { fontFamily: typography.display, fontSize: 36, lineHeight: 38, letterSpacing: -0.6 }, eyebrow: { fontFamily: typography.bodyBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md }, pill: { minHeight: 28, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  button: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, full: { width: '100%' }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, disabled: { opacity: 0.45 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, fontFamily: typography.body, fontSize: 16 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md }, headingCopy: { flex: 1, gap: spacing.xs },
});
