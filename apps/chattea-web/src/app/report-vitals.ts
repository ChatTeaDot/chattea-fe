import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

import { VITALS_PATH } from "@/shared/config/constants";

const beacon = (metric: Metric) => {
  const body = JSON.stringify({ name: metric.name, value: metric.value });
  navigator.sendBeacon(
    VITALS_PATH,
    new Blob([body], { type: "application/json" }),
  );
};

export const reportVitals = () => {
  onCLS(beacon);
  onFCP(beacon);
  onINP(beacon);
  onLCP(beacon);
  onTTFB(beacon);
};
