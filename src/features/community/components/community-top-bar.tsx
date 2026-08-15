import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const CommunityTopBar = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>커뮤니티</Text>
      <View style={styles.headerActions}>
        <Pressable accessibilityLabel="알림" accessibilityRole="button" style={styles.iconButton}>
          <View style={styles.notificationGlyph}>
            <View style={styles.notificationHandle} />
            <View style={styles.notificationBell} />
            <View style={styles.notificationRim} />
            <View style={styles.notificationClapper} />
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel="커뮤니티 프로필"
          accessibilityRole="button"
          style={styles.profileButton}
        >
          <View style={styles.profileGlyph}>
            <View style={styles.profileGlyphHead} />
            <View style={styles.profileGlyphBody} />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: theme.radii.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  notificationBell: {
    borderBottomWidth: 0,
    borderColor: theme.colors.text,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1.8,
    height: 13,
    width: 16,
  },
  notificationClapper: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    height: 3,
    marginTop: 1,
    width: 5,
  },
  notificationGlyph: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  notificationHandle: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    height: 2,
    marginBottom: -1,
    width: 5,
  },
  notificationRim: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    height: 2,
    marginTop: -1,
    width: 19,
  },
  profileButton: {
    alignItems: "center",
    borderRadius: theme.radii.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  profileGlyph: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  profileGlyphBody: {
    borderColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    borderWidth: 1.8,
    height: 8,
    marginTop: 2,
    width: 18,
  },
  profileGlyphHead: {
    borderColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    borderWidth: 1.8,
    height: 8,
    width: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
}));
