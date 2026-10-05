import { Stack } from "expo-router";

import { useTranslation } from "@/i18n";

const CommunityLayout = () => {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: t("nav.community") }} />
    </Stack>
  );
};

export default CommunityLayout;
