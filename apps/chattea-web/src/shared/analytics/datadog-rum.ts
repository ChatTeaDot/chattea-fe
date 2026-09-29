import { API_GRAPHQL_PATH } from "@/shared/config/constants";

import {
  DATADOG_APPLICATION_ID,
  DATADOG_CLIENT_TOKEN,
  DATADOG_SITE,
  SERVICE_ENV,
  SERVICE_NAME,
} from "./constants";

export const initDatadogRum = () => {
  const applicationId = DATADOG_APPLICATION_ID;
  const clientToken = DATADOG_CLIENT_TOKEN;
  if (!applicationId || !clientToken || typeof window === "undefined") return;

  void import("@datadog/browser-rum").then(({ datadogRum }) => {
    datadogRum.init({
      applicationId,
      clientToken,
      site: DATADOG_SITE,
      service: SERVICE_NAME,
      env: SERVICE_ENV,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 0,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
      allowedTracingUrls: [
        { match: API_GRAPHQL_PATH, propagatorTypes: ["tracecontext", "datadog"] },
      ],
    });
  });
};
