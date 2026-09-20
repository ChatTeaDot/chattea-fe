import type { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { bottomEdge } from "./constants";

const BottomCta = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaView edges={bottomEdge} style={styles.bar}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  bar: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.surface,
    borderTopWidth: 1,
    gap: theme.spacing.control,
    paddingBottom: 34,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: 4,
  },
}));

export default BottomCta;
