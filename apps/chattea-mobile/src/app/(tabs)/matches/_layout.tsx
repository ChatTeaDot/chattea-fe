import { Stack } from "expo-router";

import { useTranslation } from "@/i18n";

const MatchesLayout = () => {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "left" }}>
      <Stack.Screen name="index" options={{ title: t("nav.home") }} />
      <Stack.Screen name="list" options={{ title: t("nav.newMatches") }} />
    </Stack>
  );
};

export default MatchesLayout;
