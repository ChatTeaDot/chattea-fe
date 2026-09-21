import { createElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("react-native", () => ({ Pressable: "Pressable", Text: "Text" }));
vi.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: () => ({
      control: "control",
      indicator: "indicator",
      indicatorChecked: "indicatorChecked",
      label: "label",
    }),
  },
}));

describe("terms acceptance", () => {
  it("exposes and toggles an accessible checkbox", async () => {
    const { default: TermsAcceptance } =
      await import("../src/features/auth/components/terms-acceptance");
    const onChange = vi.fn();
    let renderer: TestRenderer.ReactTestRenderer | undefined;
    act(() => {
      renderer = TestRenderer.create(createElement(TermsAcceptance, { accepted: false, onChange }));
    });
    const element = renderer?.root.findByProps({ accessibilityRole: "checkbox" });

    expect(element?.props.accessibilityRole).toBe("checkbox");
    expect(element?.props.accessibilityState).toEqual({ checked: false });
    act(() => element?.props.onPress());
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
