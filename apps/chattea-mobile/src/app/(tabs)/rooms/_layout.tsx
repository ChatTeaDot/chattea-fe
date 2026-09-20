import { Stack } from "expo-router";

const RoomsLayout = () => {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: "채팅" }} />
    </Stack>
  );
};

export default RoomsLayout;
