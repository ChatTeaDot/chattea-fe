import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const EmptyState = ({ title, body }: { title: string; body: string }) => {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  empty: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: 20,
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 180,
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyBody: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
}));

export default EmptyState;
