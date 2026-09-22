import { ApolloProvider as Provider } from "@apollo/client/react";
import type { PropsWithChildren } from "react";

import { apolloClient } from "@/shared/graphql";

import { useProviderInitMetric } from "./utils/provider-init-metrics";

const ApolloProvider = ({ children }: PropsWithChildren) => {
  useProviderInitMetric("apollo");
  return <Provider client={apolloClient}>{children}</Provider>;
};

export default ApolloProvider;
