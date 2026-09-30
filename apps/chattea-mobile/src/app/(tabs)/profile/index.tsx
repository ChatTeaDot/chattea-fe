import { router, Stack } from "expo-router";
import { Settings } from "lucide-react-native";
import { Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/i18n";
import { ProfileScreen } from "@/screens";

const ProfileRoute = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityLabel={t("nav.settings")}
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => router.push("/settings")}
            >
              <Settings color={theme.colors.text} size={20} strokeWidth={1.75} />
            </Pressable>
          ),
          title: t("nav.myInfo"),
        }}
      />
      <ProfileScreen />
    </>
  );
};

export default ProfileRoute;
