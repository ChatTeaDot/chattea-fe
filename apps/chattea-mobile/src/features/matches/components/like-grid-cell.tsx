import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

import { LIKE_GRID_CELL_HEIGHT } from "../constants";
import type { LikeGridCellProps } from "../types";

const LikeGridCell = ({ disabled, id, locked, name, onPress, photoUrl }: LikeGridCellProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const handlePress = () => onPress(id);
  return (
    <Pressable
      accessibilityLabel={locked ? "Basic부터 확인" : `${name}님에게 관심 보내기`}
      accessibilityRole="button"
      disabled={!locked && disabled}
      onPress={handlePress}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      {photoUrl && !locked ? (
        <Image
          accessibilityLabel={`${name}님의 사진`}
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
          <Text style={styles.veilText}>Basic부터 확인</Text>
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
