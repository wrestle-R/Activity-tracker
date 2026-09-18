import { Tabs } from 'expo-router';
import { Dumbbell, Footprints, Home, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/constants/theme';
import { useSweatlineTheme } from '@/contexts/theme-context';

export default function AppTabs() {
  const { colors } = useSweatlineTheme(); const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.pulse, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 58 + insets.bottom, paddingTop: 7, paddingBottom: Math.max(7, insets.bottom) }, tabBarLabelStyle: { fontFamily: typography.bodyMedium, fontSize: 11 }, sceneStyle: { backgroundColor: colors.background } }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2} /> }} />
    <Tabs.Screen name="gym" options={{ title: 'Gym', tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} strokeWidth={2} /> }} />
    <Tabs.Screen name="run" options={{ title: 'Run', tabBarIcon: ({ color, size }) => <Footprints color={color} size={size} strokeWidth={2} /> }} />
    <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={2} /> }} />
  </Tabs>;
}
