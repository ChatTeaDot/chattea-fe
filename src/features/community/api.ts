import { gql } from "graphql-request";

import { graphQLRequest } from "@/shared/graphql";

import { CommunityComment, CommunityPost, CommunityProfile } from "./types";

export const listCommunityPosts = async (): Promise<CommunityPost[]> => {
  const data = await graphQLRequest<{ communityPosts: CommunityPost[] }>(gql`
    query CommunityPosts {
      communityPosts {
        id
        authorName
        title
        body
        commentCount
        createdAt
      }
    }
  `);

  return data.communityPosts;
};

export const createCommunityPost = async (input: {
  title: string;
  body: string;
}): Promise<CommunityPost> => {
  const data = await graphQLRequest<{ createCommunityPost: CommunityPost }>(
    gql`
      mutation CreateCommunityPost($input: CreateCommunityPostInput!) {
        createCommunityPost(input: $input) {
          id
          authorName
          title
          body
          commentCount
          createdAt
        }
      }
    `,
    { input },
  );

  return data.createCommunityPost;
};

export const createCommunityComment = async (input: {
  postId: string;
  body: string;
}): Promise<CommunityComment> => {
  const data = await graphQLRequest<{ createCommunityComment: CommunityComment }>(
    gql`
      mutation CreateCommunityComment($input: CreateCommunityCommentInput!) {
        createCommunityComment(input: $input) {
          id
          postId
          authorName
          body
          createdAt
        }
      }
    `,
    { input },
  );

  return data.createCommunityComment;
};

export const getCommunityProfile = async (): Promise<CommunityProfile> => {
  const data = await graphQLRequest<{ communityProfile: CommunityProfile }>(gql`
    query CommunityProfile {
      communityProfile {
        name
      }
    }
  `);

  return data.communityProfile;
};

export const updateCommunityProfile = async (input: {
  name: string;
}): Promise<CommunityProfile> => {
  const data = await graphQLRequest<{ updateCommunityProfile: CommunityProfile }>(
    gql`
      mutation UpdateCommunityProfile($input: UpdateCommunityProfileInput!) {
        updateCommunityProfile(input: $input) {
          name
        }
      }
    `,
    { input },
  );

  return data.updateCommunityProfile;
};

export const reportCommunityPost = async (input: {
  postId: string;
  reason: string;
}): Promise<boolean> => {
  const data = await graphQLRequest<{ reportCommunityPost: boolean }>(
    gql`
      mutation ReportCommunityPost($input: ReportCommunityPostInput!) {
        reportCommunityPost(input: $input)
      }
    `,
    { input },
  );

  return data.reportCommunityPost;
};
