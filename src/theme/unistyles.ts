import { StyleSheet } from "react-native-unistyles";

import { darkColors, lightColors, spacing } from "./tokens";

export const lightTheme = {
  colors: lightColors,
  spacing,
};

export const darkTheme = {
  colors: darkColors,
  spacing,
};

export const theme = lightTheme;

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});
