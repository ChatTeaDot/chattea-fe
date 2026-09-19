import { gql } from "@apollo/client";

export const COMMUNITY_POSTS_QUERY = gql`
  query NativeCommunityPosts {
    communityPosts {
      id
      authorName
      title
      body
      commentCount
      createdAt
    }
  }
`;

export const COMMUNITY_COMMENTS_QUERY = gql`
  query NativeCommunityComments($postId: String!) {
    communityComments(postId: $postId) {
      id
      postId
      authorName
      body
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_POST_MUTATION = gql`
  mutation NativeCreateCommunityPost($input: CreateCommunityPostInput!) {
    createCommunityPost(input: $input) {
      id
      authorName
      title
      body
      commentCount
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_COMMENT_MUTATION = gql`
  mutation NativeCreateCommunityComment($input: CreateCommunityCommentInput!) {
    createCommunityComment(input: $input) {
      id
      postId
      authorName
      body
      createdAt
    }
  }
`;

export const REPORT_COMMUNITY_POST_MUTATION = gql`
  mutation NativeReportCommunityPost($input: ReportCommunityPostInput!) {
    reportCommunityPost(input: $input)
  }
`;

export const REPORT_COMMUNITY_COMMENT_MUTATION = gql`
  mutation NativeReportCommunityComment($input: ReportCommunityCommentInput!) {
    reportCommunityComment(input: $input)
  }
`;
