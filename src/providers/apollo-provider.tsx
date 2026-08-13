import { ApolloProvider as Provider } from "@apollo/client/react";
import type { PropsWithChildren } from "react";

import { apolloClient } from "@/shared/graphql";

export const ApolloProvider = ({ children }: PropsWithChildren) => (
  <Provider client={apolloClient}>{children}</Provider>
);
