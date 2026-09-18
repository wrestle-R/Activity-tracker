import { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/constants/theme';
import { useSweatlineTheme } from '@/contexts/theme-context';

export function Screen({ children, header, refreshing = false, onRefresh }: PropsWithChildren<{ header?: ReactNode; refreshing?: boolean; onRefresh?: () => void }>) {
  const { colors } = useSweatlineTheme(); const insets = useSafeAreaInsets();
  return <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: 58 + insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pulse} /> : undefined}>{header}<View style={styles.stack}>{children}</View></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, content: { paddingHorizontal: spacing.md, paddingTop: spacing.md }, stack: { gap: spacing.lg } });
