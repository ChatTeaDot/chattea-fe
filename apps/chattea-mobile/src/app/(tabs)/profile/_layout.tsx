import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: "프로필" }} />
    </Stack>
  );
};

export default ProfileLayout;
