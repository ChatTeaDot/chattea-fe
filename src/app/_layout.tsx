import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { RootProvider, withSentry } from "@/providers";
import type { AppTheme } from "@/theme/unistyles";

const ThemedStack = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const reducedMotion = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        animation: reducedMotion ? "none" : Platform.OS === "ios" ? "default" : "slide_from_right",
        contentStyle: { backgroundColor: theme.colors.background },
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { color: theme.colors.text, fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="phone" options={{ title: "로그인" }} />
      <Stack.Screen name="code" options={{ title: "전화번호 인증" }} />
      <Stack.Screen name="signup" options={{ title: "프로필 만들기" }} />
      <Stack.Screen name="room/[room-id]" options={{ title: "대화", gestureEnabled: true }} />
    </Stack>
  );
};
const RootLayout = () => (
  <RootProvider>
    <ThemedStack />
  </RootProvider>
);
export default withSentry(RootLayout);
