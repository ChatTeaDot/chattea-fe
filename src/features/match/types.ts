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
