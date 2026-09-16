import { router, Stack } from "expo-router";
import { Settings } from "lucide-react-native";
import { Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { ProfileScreen } from "@/screens";

const ProfileRoute = () => {
  const { theme } = useUnistyles();
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityLabel="설정"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => router.push("/settings")}
            >
              <Settings color={theme.colors.text} size={20} strokeWidth={1.75} />
            </Pressable>
          ),
          title: "내 정보",
        }}
      />
      <ProfileScreen />
    </>
  );
};

export default ProfileRoute;
