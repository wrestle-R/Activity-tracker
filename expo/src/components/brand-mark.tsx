import Svg, { Path } from 'react-native-svg';
import { useSweatlineTheme } from '@/contexts/theme-context';

export function BrandMark({ size = 36, inverse = false }: { size?: number; inverse?: boolean }) {
  const { colors } = useSweatlineTheme();
  return <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityLabel="Sweatline"><Path d="M4 23h7l3-11 6 20 5-14 3 5h8" fill="none" stroke={inverse ? colors.pulseText : colors.pulse} strokeWidth={4} strokeLinecap="square" strokeLinejoin="miter" /></Svg>;
}

