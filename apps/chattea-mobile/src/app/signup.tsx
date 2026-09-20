import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { SignupScreen } from "@/screens";
import type { AppTheme } from "@/theme";

const SignupRoute = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <>
      <Stack.Screen
        options={{
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text, fontWeight: "600" },
          title: "프로필 만들기",
        }}
      />
      <SignupScreen />
    </>
  );
};

export default SignupRoute;
