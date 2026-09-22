import type { QueryClient } from "@tanstack/react-query";

import { COMMUNITY_POSTS_QUERY_KEY, fetchCommunityPosts } from "@/pages/community";

import { graphqlEndpoint } from "../graphql-upstream";

export const primeCommunityPosts = async (queryClient: QueryClient, authorization?: string) => {
  await queryClient.prefetchQuery({
    queryKey: COMMUNITY_POSTS_QUERY_KEY,
    queryFn: () => fetchCommunityPosts({ authorization, endpoint: graphqlEndpoint }),
  });
  const state = queryClient.getQueryState(COMMUNITY_POSTS_QUERY_KEY);
  if (state?.status !== "success") {
    queryClient.removeQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
  }
};
