import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

import type { LikeGridCellProps } from "../types";

const LikeGridCell = ({ disabled, id, locked, name, onPress, photoUrl }: LikeGridCellProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
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
          <Image source="sf:lock.fill" style={styles.lock} tintColor={theme.colors.primaryText} />
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
    height: 184,
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
  lock: {
    height: 20,
    width: 20,
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
