import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { NativeIntegrationsProvider, RootProvider, withSentry } from "@/providers";
import NativeSessionGate from "@/providers/session-gate";
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
      <Stack.Screen
        name="profile-completion"
        options={{ presentation: "formSheet", title: "프로필 완성" }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{ presentation: "formSheet", title: "프로필 편집" }}
      />
      <Stack.Screen name="settings" options={{ title: "설정" }} />
      <Stack.Screen name="notifications" options={{ title: "알림" }} />
      <Stack.Screen name="premium" options={{ title: "플랜" }} />
      <Stack.Screen
        name="community/new"
        options={{ presentation: "formSheet", title: "글 쓰기" }}
      />
      <Stack.Screen name="community/[post-id]" options={{ title: "커뮤니티" }} />
      <Stack.Screen name="rooms/[room-id]" options={{ title: "대화" }} />
    </Stack>
  );
};
const AppRoot = () => {
  return (
    <RootProvider>
      <NativeSessionGate>
        <NativeIntegrationsProvider>
          <ThemedStack />
        </NativeIntegrationsProvider>
      </NativeSessionGate>
    </RootProvider>
  );
};
const ObservedAppRoot = withSentry(AppRoot);
const RootLayout = () => {
  return <ObservedAppRoot />;
};
export default RootLayout;
