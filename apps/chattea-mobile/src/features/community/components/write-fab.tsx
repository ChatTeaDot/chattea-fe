import { Pencil } from "lucide-react-native";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { WriteFabProps } from "../types";

const WriteFab = ({ onPress }: WriteFabProps) => {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityLabel="글 쓰기"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
    >
      <Pencil color={theme.colors.accentText} size={24} />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  fab: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    bottom: rt.insets.bottom + theme.sizes.tabBar + theme.spacing.md,
    elevation: 6,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: theme.spacing.screen,
    shadowColor: theme.colors.accent,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    width: 56,
  },
  fabPressed: {
    backgroundColor: theme.colors.accentPressed,
  },
}));

export default WriteFab;
