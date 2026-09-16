import { Image } from "expo-image";
import { ImagePlus } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { MAX_PROFILE_PHOTOS } from "../constants";
import type { PhotoGridProps } from "../types";

const PhotoGrid = ({ photos, uploading, onAddPhoto }: PhotoGridProps) => {
  const { theme } = useUnistyles();
  const slots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, index) => photos[index]);
  return (
    <View style={styles.grid}>
      {slots.map((photo, index) => {
        if (photo)
          return (
            <Image
              accessibilityLabel={`프로필 사진 ${index + 1}`}
              contentFit="cover"
              key={photo.uploadId}
              source={{ uri: photo.url }}
              style={styles.tile}
            />
          );
        if (index === photos.length)
          return (
            <Pressable
              accessibilityLabel="사진 추가"
              accessibilityRole="button"
              disabled={uploading}
              key="picker"
              onPress={onAddPhoto}
              style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
            >
              {uploading ? (
                <ActivityIndicator color={theme.colors.muted} />
              ) : (
                <ImagePlus color={theme.colors.muted} size={24} strokeWidth={2} />
              )}
            </Pressable>
          );
        return <View key={`empty-${index}`} style={styles.tile} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    gap: theme.spacing.control,
    paddingHorizontal: theme.spacing.screen,
  },
  tile: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.xl,
    height: 136,
    width: 104,
  },
  picker: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    height: 136,
    justifyContent: "center",
    width: 104,
  },
  pickerPressed: {
    backgroundColor: theme.colors.surfaceSoft,
  },
}));

export default PhotoGrid;
