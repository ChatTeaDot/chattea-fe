import { GraphQLClient } from "graphql-request";
import type { Client } from "graphql-ws";
import { createClient } from "graphql-ws";

export type Requester = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>;

const endpoint = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";
const subscriptionEndpoint =
  process.env.EXPO_PUBLIC_GRAPHQL_WS_URL ?? endpoint.replace(/^http/, "ws");
const graphQLClient = new GraphQLClient(endpoint);

let sessionToken: string | null = null;
let requestGraphQL: Requester = (query, variables) => graphQLClient.request(query, variables);
let createSubscriptionClient = () =>
  createClient({
    url: subscriptionEndpoint,
    connectionParams: getGraphQLAuthorizationHeaders,
    retryAttempts: 5,
    retryWait: async (retries) => {
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** retries, 10000)));
    },
    shouldRetry: () => true,
  });

export const setGraphQLRequester = (requester: Requester) => {
  requestGraphQL = requester;
};

export const setGraphQLSessionToken = (token: string | null) => {
  sessionToken = token;
  graphQLClient.setHeaders(getGraphQLAuthorizationHeaders());
};

export const getGraphQLAuthorizationHeaders = (): Record<string, string> => {
  return sessionToken ? { authorization: `Bearer ${sessionToken}` } : {};
};

export const graphQLRequest = <T>(query: string, variables?: Record<string, unknown>) => {
  return requestGraphQL<T>(query, variables);
};

export const createGraphQLSubscriptionClient = () => {
  return createSubscriptionClient();
};

export const setGraphQLSubscriptionClientFactory = (factory: () => Pick<Client, "subscribe">) => {
  createSubscriptionClient = factory as () => Client;
};
