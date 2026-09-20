import { scale } from "./scale";

export const fg = {
  brand: scale.pink500,
  brandContrast: scale.gray00,
  neutral: scale.gray900,
  neutralMuted: scale.gray600,
  neutralSubtle: scale.gray500,
  neutralInverted: scale.gray00,
  disabled: scale.gray400,
  placeholder: scale.gray500,
  critical: scale.red600,
  positive: scale.green600,
  informative: scale.blue600,
  warning: scale.yellow600,
} as const;

export const bg = {
  layerBasement: scale.gray100,
  layerDefault: scale.gray00,
  layerFill: scale.gray50,
  layerFloating: scale.gray00,
  brandSolid: scale.pink500,
  brandSolidPressed: scale.pink600,
  brandWeak: scale.pink50,
  brandWeakPressed: scale.pink100,
  neutralSolid: scale.gray900,
  neutralSolidMuted: scale.gray700,
  neutralWeak: scale.gray100,
  neutralWeakPressed: scale.gray200,
  disabled: scale.gray100,
  criticalSolid: scale.red600,
  criticalSolidPressed: scale.red700,
  criticalWeak: scale.red50,
  positiveSolid: scale.green600,
  positiveWeak: scale.green50,
  informativeSolid: scale.blue600,
  informativeWeak: scale.blue50,
  warningSolid: scale.yellow500,
  warningWeak: scale.yellow50,
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayMuted: "rgba(0, 0, 0, 0.3)",
  transparent: "transparent",
  kakao: scale.kakao,
} as const;

export const stroke = {
  brandSolid: scale.pink500,
  brandWeak: scale.pink200,
  neutralSolid: scale.gray300,
  neutralMuted: scale.gray200,
  neutralSubtle: scale.gray100,
  neutralContrast: scale.gray900,
  criticalSolid: scale.red600,
  criticalWeak: scale.red200,
  positiveSolid: scale.green600,
  positiveWeak: scale.green200,
  informativeSolid: scale.blue600,
  informativeWeak: scale.blue200,
  warningSolid: scale.yellow500,
  warningWeak: scale.yellow200,
  focusRing: scale.pink400,
} as const;

export const divider = {
  subtle: scale.gray100,
  neutral: scale.gray200,
  strong: scale.gray300,
} as const;

export const semantic = { fg, bg, stroke, divider } as const;

export const darkFg = {
  brand: scale.pink400,
  brandContrast: scale.gray950,
  neutral: scale.gray100,
  neutralMuted: scale.gray500,
  neutralSubtle: scale.gray600,
  neutralInverted: scale.gray900,
  disabled: scale.gray600,
  placeholder: scale.gray600,
  critical: scale.red400,
  positive: scale.green400,
  informative: scale.blue400,
  warning: scale.yellow400,
} as const;

export const darkBg = {
  layerBasement: scale.gray950,
  layerDefault: scale.gray950,
  layerFill: scale.gray900,
  layerFloating: scale.gray900,
  brandSolid: scale.pink500,
  brandSolidPressed: scale.pink600,
  brandWeak: scale.pink950,
  brandWeakPressed: scale.pink900,
  neutralSolid: scale.gray50,
  neutralSolidMuted: scale.gray300,
  neutralWeak: scale.gray800,
  neutralWeakPressed: scale.gray700,
  disabled: scale.gray800,
  criticalSolid: scale.red500,
  criticalSolidPressed: scale.red600,
  criticalWeak: scale.red950,
  positiveSolid: scale.green500,
  positiveWeak: scale.green950,
  informativeSolid: scale.blue500,
  informativeWeak: scale.blue950,
  warningSolid: scale.yellow500,
  warningWeak: scale.yellow950,
  overlay: "rgba(0, 0, 0, 0.6)",
  overlayMuted: "rgba(0, 0, 0, 0.4)",
  transparent: "transparent",
  kakao: scale.kakao,
} as const;

export const darkStroke = {
  brandSolid: scale.pink400,
  brandWeak: scale.pink800,
  neutralSolid: scale.gray600,
  neutralMuted: scale.gray700,
  neutralSubtle: scale.gray800,
  neutralContrast: scale.gray00,
  criticalSolid: scale.red400,
  criticalWeak: scale.red800,
  positiveSolid: scale.green400,
  positiveWeak: scale.green800,
  informativeSolid: scale.blue400,
  informativeWeak: scale.blue800,
  warningSolid: scale.yellow500,
  warningWeak: scale.yellow800,
  focusRing: scale.pink300,
} as const;

export const darkDivider = {
  subtle: scale.gray800,
  neutral: scale.gray700,
  strong: scale.gray600,
} as const;

export const darkSemantic = {
  fg: darkFg,
  bg: darkBg,
  stroke: darkStroke,
  divider: darkDivider,
} as const;
