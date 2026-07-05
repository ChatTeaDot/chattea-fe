import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors } from "@/theme/tokens";

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

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  caption: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "800",
  },
});
