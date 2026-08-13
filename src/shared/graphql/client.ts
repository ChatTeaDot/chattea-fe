import type { ApolloLink } from "@apollo/client";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const endpoint = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

let sessionToken: string | null = null;

export const getGraphQLAuthorizationHeaders = (): Record<string, string> =>
  sessionToken ? { authorization: `Bearer ${sessionToken}` } : {};

const createTransportLink = (): ApolloLink => {
  const httpLink = new HttpLink({ uri: endpoint });
  const authLink = new SetContextLink(({ headers }) => ({
    headers: {
      ...headers,
      ...getGraphQLAuthorizationHeaders(),
    },
  }));

  return authLink.concat(httpLink);
};

export const createApolloClient = (link: ApolloLink = createTransportLink()) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

export const apolloClient = createApolloClient();

export const setGraphQLSessionToken = (token: string | null) => {
  if (sessionToken !== token) {
    apolloClient.cache.restore({});
  }
  sessionToken = token;
};
