import { ApolloProvider as Provider } from "@apollo/client/react";
import type { PropsWithChildren } from "react";

import { apolloClient } from "@/shared/graphql";

const ApolloProvider = ({ children }: PropsWithChildren) => {
  return <Provider client={apolloClient}>{children}</Provider>;
};

export default ApolloProvider;
