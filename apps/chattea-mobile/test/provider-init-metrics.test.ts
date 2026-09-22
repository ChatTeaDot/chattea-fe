import { beforeEach, describe, expect, it } from "vitest";

import {
  getProviderInitMetrics,
  getStartupMilestones,
  markProviderInitEnd,
  markProviderInitStart,
  markStartupMilestone,
  measureProviderInit,
  resetStartupMetrics,
} from "../src/providers/utils/provider-init-metrics";

describe("provider init metrics", () => {
  beforeEach(() => {
    resetStartupMetrics();
  });

  it("records a provider metric between start and end marks", () => {
    const start = markProviderInitStart("apollo");
    const metric = markProviderInitEnd("apollo");

    expect(metric).not.toBeNull();
    expect(metric?.name).toBe("apollo");
    expect(metric?.startMs).toBe(start);
    expect(metric?.durationMs).toBeGreaterThanOrEqual(0);
    expect(getProviderInitMetrics()).toEqual([metric]);
  });

  it("returns null when ending a provider that never started", () => {
    expect(markProviderInitEnd("missing")).toBeNull();
    expect(getProviderInitMetrics()).toEqual([]);
  });

  it("resolves the task result and records its duration", async () => {
    const result = await measureProviderInit("revenuecat:sync", async () => "ready");

    expect(result).toBe("ready");
    expect(getProviderInitMetrics().map((metric) => metric.name)).toEqual(["revenuecat:sync"]);
  });

  it("records the metric even when the task rejects", async () => {
    await expect(
      measureProviderInit("push-notifications:register", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(getProviderInitMetrics().map((metric) => metric.name)).toEqual([
      "push-notifications:register",
    ]);
  });

  it("records startup milestones in order", () => {
    markStartupMilestone("app:first-commit");
    markStartupMilestone("app:first-interactive");

    const milestones = getStartupMilestones();
    expect(milestones.map((milestone) => milestone.name)).toEqual([
      "app:first-commit",
      "app:first-interactive",
    ]);
    expect(milestones[1]?.atMs ?? -1).toBeGreaterThanOrEqual(milestones[0]?.atMs ?? 0);
  });

  it("clears metrics and milestones on reset", () => {
    markProviderInitStart("apollo");
    markProviderInitEnd("apollo");
    markStartupMilestone("app:first-commit");

    resetStartupMetrics();

    expect(getProviderInitMetrics()).toEqual([]);
    expect(getStartupMilestones()).toEqual([]);
  });
});
