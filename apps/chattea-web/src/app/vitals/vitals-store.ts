import { VITAL_METRIC_NAMES } from "@/shared/config/constants";

type VitalSample = {
  name: string;
  value: number;
};

type VitalSummary = {
  count: number;
  min: number;
  p50: number;
  p75: number;
  max: number;
};

const percentile = (sorted: number[], ratio: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil(ratio * sorted.length) - 1)] ?? 0;

const isVitalSample = (body: unknown): body is VitalSample => {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const { name, value } = body as Record<string, unknown>;
  return (
    typeof name === "string" &&
    (VITAL_METRIC_NAMES as readonly string[]).includes(name) &&
    typeof value === "number" &&
    Number.isFinite(value)
  );
};

export const createVitalsStore = () => {
  const samples = new Map<string, number[]>();

  const record = (body: unknown) => {
    if (!isVitalSample(body)) {
      return false;
    }
    const values = samples.get(body.name) ?? [];
    values.push(body.value);
    samples.set(body.name, values);
    return true;
  };

  const summarize = () => {
    const summary: Record<string, VitalSummary> = {};
    for (const [name, values] of samples) {
      const sorted = [...values].sort((a, b) => a - b);
      summary[name] = {
        count: sorted.length,
        min: sorted[0] ?? 0,
        p50: percentile(sorted, 0.5),
        p75: percentile(sorted, 0.75),
        max: sorted[sorted.length - 1] ?? 0,
      };
    }
    return summary;
  };

  return { record, summarize };
};

export type VitalsStore = ReturnType<typeof createVitalsStore>;
