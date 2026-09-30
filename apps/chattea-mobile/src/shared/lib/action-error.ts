import { Alert } from "react-native";

import i18n from "@/i18n";

export const showActionError = () => {
  Alert.alert(i18n.t("errors.actionFailedTitle"), i18n.t("errors.actionFailedBody"));
};
