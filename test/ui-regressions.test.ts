import { describe, expect, it } from "vitest";

import { getContentViewState } from "../src/shared/components/view-state";
import { colors, darkColors, radii, spacing } from "../src/theme/tokens";

describe("UI state priority", () => {
  it("never renders Likes empty over an error", () => {
    expect(getContentViewState(false, true, 0)).toBe("error");
    expect(getContentViewState(true, true, 0)).toBe("loading");
  });
  it("prioritizes Profile loading and error before empty", () => {
    expect(getContentViewState(true, true, 0)).toBe("loading");
    expect(getContentViewState(false, true, 0)).toBe("error");
    expect(getContentViewState(false, false, 0)).toBe("empty");
  });
});

describe("adaptive themes", () => {
  it("provides distinct semantic surfaces with identical token boundaries", () => {
    expect(darkColors.background).not.toBe(colors.background);
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(colors).sort());
    expect(spacing.screen).toBeGreaterThan(0);
    expect(radii.card).toBeGreaterThan(radii.utility);
  });
});
