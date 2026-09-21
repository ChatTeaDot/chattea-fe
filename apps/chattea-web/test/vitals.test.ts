import { describe, expect, it } from "vitest";

import { createApp } from "@/app/create-app";
import { VITALS_PATH } from "@/shared/config/constants";

const TEMPLATE = `<!doctype html><html><body><div id="root"><!--app-html--></div></body></html>`;

const render = async () => {};

describe("vitals endpoint", () => {
  it("accepts metric beacons and aggregates them in memory", async () => {
    const app = await createApp({ loadTemplate: async () => TEMPLATE, render });

    const beacon = await app.inject({
      method: "POST",
      url: VITALS_PATH,
      payload: { name: "LCP", value: 1200 },
    });
    expect(beacon.statusCode).toBe(200);
    await app.inject({
      method: "POST",
      url: VITALS_PATH,
      payload: { name: "LCP", value: 800 },
    });
    await app.inject({
      method: "POST",
      url: VITALS_PATH,
      payload: { name: "TTFB", value: 150 },
    });

    const summary = await app.inject({ method: "GET", url: VITALS_PATH });
    expect(summary.statusCode).toBe(200);
    const body = summary.json() as Record<
      string,
      { count: number; min: number; p50: number; p75: number; max: number }
    >;
    expect(body.LCP).toMatchObject({ count: 2, min: 800, max: 1200 });
    expect(body.TTFB).toMatchObject({ count: 1, p50: 150 });

    await app.close();
  });

  it("ignores beacons for unknown metric names", async () => {
    const app = await createApp({ loadTemplate: async () => TEMPLATE, render });

    await app.inject({
      method: "POST",
      url: VITALS_PATH,
      payload: { name: "BOGUS", value: 1 },
    });

    const summary = await app.inject({ method: "GET", url: VITALS_PATH });
    expect(summary.json()).not.toHaveProperty("BOGUS");

    await app.close();
  });
});
