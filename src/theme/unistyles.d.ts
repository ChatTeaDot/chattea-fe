import type { AppTheme } from "./unistyles";

declare module "react-native-unistyles/src/global" {
  export interface UnistylesThemes {
    light: AppTheme;
    dark: AppTheme;
  }
}
