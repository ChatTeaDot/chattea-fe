import { darkTheme, lightTheme } from "./unistyles";

declare module "react-native-unistyles/lib/typescript/src/global" {
  export interface UnistylesThemes {
    light: typeof lightTheme;
    dark: typeof darkTheme;
  }
}
