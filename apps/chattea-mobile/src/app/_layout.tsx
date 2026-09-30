import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/i18n";
import {
  markStartupMilestone,
  NativeIntegrationsProvider,
  NativeSessionGate,
  RootProvider,
  withSentry,
} from "@/providers";
import type { AppTheme } from "@/theme";

const ThemedStack = () => {
  const { t } = useTranslation();
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
      <Stack.Screen name="signup" options={{ title: t("nav.createProfile") }} />
      <Stack.Screen
        name="room/[room-id]"
        options={{ title: t("nav.chat"), gestureEnabled: true }}
      />
      <Stack.Screen
        name="profile-completion"
        options={{ presentation: "formSheet", title: t("nav.completeProfile") }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{ presentation: "formSheet", title: t("nav.editProfile") }}
      />
      <Stack.Screen name="settings" options={{ title: t("nav.settings") }} />
      <Stack.Screen name="notifications" options={{ title: t("nav.notifications") }} />
      <Stack.Screen name="premium" options={{ title: t("nav.plans") }} />
      <Stack.Screen
        name="community/new"
        options={{ presentation: "formSheet", title: t("nav.writePost") }}
      />
      <Stack.Screen name="community/[post-id]" options={{ title: t("nav.community") }} />
      <Stack.Screen name="rooms/[room-id]" options={{ title: t("nav.chat") }} />
      <Stack.Screen name="candidate/[candidate-id]" options={{ title: "" }} />
      <Stack.Screen
        name="match-sheet"
        options={{
          headerShown: false,
          presentation: "formSheet",
          sheetAllowedDetents: [0.42],
          sheetCornerRadius: 20,
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  );
};
const AppRoot = () => {
  useEffect(() => {
    markStartupMilestone("app:first-commit");
    const id = requestIdleCallback(() => markStartupMilestone("app:first-interactive"));
    return () => cancelIdleCallback(id);
  }, []);
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
