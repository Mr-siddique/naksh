import { useColorScheme } from 'react-native';
import { type Colors, darkColors, lightColors } from './colors';

export type Theme = {
  dark: boolean;
  colors: Colors;
};

const LIGHT: Theme = { dark: false, colors: lightColors };
const DARK: Theme = { dark: true, colors: darkColors };

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK : LIGHT;
}
