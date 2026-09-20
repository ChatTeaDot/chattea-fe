import { colors, darkColors, radii, spacing } from "@chattea/design-system/theme/constants";
import { describe, expect, it } from "vitest";

describe("adaptive themes", () => {
  it("keeps both theme slots on the same semantic token surface", () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(colors).sort());
    expect(spacing.screen).toBeGreaterThan(0);
    expect(radii.card).toBeGreaterThan(radii.utility);
  });
});
