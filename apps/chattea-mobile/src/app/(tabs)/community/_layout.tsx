import { Stack } from "expo-router";

const CommunityLayout = () => {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: "커뮤니티" }} />
    </Stack>
  );
};

export default CommunityLayout;
