import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

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

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  notificationBell: {
    borderBottomWidth: 0,
    borderColor: colors.text,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1.8,
    height: 13,
    width: 16,
  },
  notificationClapper: {
    backgroundColor: colors.text,
    borderRadius: 999,
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
    backgroundColor: colors.text,
    borderRadius: 999,
    height: 2,
    marginBottom: -1,
    width: 5,
  },
  notificationRim: {
    backgroundColor: colors.text,
    borderRadius: 999,
    height: 2,
    marginTop: -1,
    width: 19,
  },
  profileButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  profileGlyph: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  profileGlyphBody: {
    borderColor: colors.text,
    borderRadius: 999,
    borderWidth: 1.8,
    height: 8,
    marginTop: 2,
    width: 18,
  },
  profileGlyphHead: {
    borderColor: colors.text,
    borderRadius: 999,
    borderWidth: 1.8,
    height: 8,
    width: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
});
