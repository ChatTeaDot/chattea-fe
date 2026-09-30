import { Alert } from "react-native";

import i18n from "@/i18n";
import { showActionError } from "@/shared/lib";

export const showProfileActionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("R2_CONFIG_REQUIRED")) {
    Alert.alert(
      i18n.t("errors.uploadPendingTitle", { ns: "profile" }),
      i18n.t("errors.uploadPendingBody", { ns: "profile" }),
    );
    return;
  }
  showActionError();
};
