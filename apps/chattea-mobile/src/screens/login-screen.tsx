import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AuthActionButton, useKakaoLogin } from "@/features/auth";
import type { AppTheme } from "@/theme";

const LoginScreen = () => {
  const { pending, submit } = useKakaoLogin();
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.logo}>채티</Text>
      </View>
      <Text style={styles.slogan}>인증된 사람들의 가벼운 만남</Text>
      <View style={styles.actions}>
        <AuthActionButton
          loading={pending}
          onPress={() => void submit()}
          title="카카오로 시작"
          variant="kakao"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme, rt) => ({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  hero: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    color: theme.colors.text,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1,
  },
  slogan: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  actions: {
    gap: theme.spacing.sm,
    paddingBottom: rt.insets.bottom + theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
}));

export default LoginScreen;
