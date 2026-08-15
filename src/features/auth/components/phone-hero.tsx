import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

export const PhoneHero = () => {
  return (
    <View style={styles.hero}>
      <Text style={styles.kicker}>소개팅은 가볍게, 대화는 진하게</Text>
      <Text style={styles.title}>오늘 마실 차 한 잔 같은 인연</Text>
      <Text style={styles.copy}>전화번호 인증 후 맞는 사람을 추천받고 바로 대화를 시작하세요.</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  copy: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  hero: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    gap: 10,
    padding: 22,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
}));
