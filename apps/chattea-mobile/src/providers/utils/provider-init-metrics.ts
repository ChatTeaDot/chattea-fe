import { useEffect, useState } from "react";

export type ProviderInitMetric = {
  durationMs: number;
  endMs: number;
  name: string;
  startMs: number;
};

export type StartupMilestone = {
  atMs: number;
  name: string;
};

const metrics: ProviderInitMetric[] = [];
const milestones: StartupMilestone[] = [];
const starts = new Map<string, number>();

const now = (): number => (typeof performance === "undefined" ? Date.now() : performance.now());

const traceMark = (name: string) => {
  if (typeof performance !== "undefined" && typeof performance.mark === "function") {
    performance.mark(name);
  }
};

export const markProviderInitStart = (name: string): number => {
  const startMs = now();
  starts.set(name, startMs);
  traceMark(`provider:${name}:start`);
  return startMs;
};

export const markProviderInitEnd = (name: string, startMs?: number): ProviderInitMetric | null => {
  const resolvedStart = startMs ?? starts.get(name);
  if (resolvedStart === undefined) return null;
  starts.delete(name);
  const endMs = now();
  const metric: ProviderInitMetric = {
    durationMs: endMs - resolvedStart,
    endMs,
    name,
    startMs: resolvedStart,
  };
  metrics.push(metric);
  traceMark(`provider:${name}:end`);
  return metric;
};

export const measureProviderInit = async <Value>(
  name: string,
  task: () => Value | Promise<Value>,
): Promise<Value> => {
  const startMs = markProviderInitStart(name);
  try {
    return await task();
  } finally {
    markProviderInitEnd(name, startMs);
  }
};

export const markStartupMilestone = (name: string): number => {
  const atMs = now();
  milestones.push({ atMs, name });
  traceMark(`startup:${name}`);
  return atMs;
};

export const getProviderInitMetrics = (): ProviderInitMetric[] => [...metrics];

export const getStartupMilestones = (): StartupMilestone[] => [...milestones];

export const resetStartupMetrics = (): void => {
  metrics.length = 0;
  milestones.length = 0;
  starts.clear();
};

export const useProviderInitMetric = (name: string): void => {
  const [startMs] = useState(() => markProviderInitStart(name));
  useEffect(() => {
    markProviderInitEnd(name, startMs);
  }, [name, startMs]);
};
