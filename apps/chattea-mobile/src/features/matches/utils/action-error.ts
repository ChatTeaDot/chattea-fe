import { router } from "expo-router";
import { Alert } from "react-native";

import { showActionError } from "@/shared/lib";

export const showMatchActionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("PROFILE_COMPLETION_REQUIRED")) {
    Alert.alert("프로필을 먼저 완성해 주세요", "사진과 기본 정보를 채우면 인연을 추천해 드릴게요.");
    router.push("/profile-completion");
    return;
  }
  if (message.includes("LIKE_LIMIT_REACHED")) {
    Alert.alert("오늘의 관심 보내기를 모두 사용했어요", "내일 다시 보내거나 플랜을 확인해 보세요.");
    return;
  }
  if (
    message.includes("SUPERLIKE_CREDITS_REQUIRED") ||
    message.includes("BOOST_CREDITS_REQUIRED")
  ) {
    Alert.alert("이용권이 필요해요", "구독과 아이템에서 필요한 이용권을 확인해 보세요.", [
      { text: "나중에", style: "cancel" },
      { text: "이용권 보기", onPress: () => router.push("/premium") },
    ]);
    return;
  }
  showActionError();
};
