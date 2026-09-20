import type { ReactNode } from "react";

import type { MatchCandidate } from "./api/schemas";

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
  icon: ReactNode;
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
