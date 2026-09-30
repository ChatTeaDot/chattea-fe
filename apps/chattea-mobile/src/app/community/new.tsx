import { Stack } from "expo-router";

import { useTranslation } from "@/i18n";
import { CommunityWriteScreen } from "@/screens";

const CommunityWriteRoute = () => {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ presentation: "card", title: t("nav.writePost") }} />
      <CommunityWriteScreen />
    </>
  );
};

export default CommunityWriteRoute;
