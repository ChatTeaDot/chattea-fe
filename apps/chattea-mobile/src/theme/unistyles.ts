import { StyleSheet } from "react-native-unistyles";

import { colors, darkColors, radii, spacing, typography } from "./constants";

export type AppTheme = {
  colors: { [Key in keyof typeof colors]: string };
  radii: typeof radii;
  spacing: typeof spacing;
  typography: typeof typography;
};

export const theme: AppTheme = { colors, radii, spacing, typography };
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
