import { queryOptions } from "@tanstack/react-query";

import { API_GRAPHQL_PATH } from "@/shared/config/constants";

import { requestAuthRefresh } from "./bridge";
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

type CommunityPostsResponse = {
  data?: { communityPosts?: CommunityPost[] };
};

const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
  const authorization =
    typeof window === "undefined" ? undefined : window.__CHATTEA_AUTH__?.authorization;
  const response = await fetch(API_GRAPHQL_PATH, {
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

export const communityPostsQuery = () =>
  queryOptions({
    queryKey: ["community", "posts"],
    queryFn: async (): Promise<CommunityPost[]> => {
      try {
        return await fetchCommunityPosts();
      } catch (error) {
        if (!(error instanceof Error) || error.message !== "COMMUNITY_POSTS_401") throw error;
        if (!(await requestAuthRefresh())) throw error;
        return fetchCommunityPosts();
      }
    },
  });
