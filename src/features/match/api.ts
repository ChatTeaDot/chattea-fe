import { gql } from "graphql-request";

import { graphQLRequest } from "@/shared/graphql";

import { LikeUserResult, MatchCandidate, ScoreSummary } from "./types";

export const listMatchCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ matchCandidates: MatchCandidate[] }>(gql`
    query MatchCandidates {
      matchCandidates {
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

  return data.matchCandidates;
};

export const listBlackMatchCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ blackMatchCandidates: MatchCandidate[] }>(gql`
    query BlackMatchCandidates {
      blackMatchCandidates {
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

  return data.blackMatchCandidates;
};

export const likeUser = async (userId: string): Promise<LikeUserResult> => {
  const data = await graphQLRequest<{ likeUser: LikeUserResult }>(
    gql`
      mutation LikeUser($userId: String!) {
        likeUser(userId: $userId) {
          matched
          roomId
        }
      }
    `,
    { userId },
  );

  return data.likeUser;
};

export const rateScore = async (input: {
  userId: string;
  score: number;
}): Promise<ScoreSummary> => {
  const data = await graphQLRequest<{ rateScore: ScoreSummary }>(
    gql`
      mutation RateScore($input: RateScoreInput!) {
        rateScore(input: $input) {
          userId
          averageScore
          scoreCount
        }
      }
    `,
    { input },
  );

  return data.rateScore;
};

export const blockUser = async (userId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ blockUser: boolean }>(
    gql`
      mutation BlockUser($userId: String!) {
        blockUser(input: { userId: $userId })
      }
    `,
    { userId },
  );

  return data.blockUser;
};
