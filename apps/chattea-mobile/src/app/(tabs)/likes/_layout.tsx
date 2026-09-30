import { Stack } from "expo-router";

import { useTranslation } from "@/i18n";

const LikesLayout = () => {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "left" }}>
      <Stack.Screen name="index" options={{ title: t("nav.likes") }} />
    </Stack>
  );
};

export default LikesLayout;
