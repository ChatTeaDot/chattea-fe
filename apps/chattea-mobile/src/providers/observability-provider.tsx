import {
  DatadogProvider,
  DatadogProviderConfiguration,
  TrackingConsent,
} from "@datadog/mobile-react-native";
import * as Sentry from "@sentry/react-native";
import { PropsWithChildren, useEffect, useMemo } from "react";

import {
  datadogClientToken,
  datadogRumApplicationId,
  sentryDsn,
  serviceEnv,
  serviceName,
  serviceVersion,
} from "./constants";
import { measureProviderInit, useProviderInitMetric } from "./utils/provider-init-metrics";

let sentryStarted = false;

const initSentry = () => {
  if (sentryStarted || !sentryDsn) return;
  sentryStarted = true;
  Sentry.init({
    dsn: sentryDsn,
    environment: serviceEnv,
    release: serviceVersion,
    tracesSampleRate: 0.2,
  });
};

const ObservabilityProvider = ({ children }: PropsWithChildren) => {
  useProviderInitMetric("observability");

  useEffect(() => {
    const id = requestIdleCallback(() => {
      void measureProviderInit("observability:sentry", initSentry);
    });
    return () => cancelIdleCallback(id);
  }, []);

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
