import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { PhoneScreen } from "@/screens";
import type { AppTheme } from "@/theme/unistyles";

const PhoneRoute = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <>
      <Stack.Screen
        options={{
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text, fontWeight: "600" },
          title: "전화번호 로그인",
        }}
      />
      <PhoneScreen />
    </>
  );
};

export default PhoneRoute;
