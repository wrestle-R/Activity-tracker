import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, ThemePreference } from '@/constants/theme';

const STORAGE_KEY = 'sweatline.theme';

type ThemeValue = {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  colors: typeof palettes.light | typeof palettes.dark;
  setPreference: (value: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function SweatlineThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then((value) => { if (value === 'light' || value === 'dark' || value === 'system') setPreferenceState(value); }); }, []);
  const setPreference = (value: ThemePreference) => { setPreferenceState(value); void AsyncStorage.setItem(STORAGE_KEY, value); };
  const resolved = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
  const value = useMemo(() => ({ preference, resolved, colors: palettes[resolved], setPreference }), [preference, resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSweatlineTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useSweatlineTheme must be used inside SweatlineThemeProvider');
  return value;
}

