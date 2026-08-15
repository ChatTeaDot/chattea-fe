import { Stack } from "expo-router";

const MatchesLayout = () => (
  <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
    <Stack.Screen name="index" options={{ title: "오늘의 인연" }} />
  </Stack>
);

export default MatchesLayout;
