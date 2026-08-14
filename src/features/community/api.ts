import type {
  ApolloCache,
  MutationUpdaterFunction,
  Reference,
  TypedDocumentNode,
} from "@apollo/client";
import { gql } from "@apollo/client";

import type { CommunityComment, CommunityPost, CommunityProfile } from "./types";

export type CreateCommunityPostInput = {
  readonly title: string;
  readonly body: string;
};

export type CreateCommunityCommentInput = {
  readonly postId: string;
  readonly body: string;
};

export type UpdateCommunityProfileInput = {
  readonly name: string;
};

export type ReportCommunityPostInput = {
  readonly postId: string;
  readonly reason: string;
};

type CommunityPostPayload = CommunityPost & {
  readonly __typename: "CommunityPostPayload";
};
type CommunityCommentPayload = CommunityComment & {
  readonly __typename: "CommunityCommentPayload";
};
type CommunityPostsData = { readonly communityPosts: CommunityPostPayload[] };
type CreateCommunityPostData = { readonly createCommunityPost: CommunityPostPayload };
type CreateCommunityCommentData = { readonly createCommunityComment: CommunityCommentPayload };
type CommunityProfileData = { readonly communityProfile: CommunityProfile };
type UpdateCommunityProfileData = { readonly updateCommunityProfile: CommunityProfile };
type ReportCommunityPostData = { readonly reportCommunityPost: boolean };

export const COMMUNITY_POSTS_QUERY: TypedDocumentNode<CommunityPostsData> = gql`
  query CommunityPosts {
    communityPosts {
      __typename
      id
      authorName
      title
      body
      commentCount
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_POST_MUTATION: TypedDocumentNode<
  CreateCommunityPostData,
  { readonly input: CreateCommunityPostInput }
> = gql`
  mutation CreateCommunityPost($input: CreateCommunityPostInput!) {
    createCommunityPost(input: $input) {
      __typename
      id
      authorName
      title
      body
      commentCount
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_COMMENT_MUTATION: TypedDocumentNode<
  CreateCommunityCommentData,
  { readonly input: CreateCommunityCommentInput }
> = gql`
  mutation CreateCommunityComment($input: CreateCommunityCommentInput!) {
    createCommunityComment(input: $input) {
      __typename
      id
      postId
      authorName
      body
      createdAt
    }
  }
`;

export const COMMUNITY_PROFILE_QUERY: TypedDocumentNode<CommunityProfileData> = gql`
  query CommunityProfile {
    communityProfile {
      name
    }
  }
`;

export const UPDATE_COMMUNITY_PROFILE_MUTATION: TypedDocumentNode<
  UpdateCommunityProfileData,
  { readonly input: UpdateCommunityProfileInput }
> = gql`
  mutation UpdateCommunityProfile($input: UpdateCommunityProfileInput!) {
    updateCommunityProfile(input: $input) {
      name
    }
  }
`;

export const REPORT_COMMUNITY_POST_MUTATION: TypedDocumentNode<
  ReportCommunityPostData,
  { readonly input: ReportCommunityPostInput }
> = gql`
  mutation ReportCommunityPost($input: ReportCommunityPostInput!) {
    reportCommunityPost(input: $input)
  }
`;

export const updateCommunityPostList: MutationUpdaterFunction<
  CreateCommunityPostData,
  { readonly input: CreateCommunityPostInput },
  ApolloCache
> = (cache, result) => {
  const post = result.data?.createCommunityPost;
  if (!post) return;

  const reference = cache.writeFragment({
    data: post,
    fragment: gql`
      fragment CreatedCommunityPost on CommunityPostPayload {
        id
        authorName
        title
        body
        commentCount
        createdAt
      }
    `,
  });
  if (!reference) return;

  cache.modify<{ communityPosts: readonly Reference[] }>({
    fields: {
      communityPosts: (existing = [], { readField }) => {
        return [reference, ...existing.filter((item) => readField("id", item) !== post.id)];
      },
    },
  });
};

export const updateCommunityCommentCount: MutationUpdaterFunction<
  CreateCommunityCommentData,
  { readonly input: CreateCommunityCommentInput },
  ApolloCache
> = (cache, result) => {
  const comment = result.data?.createCommunityComment;
  if (!comment) return;

  cache.modify({
    id: cache.identify({ __typename: "CommunityPostPayload", id: comment.postId }),
    fields: {
      commentCount: (existing: number) => existing + 1,
    },
  });
};

export const updateCachedCommunityProfile: MutationUpdaterFunction<
  UpdateCommunityProfileData,
  { readonly input: UpdateCommunityProfileInput },
  ApolloCache
> = (cache, result) => {
  const profile = result.data?.updateCommunityProfile;
  if (!profile) return;
  cache.writeQuery({ query: COMMUNITY_PROFILE_QUERY, data: { communityProfile: profile } });
};

export const UPDATE_COMMUNITY_PROFILE_OPTIONS = {
  awaitRefetchQueries: true,
  refetchQueries: [COMMUNITY_POSTS_QUERY],
  update: updateCachedCommunityProfile,
};
