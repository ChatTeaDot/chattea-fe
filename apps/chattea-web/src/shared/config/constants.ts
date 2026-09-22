export const WEB_DEV_PORT = 3000;

export const COMMUNITY_PATH = "/community";

export const VITALS_PATH = "/vitals";

export const VITAL_METRIC_NAMES = ["LCP", "FCP", "INP", "CLS", "TTFB"] as const;

export const API_GRAPHQL_PATH = "/api/graphql";

export const graphqlEndpoint = process.env.GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const COMMUNITY_NAVIGATE_MESSAGE_TYPE = "chattea.community.navigate";

export const COMMUNITY_NEW_PATH = "/community/new";

export const COMMUNITY_POST_PATH_PREFIX = "/community/";
