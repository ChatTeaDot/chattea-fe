import {
  DatadogProvider,
  DatadogProviderConfiguration,
  TrackingConsent,
} from "@datadog/mobile-react-native";
import * as Sentry from "@sentry/react-native";
import { PropsWithChildren, useMemo } from "react";

const serviceName = "chattea-fe";
const serviceEnv = process.env.EXPO_PUBLIC_SERVICE_ENV ?? "development";
const serviceVersion = process.env.EXPO_PUBLIC_SERVICE_VERSION ?? "dev";
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const datadogClientToken = process.env.EXPO_PUBLIC_DATADOG_CLIENT_TOKEN;
const datadogRumApplicationId = process.env.EXPO_PUBLIC_DATADOG_RUM_APPLICATION_ID;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: serviceEnv,
    release: serviceVersion,
    tracesSampleRate: 0.2,
  });
}

export const ObservabilityProvider = ({ children }: PropsWithChildren) => {
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
