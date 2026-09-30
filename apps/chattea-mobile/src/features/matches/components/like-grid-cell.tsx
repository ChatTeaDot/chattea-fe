import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/i18n";
import type { AppTheme } from "@/theme";

import { LIKE_GRID_CELL_HEIGHT } from "../constants";
import type { LikeGridCellProps } from "../types";

const LikeGridCell = ({ disabled, id, locked, name, onPress, photoUrl }: LikeGridCellProps) => {
  const { t } = useTranslation("matches");
  const { theme } = useUnistyles() as { theme: AppTheme };
  const handlePress = () => onPress(id);
  return (
    <Pressable
      accessibilityLabel={locked ? t("likes.locked") : t("likes.sendInterestA11y", { name })}
      accessibilityRole="button"
      disabled={!locked && disabled}
      onPress={handlePress}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      {photoUrl && !locked ? (
        <Image
          accessibilityLabel={t("likes.photoA11y", { name })}
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={id}
          source={{ uri: photoUrl }}
          style={styles.photo}
          transition={150}
        />
      ) : (
        <View style={styles.photo} />
      )}
      {locked ? (
        <BlurView intensity={24} style={styles.veil} tint="light">
          <Lock color={theme.colors.primaryText} size={20} />
          <Text style={styles.veilText}>{t("likes.locked")}</Text>
        </BlurView>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  cell: {
    backgroundColor: theme.colors.surfaceSoft,
    borderCurve: "continuous",
    borderRadius: theme.radii.xl,
    flex: 1,
    height: LIKE_GRID_CELL_HEIGHT,
    overflow: "hidden",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surfaceSoft,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: theme.colors.accentSoft,
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  veilText: {
    color: theme.colors.primaryText,
    fontSize: 10,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.92,
  },
}));

export default LikeGridCell;
