import { Stack } from "expo-router";

const LikesLayout = () => (
  <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
    <Stack.Screen name="index" options={{ title: "나를 좋아한 사람" }} />
  </Stack>
);

export default LikesLayout;
