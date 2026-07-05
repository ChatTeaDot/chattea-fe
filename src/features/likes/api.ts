import { gql } from "graphql-request";

import { MatchCandidate } from "@/features/match/types";
import { graphQLRequest } from "@/shared/graphql";

export const listLikedMeCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ likedMeCandidates: MatchCandidate[] }>(gql`
    query LikedMeCandidates {
      likedMeCandidates {
        id
        userName
        gender
        intro
        likedByMe
        planId
        blackRecommended
      }
    }
  `);

  return data.likedMeCandidates;
};
