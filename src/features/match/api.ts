import type { ApolloCache, MutationUpdaterFunction, TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

import type { LikeUserResult, MatchCandidate, ScoreSummary } from "./types";

export type RateScoreInput = {
  readonly userId: string;
  readonly score: number;
};

type MatchCandidatePayload = MatchCandidate & {
  readonly __typename: "MatchCandidatePayload";
};
type MatchCandidatesData = { readonly matchCandidates: MatchCandidatePayload[] };
type BlackMatchCandidatesData = { readonly blackMatchCandidates: MatchCandidatePayload[] };
type LikeUserData = { readonly likeUser: LikeUserResult };
type RateScoreData = { readonly rateScore: ScoreSummary };
type BlockUserData = { readonly blockUser: boolean };

export const MATCH_CANDIDATES_QUERY: TypedDocumentNode<MatchCandidatesData> = gql`
  query MatchCandidates {
    matchCandidates {
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

export const BLACK_MATCH_CANDIDATES_QUERY: TypedDocumentNode<BlackMatchCandidatesData> = gql`
  query BlackMatchCandidates {
    blackMatchCandidates {
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

export const LIKE_USER_MUTATION: TypedDocumentNode<LikeUserData, { readonly userId: string }> = gql`
  mutation LikeUser($userId: String!) {
    likeUser(userId: $userId) {
      matched
      roomId
    }
  }
`;

export const RATE_SCORE_MUTATION: TypedDocumentNode<
  RateScoreData,
  { readonly input: RateScoreInput }
> = gql`
  mutation RateScore($input: RateScoreInput!) {
    rateScore(input: $input) {
      userId
      averageScore
      scoreCount
    }
  }
`;

export const BLOCK_USER_MUTATION: TypedDocumentNode<
  BlockUserData,
  { readonly input: { readonly userId: string } }
> = gql`
  mutation BlockUser($input: BlockUserInput!) {
    blockUser(input: $input)
  }
`;

export const updateLikedCandidate: MutationUpdaterFunction<
  LikeUserData,
  { readonly userId: string },
  ApolloCache
> = (cache, result, options) => {
  if (!options.variables) return;
  cache.modify({
    id: cache.identify({ __typename: "MatchCandidatePayload", id: options.variables.userId }),
    fields: {
      likedByMe: () => true,
    },
  });
  if (result.data?.likeUser.matched) {
    cache.evict({ id: "ROOT_QUERY", fieldName: "chatRooms" });
  }
};

export const removeBlockedCandidate: MutationUpdaterFunction<
  BlockUserData,
  { readonly input: { readonly userId: string } },
  ApolloCache
> = (cache, result, options) => {
  if (!result.data?.blockUser || !options.variables) return;
  cache.evict({
    id: cache.identify({ __typename: "MatchCandidatePayload", id: options.variables.input.userId }),
  });
  cache.gc();
};
