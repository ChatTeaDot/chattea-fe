import { Stack } from "expo-router";
import { ObservabilityProvider, withSentry } from "../providers/observability-provider";
import { QueryProvider } from "../providers/query-provider";
import { SessionProvider } from "../providers/session-provider";

function RootLayout() {
  return (
    <ObservabilityProvider>
      <QueryProvider>
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SessionProvider>
      </QueryProvider>
    </ObservabilityProvider>
  );
}

export default withSentry(RootLayout);
