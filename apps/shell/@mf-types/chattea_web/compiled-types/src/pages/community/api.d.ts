import type { CommunityPost } from "./types";
export declare const COMMUNITY_POSTS_QUERY_KEY: readonly ["community", "posts"];
type FetchCommunityPostsOptions = {
    endpoint: string;
    authorization?: string;
};
export declare const fetchCommunityPosts: ({ authorization, endpoint, }: FetchCommunityPostsOptions) => Promise<CommunityPost[]>;
export declare const communityPostsQuery: () => import("@tanstack/react-query").OmitKeyof<import("@tanstack/react-query").UseQueryOptions<CommunityPost[], Error, CommunityPost[], readonly ["community", "posts"]>, "queryFn"> & {
    queryFn?: import("@tanstack/react-query").QueryFunction<CommunityPost[], readonly ["community", "posts"], never> | undefined;
} & import("@tanstack/react-query").QueryKeyWithDataTag<readonly ["community", "posts"], CommunityPost[], Error>;
export {};
