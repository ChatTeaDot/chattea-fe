import { StyleSheet } from "react-native-unistyles";

import { colors, darkColors, motion, radii, sizes, spacing, typography } from "./constants";

export type AppTheme = {
  colors: { [Key in keyof typeof colors]: string };
  radii: typeof radii;
  spacing: typeof spacing;
  typography: typeof typography;
  sizes: typeof sizes;
  motion: typeof motion;
};

export const theme: AppTheme = { colors, radii, spacing, typography, sizes, motion };
export const darkTheme: AppTheme = { ...theme, colors: darkColors };

declare module "react-native-unistyles" {
  interface UnistylesThemes {
    light: AppTheme;
    dark: AppTheme;
  }
}

StyleSheet.configure({
  themes: { light: theme, dark: darkTheme },
  settings: { adaptiveThemes: true },
});
