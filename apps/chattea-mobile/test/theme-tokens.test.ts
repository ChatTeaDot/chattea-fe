import { describe, expect, it } from "vitest";

import { colors, darkColors, radii, spacing } from "../src/theme/constants";

describe("adaptive themes", () => {
  it("keeps the confirmed light palette for both theme slots", () => {
    expect(darkColors).toEqual(colors);
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(colors).sort());
    expect(spacing.screen).toBeGreaterThan(0);
    expect(radii.card).toBeGreaterThan(radii.utility);
  });
});
