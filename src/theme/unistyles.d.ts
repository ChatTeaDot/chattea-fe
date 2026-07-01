import { theme } from "./unistyles";

declare module "react-native-unistyles/lib/typescript/src/global" {
  export interface UnistylesThemes {
    light: typeof theme;
  }
}
