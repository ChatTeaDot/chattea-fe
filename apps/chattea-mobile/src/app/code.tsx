import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { CodeScreen } from "@/screens";
import type { AppTheme } from "@/theme/unistyles";

const CodeRoute = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  return (
    <>
      <Stack.Screen
        options={{
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text, fontWeight: "600" },
          title: "인증번호",
        }}
      />
      <CodeScreen />
    </>
  );
};

export default CodeRoute;
