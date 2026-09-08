import { Stack } from "expo-router";

const RoomsLayout = () => {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: "대화" }} />
    </Stack>
  );
};

export default RoomsLayout;
