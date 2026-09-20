import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const LoadingState = () => {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyBody}>잠시만요. 내용을 불러오고 있어요.</Text>
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
  emptyBody: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
}));

export default LoadingState;
