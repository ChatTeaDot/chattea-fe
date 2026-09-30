import { createTheme, MantineProvider, type MantineColorsTuple } from "@mantine/core";
import type { ReactNode } from "react";

import { brandPink, colors, webFontStack } from "./tokens";

const theme = createTheme({
  black: colors.textPrimary,
  colors: {
    brand: [...brandPink] as unknown as MantineColorsTuple,
  },
  defaultRadius: "md",
  fontFamily: webFontStack,
  primaryColor: "brand",
});

export const AppMantineProvider = ({ children }: { children: ReactNode }) => (
  <MantineProvider forceColorScheme="light" theme={theme}>
    {children}
  </MantineProvider>
);
