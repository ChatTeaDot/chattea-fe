import type { PropsWithChildren } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

import ApolloProvider from "./apollo-provider";
import ObservabilityProvider from "./observability-provider";
import SessionProvider from "./session-provider";
import { useProviderInitMetric } from "./utils/provider-init-metrics";

const RootProvider = ({ children }: PropsWithChildren) => {
  useProviderInitMetric("root");
  return (
    <ObservabilityProvider>
      <ApolloProvider>
        <KeyboardProvider>
          <SessionProvider>{children}</SessionProvider>
        </KeyboardProvider>
      </ApolloProvider>
    </ObservabilityProvider>
  );
};

export default RootProvider;
