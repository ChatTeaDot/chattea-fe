import type { PropsWithChildren } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NativeScroll = ({ children }: PropsWithChildren) => {
  return (
    <ScrollView
      style={styles.scrollFrame}
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustsScrollIndicatorInsets
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  scrollFrame: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 40,
  },
}));

export default NativeScroll;
