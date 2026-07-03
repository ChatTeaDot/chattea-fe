export type Room = {
  id: string;
  name: string;
  lastMessage: string;
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
  anonymousName: string;
  title: string;
  body: string;
  commentCount: number;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  anonymousName: string;
  body: string;
  createdAt: string;
};
