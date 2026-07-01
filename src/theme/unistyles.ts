import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "./tokens";

export const theme = {
  colors,
  spacing,
};

StyleSheet.configure({
  themes: {
    light: theme,
  },
});
