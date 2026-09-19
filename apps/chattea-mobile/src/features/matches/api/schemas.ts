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
