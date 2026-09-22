import { queryOptions } from "@tanstack/react-query";

import { API_GRAPHQL_PATH } from "@/shared/config/constants";

import { COMMUNITY_POSTS_STALE_TIME_MS } from "./constants";
import type { CommunityPost } from "./types";

const COMMUNITY_POSTS_QUERY = `
  query WebCommunityPosts {
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

export const COMMUNITY_POSTS_QUERY_KEY = ["community", "posts"] as const;

type CommunityPostsResponse = {
  data?: { communityPosts?: CommunityPost[] };
};

type FetchCommunityPostsOptions = {
  endpoint: string;
  authorization?: string;
};

export const fetchCommunityPosts = async ({
  authorization,
  endpoint,
}: FetchCommunityPostsOptions): Promise<CommunityPost[]> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify({ query: COMMUNITY_POSTS_QUERY }),
  });
  if (!response.ok) throw new Error(`COMMUNITY_POSTS_${response.status}`);
  const payload = (await response.json()) as CommunityPostsResponse;
  if (!payload.data?.communityPosts) throw new Error("COMMUNITY_POSTS_INVALID");
  return payload.data.communityPosts;
};

const clientAuthorization = () =>
  typeof window === "undefined" ? undefined : window.__CHATTEA_AUTH__?.authorization;

export const communityPostsQuery = () =>
  queryOptions({
    queryKey: COMMUNITY_POSTS_QUERY_KEY,
    staleTime: COMMUNITY_POSTS_STALE_TIME_MS,
    queryFn: () =>
      fetchCommunityPosts({
        authorization: clientAuthorization(),
        endpoint: API_GRAPHQL_PATH,
      }),
  });
