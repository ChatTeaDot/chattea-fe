import { Alert } from "react-native";

import { showActionError } from "@/shared/lib";

export const showProfileActionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("R2_CONFIG_REQUIRED")) {
    Alert.alert(
      "사진 업로드를 준비 중이에요",
      "안전한 사진 저장소 설정이 완료되면 사진을 올릴 수 있어요.",
    );
    return;
  }
  showActionError();
};
