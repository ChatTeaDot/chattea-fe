import { Redirect } from "expo-router";
import { Timer } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import {
  AuthActionButton,
  BottomCta,
  CodeField,
  formatResendClock,
  usePhoneVerification,
} from "@/features/auth";
import { ContentState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

const CodeScreen = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const { continuation, phone, code, setCode, resend, submit, resendSeconds, verify } =
    usePhoneVerification();
  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="인증 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  if (!phone) {
    return <Redirect href="/phone" />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <Text style={styles.fieldLabel}>문자로 온 6자리</Text>
        <CodeField onChange={setCode} value={code} />
        <Pressable
          accessibilityRole="button"
          disabled={resendSeconds > 0}
          onPress={() => void resend()}
          style={styles.timerRow}
        >
          <Timer color={theme.colors.muted} size={16} strokeWidth={1.5} />
          <Text style={styles.timerText}>
            {resendSeconds > 0
              ? `${formatResendClock(resendSeconds)} 후 재발송 가능`
              : "인증번호 재발송"}
          </Text>
        </Pressable>
      </View>
      <BottomCta>
        <AuthActionButton
          disabled={code.length !== 6 || verify.isPending}
          loading={verify.isPending}
          onPress={() => void submit()}
          title="확인"
        />
      </BottomCta>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  body: {
    flex: 1,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  timerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  timerText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
}));

export default CodeScreen;
