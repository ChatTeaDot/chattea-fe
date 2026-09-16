import { EllipsisVertical } from "lucide-react-native";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { RoomMenuButtonProps } from "../types";

const RoomMenuButton = ({ onPress }: RoomMenuButtonProps) => {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityLabel="대화 옵션"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <EllipsisVertical color={theme.colors.text} size={20} strokeWidth={1.75} />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: "center",
    borderRadius: theme.radii.pill,
    height: theme.sizes.tapMin,
    justifyContent: "center",
    width: theme.sizes.tapMin,
  },
  buttonPressed: {
    backgroundColor: theme.colors.surface,
  },
}));

export default RoomMenuButton;
