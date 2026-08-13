import { useMutation, useQuery } from "@apollo/client/react";

import type { RateScoreInput } from "./api";
import {
  BLACK_MATCH_CANDIDATES_QUERY,
  BLOCK_USER_MUTATION,
  LIKE_USER_MUTATION,
  MATCH_CANDIDATES_QUERY,
  RATE_SCORE_MUTATION,
  removeBlockedCandidate,
  updateLikedCandidate,
} from "./api";
import type { LikeUserResult, ScoreSummary } from "./types";

type MutationCallbacks<TResult> = {
  readonly onSuccess?: (result: TResult) => void;
  readonly onError?: (error: Error) => void;
};

class MissingMatchMutationDataError extends Error {
  constructor(readonly operation: string) {
    super(`Missing mutation data for ${operation}`);
    this.name = "MissingMatchMutationDataError";
  }
}

export const useMatchCandidates = () => {
  const result = useQuery(MATCH_CANDIDATES_QUERY);
  return {
    ...result,
    data: result.data?.matchCandidates,
    isLoading: result.loading,
    isPending: result.loading,
  };
};

export const useBlackMatchCandidates = (enabled: boolean) => {
  const result = useQuery(BLACK_MATCH_CANDIDATES_QUERY, { skip: !enabled });
  return {
    ...result,
    data: result.data?.blackMatchCandidates,
    isLoading: result.loading,
    isPending: result.loading,
  };
};

export const useLikeUser = () => {
  const [execute, result] = useMutation(LIKE_USER_MUTATION, { update: updateLikedCandidate });
  const mutateAsync = async (userId: string): Promise<LikeUserResult> => {
    const response = await execute({ variables: { userId } });
    const likeResult = response.data?.likeUser;
    if (!likeResult) throw new MissingMatchMutationDataError("LikeUser");
    return likeResult;
  };
  const mutate = (userId: string, callbacks?: MutationCallbacks<LikeUserResult>) => {
    void mutateAsync(userId).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.likeUser,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};

export const useRateScore = () => {
  const [execute, result] = useMutation(RATE_SCORE_MUTATION);
  const mutateAsync = async (input: RateScoreInput): Promise<ScoreSummary> => {
    const response = await execute({ variables: { input } });
    const score = response.data?.rateScore;
    if (!score) throw new MissingMatchMutationDataError("RateScore");
    return score;
  };
  const mutate = (input: RateScoreInput, callbacks?: MutationCallbacks<ScoreSummary>) => {
    void mutateAsync(input).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.rateScore,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};

export const useBlockUser = () => {
  const [execute, result] = useMutation(BLOCK_USER_MUTATION, { update: removeBlockedCandidate });
  const mutateAsync = async (userId: string): Promise<boolean> => {
    const response = await execute({ variables: { input: { userId } } });
    const blocked = response.data?.blockUser;
    if (blocked === undefined) throw new MissingMatchMutationDataError("BlockUser");
    return blocked;
  };
  const mutate = (userId: string, callbacks?: MutationCallbacks<boolean>) => {
    void mutateAsync(userId).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.blockUser,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};
