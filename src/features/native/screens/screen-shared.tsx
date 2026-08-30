import { router, useLocalSearchParams } from "expo-router";
import { Alert, TextInput, type TextInputProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { EmptyState } from "@/features/native/components";
import type { AppNotification } from "@/features/native/notifications";
import type {
  ChatMessage,
  ChatRoom,
  CommunityComment,
  CommunityPost,
  CurrentUser,
  MatchCandidate,
} from "@/features/native/types";

export const KOREAN_REGIONS = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

export type MeData = { me: CurrentUser };
export type CandidatesData = { matchCandidates: MatchCandidate[] };
export type LikedCandidatesData = { likedMeCandidates: MatchCandidate[] };
export type RoomsData = { chatRooms: ChatRoom[] };
export type MessagesData = { chatMessages: ChatMessage[] };
export type PostsData = { communityPosts: CommunityPost[] };
export type CommentsData = { communityComments: CommunityComment[] };
export type NotificationsData = { notifications: AppNotification[] };

export const NativeTextInput = ({ placeholderTextColor, ...props }: TextInputProps) => {
  const { theme } = useUnistyles();
  return <TextInput {...props} placeholderTextColor={placeholderTextColor ?? theme.colors.muted} />;
};

export const ErrorState = () => (
  <EmptyState title="내용을 불러오지 못했어요" body="잠시 후 다시 시도해 주세요." />
);

export const runExclusiveAction = async (
  guard: { current: boolean },
  action: () => Promise<void>,
) => {
  if (guard.current) return;
  guard.current = true;
  try {
    await action();
  } finally {
    guard.current = false;
  }
};

export const getLikesErrorKind = (error: unknown): "entitlement" | "retryable" => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("LIKED_ME_NOT_AVAILABLE") ? "entitlement" : "retryable";
};

export const useRouteParam = (name: string): string | undefined => {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const showActionError = (error: unknown) => {
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
  if (message.includes("R2_CONFIG_REQUIRED")) {
    Alert.alert(
      "사진 업로드를 준비 중이에요",
      "안전한 사진 저장소 설정이 완료되면 사진을 올릴 수 있어요.",
    );
    return;
  }
  Alert.alert("처리하지 못했어요", "잠시 후 다시 시도해 주세요.");
};

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(value));

export { styles } from "./screen-styles";
