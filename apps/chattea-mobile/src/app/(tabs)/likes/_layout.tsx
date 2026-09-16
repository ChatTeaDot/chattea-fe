import { Stack } from "expo-router";

const LikesLayout = () => {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "left" }}>
      <Stack.Screen name="index" options={{ title: "나를 좋아한 사람" }} />
    </Stack>
  );
};

export default LikesLayout;
