import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors } from "@/theme/tokens";

export const PlanHeader = () => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>프리미엄</Text>
        <Text style={styles.title}>더 좋은 인연을 먼저 만나기</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.back()}>
        <Text style={styles.link}>닫기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    maxWidth: 260,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
