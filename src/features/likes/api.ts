import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

import type { MatchCandidate } from "@/features/match/types";

type MatchCandidatePayload = MatchCandidate & {
  readonly __typename: "MatchCandidatePayload";
};
type LikedMeCandidatesData = { readonly likedMeCandidates: MatchCandidatePayload[] };

export const LIKED_ME_CANDIDATES_QUERY: TypedDocumentNode<LikedMeCandidatesData> = gql`
  query LikedMeCandidates {
    likedMeCandidates {
      __typename
      id
      userName
      gender
      intro
      likedByMe
      planId
      blackRecommended
    }
  }
`;
