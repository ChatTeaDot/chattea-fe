import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

export const ProfileSummary = () => {
  return (
    <View style={styles.topBar}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>ChatTea User</Text>
          <Pressable accessibilityRole="button" style={styles.editButton}>
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

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  editButton: {
    alignSelf: "flex-start",
  },
  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  profile: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  profileText: {
    gap: spacing.xs,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
});
