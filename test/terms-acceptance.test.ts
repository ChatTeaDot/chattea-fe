import { describe, expect, it, vi } from "vitest";

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
    const { TermsAcceptance } = await import("../src/features/auth/components/terms-acceptance");
    const onChange = vi.fn();
    const element = TermsAcceptance({ accepted: false, onChange });

    expect(element.props.accessibilityRole).toBe("checkbox");
    expect(element.props.accessibilityState).toEqual({ checked: false });
    element.props.onPress();
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
