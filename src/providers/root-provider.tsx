import type { PropsWithChildren } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ApolloProvider } from "./apollo-provider";
import { ObservabilityProvider } from "./observability-provider";
import { SessionProvider } from "./session-provider";

export const RootProvider = ({ children }: PropsWithChildren) => (
  <ObservabilityProvider>
    <ApolloProvider>
      <KeyboardProvider>
        <SessionProvider>{children}</SessionProvider>
      </KeyboardProvider>
    </ApolloProvider>
  </ObservabilityProvider>
);
