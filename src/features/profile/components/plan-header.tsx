import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const PlanHeader = () => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>프리미엄</Text>
        <Text style={styles.title}>더 좋은 인연을 먼저 만나기</Text>
      </View>
      <Pressable
        accessibilityLabel="뒤로 가기"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.closeButton}
      >
        <Text style={styles.link}>닫기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "900",
    maxWidth: 260,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  link: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
}));
