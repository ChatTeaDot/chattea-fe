export type ProfilePhoto = {
  id: string;
  url: string;
  position: number;
};

export type CurrentUser = {
  id: string;
  email: string;
  phone: string | null;
  userName: string;
  gender: string;
  intro: string;
  birthDate: string | null;
  region: string | null;
  interestedGender: string | null;
  photos: ProfilePhoto[];
  profileCompleted: boolean;
};

export type MatchPhoto = {
  url: string;
  position: number;
};

export type MatchCandidate = {
  id: string;
  userName: string;
  gender: string;
  age: number;
  region: string;
  intro: string;
  photos: MatchPhoto[];
  likedByMe: boolean;
  planId: string;
  blackRecommended: boolean;
  boostActive: boolean;
};

export type InteractionResult = {
  matched: boolean;
  roomId: string | null;
  undoAvailable: boolean;
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

export type ChatRoom = {
  id: string;
  name: string;
  lastMessage: string | null;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderUserId: string | null;
  text: string;
  idempotencyKey: string | null;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  route: string | null;
  readAt: string | null;
  createdAt: string;
};

export type BillingProduct = {
  id: string;
  kind: string;
  name: string;
  priceKrw: number;
};

export type ConsumableBalance = {
  superLikeCredits: number;
  boostCredits: number;
};
