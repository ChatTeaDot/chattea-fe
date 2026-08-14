import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const MatchHeader = () => {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.eyebrow}>오늘의 인연</Text>
        <Text style={styles.title}>ChatTea</Text>
      </View>
      <Text style={styles.caption}>검증된 프로필만 추천</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  caption: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: "800",
  },
}));
