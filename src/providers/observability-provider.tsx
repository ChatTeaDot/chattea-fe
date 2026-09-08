import {
  DatadogProvider,
  DatadogProviderConfiguration,
  TrackingConsent,
} from "@datadog/mobile-react-native";
import * as Sentry from "@sentry/react-native";
import { PropsWithChildren, useMemo } from "react";

import {
  datadogClientToken,
  datadogRumApplicationId,
  sentryDsn,
  serviceEnv,
  serviceName,
  serviceVersion,
} from "./constants";

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: serviceEnv,
    release: serviceVersion,
    tracesSampleRate: 0.2,
  });
}

const ObservabilityProvider = ({ children }: PropsWithChildren) => {
  const datadogConfig = useMemo(() => {
    if (!datadogClientToken || !datadogRumApplicationId) {
      return null;
    }

    const config = new DatadogProviderConfiguration(
      datadogClientToken,
      serviceEnv,
      TrackingConsent.GRANTED,
      {
        rumConfiguration: {
          applicationId: datadogRumApplicationId,
          nativeCrashReportEnabled: true,
          sessionSampleRate: 100,
          trackErrors: true,
          trackInteractions: true,
          trackResources: true,
        },
        service: serviceName,
        version: serviceVersion,
      },
    );

    return config;
  }, []);

  if (!datadogConfig) {
    return children;
  }

  return <DatadogProvider configuration={datadogConfig}>{children}</DatadogProvider>;
};

export const withSentry = sentryDsn ? Sentry.wrap : <T,>(component: T) => component;

export default ObservabilityProvider;
