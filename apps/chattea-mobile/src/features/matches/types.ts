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

export type CandidatesData = { matchCandidates: MatchCandidate[] };

export type LikedCandidatesData = { likedMeCandidates: MatchCandidate[] };

export type ActivateBoostData = {
  activateBoost: {
    activeUntil: string;
    remainingBoostCredits: number;
  };
};

export type SwipeCardProps = {
  candidate: MatchCandidate;
  disabled: boolean;
  onPress?: () => void;
  onSwipe: (direction: "left" | "right") => void;
};

export type MatchActionBarProps = {
  disabled: boolean;
  onLike: () => void;
  onSkip: () => void;
  onUndo: () => void;
};

export type RoundActionButtonProps = {
  disabled: boolean;
  icon: string;
  label: string;
  main?: boolean;
  onPress: () => void;
};

export type LikeGridCellProps = {
  disabled: boolean;
  id: string;
  locked: boolean;
  name: string;
  onPress: (id: string) => void;
  photoUrl?: string;
};

export type NewMatchAvatarProps = {
  id: string;
  name: string;
  onPress: (id: string) => void;
};

export type CandidateDetailBodyProps = {
  candidate: MatchCandidate;
};

export type MatchPairAvatarsProps = {
  candidatePhoto?: string;
  myPhoto?: string;
};
