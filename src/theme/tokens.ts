/** ChatTea's platform-neutral design primitives. Keep raw values in this file only. */
export const palette = {
  primary: "#5c46ff",
  magenta: "#f323ff",
  ink: "#292930",
  body: "#000008",
  muted: "#75757a",
  canvas: "#ffffff",
  surface: "#f5f5f6",
  surfaceAlt: "#f8f8fa",
  hairline: "#e0e0e1",
  onPrimary: "#ffffff",
  danger: "#c93445",
  success: "#23845b",
} as const;

// Semantic aliases keep existing feature code on one system while it is migrated.
export const colors = {
  background: palette.canvas,
  surface: palette.surface,
  surfaceSoft: palette.surfaceAlt,
  text: palette.ink,
  body: palette.body,
  muted: palette.muted,
  border: palette.hairline,
  primary: palette.primary,
  primaryText: palette.onPrimary,
  secondary: palette.ink,
  accent: palette.magenta,
  accentText: palette.body,
  danger: palette.danger,
  success: palette.success,
  ripple: "#ffffff33",
  transparent: "transparent",
  planBasic: "#e8f2ff",
  planBasicBorder: "#9cc6ff",
  planGold: "#fff4cc",
  planGoldBorder: "#e7bc45",
  planBlack: "#07080b",
  shadow: palette.primary,
};

export const darkColors = {
  ...colors,
  background: "#000008",
  surface: "#1c1c20",
  surfaceSoft: "#24242a",
  text: "#f7f7f8",
  body: "#ffffff",
  muted: "#aaaab0",
  border: "#38383e",
  ripple: "#ffffff24",
  transparent: "transparent",
  planBasic: "#17263a",
  planBasicBorder: "#38689a",
  planGold: "#342d17",
  planGoldBorder: "#806b31",
  planBlack: "#07080b",
};

export const spacing = { xs: 4, sm: 8, control: 10, md: 16, lg: 24, screen: 34, xl: 48, xxl: 64 };
export const radii = { utility: 8, card: 24, cta: 30, pill: 9999 };
export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800" as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: "400" as const },
  label: { fontSize: 15, lineHeight: 20, fontWeight: "700" as const },
};
export const minimumTouchTarget = 44;
