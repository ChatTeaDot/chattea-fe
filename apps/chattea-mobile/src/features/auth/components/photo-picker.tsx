import { Image } from "expo-image";
import { ImagePlus } from "lucide-react-native";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

import type { PhotoPickerProps } from "../types";

const PhotoPicker = ({ onPress, uri }: PhotoPickerProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <Pressable
      accessibilityLabel="프로필 사진 선택"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
    >
      {uri ? (
        <Image contentFit="cover" source={{ uri }} style={styles.image} />
      ) : (
        <ImagePlus color={theme.colors.muted} size={24} strokeWidth={2} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  picker: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    height: 136,
    justifyContent: "center",
    overflow: "hidden",
    width: 104,
  },
  pressed: {
    opacity: 0.88,
  },
  image: {
    height: "100%",
    width: "100%",
  },
}));

export default PhotoPicker;
