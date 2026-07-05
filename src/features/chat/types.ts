export type Room = {
  id: string;
  name: string;
  lastMessage: string | null;
};

export type Message = {
  id: string;
  roomId: string;
  text: string;
  status: "failed" | "sending" | "sent";
  mine: boolean;
  createdAt?: string;
};

export type Upload = {
  id: string;
  putUrl: string;
};

export type AttachmentDraft = {
  id: string;
  filename: string;
  contentType: string;
  status: "ready" | "signing" | "uploading" | "uploaded" | "failed";
  putUrl?: string;
};

export type MatchCandidate = {
  id: string;
  userName: string;
  gender: string;
  age?: number;
  region?: string;
  profileImageUrl?: string;
  intro: string;
  likedByMe: boolean;
  planId: string;
  blackRecommended: boolean;
};

export type LikeUserResult = {
  matched: boolean;
  roomId: string | null;
};

export type ScoreSummary = {
  userId: string;
  averageScore: number;
  scoreCount: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  monthlyPriceKrw: number;
  benefits: string[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPriceKrw: 0,
    benefits: ["기본 매칭", "하루 좋아요 10회 제한", "기본 필터", "나를 좋아했는지 일부 공개"],
  },
  {
    id: "basic",
    name: "Basic",
    monthlyPriceKrw: 4900,
    benefits: ["하루 좋아요 20회", "되돌리기", "광고 제거", "나를 좋아한 사람 보기: 3시간마다 3개", "약한 부스트"],
  },
  {
    id: "gold",
    name: "Gold",
    monthlyPriceKrw: 9900,
    benefits: ["고급 필터", "우선 추천", "프로필 조회 확장", "프로필 AI 요약", "안읽은 메시지 AI 요약"],
  },
  {
    id: "black",
    name: "Black",
    monthlyPriceKrw: 24900,
    benefits: ["하루 좋아요 무제한", "Black 전용 추천", "Black끼리 우선 매칭", "강한 부스트", "고급 인증 배지", "읽음 확인"],
  },
];

export type CurrentSubscription = {
  planId: string;
};

export type AiSummaryPreview = {
  available: boolean;
  reason: string | null;
  sourceText: string;
  summary: string | null;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  commentCount: number;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type CommunityProfile = {
  name: string;
};
