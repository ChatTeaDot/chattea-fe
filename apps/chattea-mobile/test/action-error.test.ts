import { router } from "expo-router";
import { Alert } from "react-native";
import { beforeEach, expect, it, vi } from "vitest";

import { showMatchActionError } from "../src/features/matches/utils/action-error";
import { showProfileActionError } from "../src/features/profile/utils/action-error";

vi.mock("expo-router", () => ({ router: { push: vi.fn() } }));
vi.mock("react-native", () => ({ Alert: { alert: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

it("preserves matching recovery routes and credit actions", () => {
  showMatchActionError(new Error("PROFILE_COMPLETION_REQUIRED"));
  expect(router.push).toHaveBeenCalledWith("/profile-completion");
  showMatchActionError(new Error("LIKE_LIMIT_REACHED"));
  expect(Alert.alert).toHaveBeenLastCalledWith(
    "오늘의 관심 보내기를 모두 사용했어요",
    "내일 다시 보내거나 플랜을 확인해 보세요.",
  );
  for (const code of ["SUPERLIKE_CREDITS_REQUIRED", "BOOST_CREDITS_REQUIRED"]) {
    showMatchActionError(new Error(code));
    const buttons = vi.mocked(Alert.alert).mock.lastCall?.[2];
    expect(buttons?.[0]?.style).toBe("cancel");
    buttons?.[1]?.onPress?.();
    expect(router.push).toHaveBeenLastCalledWith("/premium");
  }
});

it("keeps upload configuration errors in profile and falls back for unknown errors", () => {
  showProfileActionError(new Error("R2_CONFIG_REQUIRED"));
  expect(Alert.alert).toHaveBeenLastCalledWith(
    "사진 업로드를 준비 중이에요",
    "안전한 사진 저장소 설정이 완료되면 사진을 올릴 수 있어요.",
  );
  for (const showError of [showMatchActionError, showProfileActionError]) {
    showError(new Error("NETWORK_ERROR"));
    expect(Alert.alert).toHaveBeenLastCalledWith(
      "처리하지 못했어요",
      "잠시 후 다시 시도해 주세요.",
    );
  }
});
