import { StyleSheet } from "react-native-unistyles";

import { colors, darkColors, radii, spacing, typography } from "./tokens";

export const theme = { colors, radii, spacing, typography };
export const darkTheme = { ...theme, colors: darkColors };

StyleSheet.configure({
  themes: { light: theme, dark: darkTheme },
  settings: { adaptiveThemes: true },
});
