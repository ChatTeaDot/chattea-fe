import { ActivityIndicator, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

const MessagePageLoading = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <View style={styles.row}>
      <ActivityIndicator color={theme.colors.muted} size="small" />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
  },
}));

export default MessagePageLoading;
