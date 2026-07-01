import { PropsWithChildren } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ObservabilityProvider } from "./observability-provider";
import { QueryProvider } from "./query-provider";
import { SessionProvider } from "./session-provider";

export const RootProvider = ({ children }: PropsWithChildren) => (
  <ObservabilityProvider>
    <QueryProvider>
      <KeyboardProvider>
        <SessionProvider>{children}</SessionProvider>
      </KeyboardProvider>
    </QueryProvider>
  </ObservabilityProvider>
);
