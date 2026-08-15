import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const ProfileSummary = () => {
  return (
    <View style={styles.topBar}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>ChatTea User</Text>
          <Pressable
            accessibilityLabel="프로필 수정"
            accessibilityRole="button"
            style={styles.editButton}
          >
            <Text style={styles.editText}>프로필 수정</Text>
          </Pressable>
        </View>
      </View>
      <Pressable accessibilityLabel="설정" accessibilityRole="button" style={styles.iconButton}>
        <Text style={styles.iconText}>•••</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  editButton: {
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 44,
  },
  editText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.utility,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  name: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  profile: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  profileText: {
    gap: theme.spacing.xs,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
}));
