import { queryOptions } from "@tanstack/react-query";

import { API_GRAPHQL_PATH } from "@/shared/config/constants";

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

export const communityPostsQuery = () =>
  queryOptions({
    queryKey: ["community", "posts"],
    queryFn: async (): Promise<CommunityPost[]> => {
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
    },
  });
