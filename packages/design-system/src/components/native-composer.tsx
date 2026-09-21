import type { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { bottomEdge } from "./constants";

const NativeComposer = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaView edges={bottomEdge} style={styles.composer}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  composer: {
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
}));

export default NativeComposer;
