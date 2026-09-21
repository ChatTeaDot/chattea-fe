import { scale } from "./scale";
import { darkSemantic, semantic } from "./semantic";

export const palette = scale;

export const colors = {
  background: semantic.bg.layerDefault,
  surface: semantic.bg.layerFill,
  surfaceSoft: semantic.bg.neutralWeak,
  surfaceRaised: semantic.bg.layerFloating,
  text: semantic.fg.neutral,
  body: semantic.fg.neutral,
  muted: semantic.fg.neutralMuted,
  border: semantic.stroke.neutralMuted,
  primary: semantic.fg.brand,
  primaryText: semantic.fg.brandContrast,
  secondary: semantic.fg.neutral,
  accent: semantic.bg.brandSolid,
  accentPressed: semantic.bg.brandSolidPressed,
  accentSoft: semantic.bg.brandWeak,
  accentText: semantic.fg.brandContrast,
  danger: semantic.fg.critical,
  kakao: semantic.bg.kakao,
  kakaoText: scale.kakaoText,
  ripple: "#ffffff33",
  transparent: semantic.bg.transparent,
  overlay: semantic.bg.overlay,
  planBasic: semantic.bg.informativeWeak,
  planBasicBorder: semantic.stroke.informativeWeak,
  planGold: semantic.bg.warningWeak,
  planGoldBorder: semantic.stroke.warningSolid,
  planBlack: scale.gray950,
  shadow: "#000000",
};

export const darkColors = {
  background: darkSemantic.bg.layerDefault,
  surface: darkSemantic.bg.layerFill,
  surfaceSoft: darkSemantic.bg.neutralWeak,
  surfaceRaised: darkSemantic.bg.layerFloating,
  text: darkSemantic.fg.neutral,
  body: darkSemantic.fg.neutral,
  muted: darkSemantic.fg.neutralMuted,
  border: darkSemantic.stroke.neutralMuted,
  primary: darkSemantic.fg.brand,
  primaryText: darkSemantic.fg.brandContrast,
  secondary: darkSemantic.fg.neutral,
  accent: darkSemantic.bg.brandSolid,
  accentPressed: darkSemantic.bg.brandSolidPressed,
  accentSoft: darkSemantic.bg.brandWeak,
  accentText: darkSemantic.fg.brandContrast,
  danger: darkSemantic.fg.critical,
  kakao: darkSemantic.bg.kakao,
  kakaoText: scale.kakaoText,
  ripple: "#ffffff33",
  transparent: darkSemantic.bg.transparent,
  overlay: darkSemantic.bg.overlay,
  planBasic: darkSemantic.bg.informativeWeak,
  planBasicBorder: darkSemantic.stroke.informativeWeak,
  planGold: darkSemantic.bg.warningWeak,
  planGoldBorder: darkSemantic.stroke.warningSolid,
  planBlack: scale.gray950,
  shadow: "#000000",
};

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
