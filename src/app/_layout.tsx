import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { NativeSessionGate } from "@/features/native/session-gate";
import { RootProvider, withSentry } from "@/providers";

const RootLayout = () => {
  const colorScheme = useColorScheme();
  return (
    <RootProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <NativeSessionGate>
          <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="phone" options={{ headerShown: false }} />
            <Stack.Screen name="code" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
            <Stack.Screen
              name="premium"
              options={{ presentation: "formSheet", title: "구독과 아이템" }}
            />
            <Stack.Screen
              name="community/new"
              options={{ presentation: "formSheet", title: "글 쓰기" }}
            />
            <Stack.Screen name="community/[post-id]" options={{ title: "커뮤니티" }} />
            <Stack.Screen name="rooms/[room-id]" options={{ title: "대화" }} />
          </Stack>
        </NativeSessionGate>
      </ThemeProvider>
    </RootProvider>
  );
};

export default withSentry(RootLayout);
