import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/i18n";
import { SignupScreen } from "@/screens";
import type { AppTheme } from "@/theme";

const SignupRoute = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <>
      <Stack.Screen
        options={{
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text, fontWeight: "600" },
          title: t("nav.createProfile"),
        }}
      />
      <SignupScreen />
    </>
  );
};

export default SignupRoute;
