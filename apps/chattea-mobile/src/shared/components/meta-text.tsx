import type { PropsWithChildren } from "react";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const MetaText = ({ children }: PropsWithChildren) => {
  return <Text style={styles.meta}>{children}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  meta: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
}));

export default MetaText;
