import { useMutation, useQuery } from "@apollo/client/react";

import type {
  CreateCommunityCommentInput,
  CreateCommunityPostInput,
  ReportCommunityPostInput,
  UpdateCommunityProfileInput,
} from "./api";
import {
  COMMUNITY_POSTS_QUERY,
  COMMUNITY_PROFILE_QUERY,
  CREATE_COMMUNITY_COMMENT_MUTATION,
  CREATE_COMMUNITY_POST_MUTATION,
  REPORT_COMMUNITY_POST_MUTATION,
  UPDATE_COMMUNITY_PROFILE_MUTATION,
  updateCachedCommunityProfile,
  updateCommunityCommentCount,
  updateCommunityPostList,
} from "./api";
import type { CommunityComment, CommunityPost, CommunityProfile } from "./types";

type MutationCallbacks<TResult> = {
  readonly onSuccess?: (result: TResult) => void;
  readonly onError?: (error: Error) => void;
};

class MissingCommunityMutationDataError extends Error {
  constructor(readonly operation: string) {
    super(`Missing mutation data for ${operation}`);
    this.name = "MissingCommunityMutationDataError";
  }
}

export const useCommunityPosts = () => {
  const result = useQuery(COMMUNITY_POSTS_QUERY);
  return {
    ...result,
    data: result.data?.communityPosts,
    isLoading: result.loading,
    isPending: result.loading,
  };
};

export const useCreateCommunityPost = () => {
  const [execute, result] = useMutation(CREATE_COMMUNITY_POST_MUTATION, {
    update: updateCommunityPostList,
  });
  const mutateAsync = async (input: CreateCommunityPostInput): Promise<CommunityPost> => {
    const response = await execute({ variables: { input } });
    const post = response.data?.createCommunityPost;
    if (!post) throw new MissingCommunityMutationDataError("CreateCommunityPost");
    return post;
  };
  const mutate = (
    input: CreateCommunityPostInput,
    callbacks?: MutationCallbacks<CommunityPost>,
  ) => {
    void mutateAsync(input).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.createCommunityPost,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};

export const useCreateCommunityComment = () => {
  const [execute, result] = useMutation(CREATE_COMMUNITY_COMMENT_MUTATION, {
    update: updateCommunityCommentCount,
  });
  const mutateAsync = async (input: CreateCommunityCommentInput): Promise<CommunityComment> => {
    const response = await execute({ variables: { input } });
    const comment = response.data?.createCommunityComment;
    if (!comment) throw new MissingCommunityMutationDataError("CreateCommunityComment");
    return comment;
  };
  const mutate = (
    input: CreateCommunityCommentInput,
    callbacks?: MutationCallbacks<CommunityComment>,
  ) => {
    void mutateAsync(input).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.createCommunityComment,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};

export const useReportCommunityPost = () => {
  const [execute, result] = useMutation(REPORT_COMMUNITY_POST_MUTATION);
  const mutateAsync = async (input: ReportCommunityPostInput): Promise<boolean> => {
    const response = await execute({ variables: { input } });
    const reported = response.data?.reportCommunityPost;
    if (reported === undefined) throw new MissingCommunityMutationDataError("ReportCommunityPost");
    return reported;
  };
  const mutate = (input: ReportCommunityPostInput, callbacks?: MutationCallbacks<boolean>) => {
    void mutateAsync(input).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.reportCommunityPost,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};

export const useCommunityProfile = () => {
  const result = useQuery(COMMUNITY_PROFILE_QUERY);
  return {
    ...result,
    data: result.data?.communityProfile,
    isLoading: result.loading,
    isPending: result.loading,
  };
};

export const useUpdateCommunityProfile = () => {
  const [execute, result] = useMutation(UPDATE_COMMUNITY_PROFILE_MUTATION, {
    refetchQueries: [COMMUNITY_POSTS_QUERY],
    update: updateCachedCommunityProfile,
  });
  const mutateAsync = async (input: UpdateCommunityProfileInput): Promise<CommunityProfile> => {
    const response = await execute({ variables: { input } });
    const profile = response.data?.updateCommunityProfile;
    if (!profile) throw new MissingCommunityMutationDataError("UpdateCommunityProfile");
    return profile;
  };
  const mutate = (
    input: UpdateCommunityProfileInput,
    callbacks?: MutationCallbacks<CommunityProfile>,
  ) => {
    void mutateAsync(input).then(callbacks?.onSuccess, callbacks?.onError);
  };
  return {
    ...result,
    data: result.data?.updateCommunityProfile,
    isPending: result.loading,
    mutate,
    mutateAsync,
  };
};
