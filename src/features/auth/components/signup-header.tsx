import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const SignupHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.kicker}>프로필</Text>
      <Text style={styles.title}>첫인상을 만들어주세요</Text>
      <Text style={styles.copy}>짧아도 좋아요. 대화가 시작될 이유 하나면 충분합니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  copy: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
}));
