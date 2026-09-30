import { router } from "expo-router";
import { Alert } from "react-native";

import i18n from "@/i18n";
import { showActionError } from "@/shared/lib";

export const showMatchActionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("PROFILE_COMPLETION_REQUIRED")) {
    Alert.alert(
      i18n.t("errors.profileRequiredTitle", { ns: "matches" }),
      i18n.t("errors.profileRequiredBody", { ns: "matches" }),
    );
    router.push("/profile-completion");
    return;
  }
  if (message.includes("LIKE_LIMIT_REACHED")) {
    Alert.alert(
      i18n.t("errors.likeLimitTitle", { ns: "matches" }),
      i18n.t("errors.likeLimitBody", { ns: "matches" }),
    );
    return;
  }
  if (
    message.includes("SUPERLIKE_CREDITS_REQUIRED") ||
    message.includes("BOOST_CREDITS_REQUIRED")
  ) {
    Alert.alert(
      i18n.t("errors.passRequiredTitle", { ns: "matches" }),
      i18n.t("errors.passRequiredBody", { ns: "matches" }),
      [
        { text: i18n.t("actions.later"), style: "cancel" },
        {
          text: i18n.t("errors.viewPasses", { ns: "matches" }),
          onPress: () => router.push("/premium"),
        },
      ],
    );
    return;
  }
  showActionError();
};
