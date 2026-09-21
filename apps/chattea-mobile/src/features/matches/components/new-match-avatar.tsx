import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { NewMatchAvatarProps } from "../types";

const NewMatchAvatar = ({ id, name, onPress }: NewMatchAvatarProps) => {
  const handlePress = () => onPress(id);
  return (
    <Pressable
      accessibilityLabel={`${name}님과 대화하기`}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={styles.avatar} />
      <Text numberOfLines={1} style={styles.name}>
        {name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    alignItems: "center",
    width: 64,
  },
  avatar: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.accent,
    borderCurve: "continuous",
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    height: 60,
    width: 60,
  },
  name: {
    color: theme.colors.text,
    fontSize: 10,
    marginTop: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
}));

export default NewMatchAvatar;
