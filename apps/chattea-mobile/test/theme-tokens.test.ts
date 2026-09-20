import { describe, expect, it } from "vitest";

import { colors, darkColors, radii, spacing } from "../src/theme/constants";

describe("adaptive themes", () => {
  it("keeps both theme slots on the same semantic token surface", () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(colors).sort());
    expect(spacing.screen).toBeGreaterThan(0);
    expect(radii.card).toBeGreaterThan(radii.utility);
  });
});
