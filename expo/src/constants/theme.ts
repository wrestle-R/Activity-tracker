import { Platform } from 'react-native';

export const palettes = {
  light: {
    background: '#F3F1E8', surface: '#FFFEF8', elevated: '#E9E7DC', text: '#1A1C18', muted: '#62675C', border: '#D5D4C9', pulse: '#9DCA32', pulseText: '#182000', warm: '#A77D4F', danger: '#B83A34', statusBar: 'dark' as const,
  },
  dark: {
    background: '#11130F', surface: '#1B1E18', elevated: '#242820', text: '#F1F3E8', muted: '#A8AE9B', border: '#34392E', pulse: '#C7F85A', pulseText: '#172000', warm: '#D6B486', danger: '#F17B72', statusBar: 'light' as const,
  },
} as const;

export type Palette = (typeof palettes)[keyof typeof palettes];
export type ThemePreference = 'light' | 'dark' | 'system';

export const typography = {
  display: 'Barlow_700Bold', displayMedium: 'Barlow_600SemiBold', body: 'Barlow_400Regular', bodyMedium: 'Barlow_500Medium', bodyBold: 'Barlow_700Bold',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 18, pill: 999 } as const;
export const tabBarHeight = Platform.OS === 'ios' ? 84 : 70;

