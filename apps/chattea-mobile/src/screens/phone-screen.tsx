import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AuthActionButton, AuthField, BottomCta, usePhoneLogin } from "@/features/auth";
import { ContentState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

const PhoneScreen = () => {
  const { continuation, phoneValue, setPhone, requestCode, submit } = usePhoneLogin();
  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="인증 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <AuthField
          autoFocus
          keyboardType="phone-pad"
          label="휴대폰 번호"
          onChangeText={setPhone}
          placeholder="010-1234-5678"
          value={phoneValue}
        />
        <Text style={styles.hint}>[채티] 인증번호가 문자로 가요</Text>
      </View>
      <BottomCta>
        <AuthActionButton
          disabled={!phoneValue.trim() || requestCode.isPending}
          loading={requestCode.isPending}
          onPress={() => void submit()}
          title="인증번호 받기"
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
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  hint: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
}));

export default PhoneScreen;
