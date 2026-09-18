export const palette = {
  canvas: "#ffffff",
  surface1: "#F5F5F7",
  surface2: "#E9E9EE",
  ink: "#111827",
  muted: "#6B7280",
  hairline: "#E5E7EB",
  accent: "#EC4899",
  accentPressed: "#D4358A",
  danger: "#DC2626",
  kakao: "#FEE500",
  kakaoText: "#191919",
} as const;

export const colors = {
  background: palette.canvas,
  surface: palette.surface1,
  surfaceSoft: palette.surface2,
  surfaceRaised: palette.canvas,
  text: palette.ink,
  body: palette.ink,
  muted: palette.muted,
  border: palette.hairline,
  primary: palette.accent,
  primaryText: palette.canvas,
  secondary: palette.ink,
  accent: palette.accent,
  accentPressed: palette.accentPressed,
  accentSoft: "rgba(236, 72, 153, 0.1)",
  accentText: palette.canvas,
  danger: palette.danger,
  kakao: palette.kakao,
  kakaoText: palette.kakaoText,
  ripple: "#ffffff33",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
  planBasic: "#e8f2ff",
  planBasicBorder: "#9cc6ff",
  planGold: "#fff4cc",
  planGoldBorder: "#e7bc45",
  planBlack: "#07080b",
  shadow: "#000000",
};

export const darkColors = { ...colors };

export const spacing = {
  xs: 4,
  sm: 8,
  control: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 16,
  section: 24,
  card: 16,
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  utility: 12,
  card: 20,
  cta: 9999,
  pill: 9999,
};

export const typography = {
  display: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
  h1: { fontSize: 24, lineHeight: 31, fontWeight: "700" as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  bodySm: { fontSize: 14, lineHeight: 21, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "400" as const },
  label: { fontSize: 13, lineHeight: 20, fontWeight: "500" as const },
  title: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
};

export const sizes = {
  tapMin: 44,
  appBar: 56,
  tabBar: 49,
  bottomCta: 56,
  buttonSm: 36,
  buttonMd: 44,
  buttonLg: 52,
};

export const motion = { fast: 150, base: 200, sheet: 250 };

export const minimumTouchTarget = 44;
