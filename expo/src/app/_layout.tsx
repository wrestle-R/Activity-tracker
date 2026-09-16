import 'react-native-url-polyfill/auto';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, Barlow_700Bold, useFonts } from '@expo-google-fonts/barlow';
import { StatusBar } from 'expo-status-bar';
import { ActivityProvider } from '@/contexts/activity-context';
import { SweatlineThemeProvider, useSweatlineTheme } from '@/contexts/theme-context';
import AppTabs from '@/components/app-tabs';

function AppRoot() {
  const { resolved, colors } = useSweatlineTheme();
  const theme = resolved === 'dark' ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, border: colors.border, text: colors.text, primary: colors.pulse } } : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, border: colors.border, text: colors.text, primary: colors.pulse } };
  return <ThemeProvider value={theme}><StatusBar style={colors.statusBar} /><ActivityProvider><AppTabs /></ActivityProvider></ThemeProvider>;
}

export default function RootLayout() {
  const [loaded] = useFonts({ Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, Barlow_700Bold });
  if (!loaded) return null;
  return <SweatlineThemeProvider><AppRoot /></SweatlineThemeProvider>;
}
