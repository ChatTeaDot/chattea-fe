import { Stack } from "expo-router";
import { Platform } from "react-native";

import { RootProvider, withSentry } from "@/providers";
import { colors } from "@/theme/tokens";

const RootLayout = () => {
  return (
    <RootProvider>
      <Stack
        screenOptions={{
          animation: Platform.OS === "ios" ? "default" : "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="phone" options={{ title: "로그인" }} />
        <Stack.Screen name="code" options={{ title: "전화번호 인증" }} />
        <Stack.Screen name="signup" options={{ title: "프로필 만들기" }} />
        <Stack.Screen name="room/[room-id]" options={{ title: "대화", gestureEnabled: true }} />
      </Stack>
    </RootProvider>
  );
};

export default withSentry(RootLayout);
