import { Stack } from "expo-router";

const MatchesLayout = () => {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "left" }}>
      <Stack.Screen name="index" options={{ title: "채티" }} />
      <Stack.Screen name="list" options={{ title: "새 매치" }} />
    </Stack>
  );
};

export default MatchesLayout;
