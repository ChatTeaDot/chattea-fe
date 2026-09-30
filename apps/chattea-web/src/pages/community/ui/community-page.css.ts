import { style } from "@vanilla-extract/css";

import { brandPink, colors, webFontStack } from "@/shared/ui/tokens";

const brand = brandPink[5];

export const page = style({
  backgroundColor: colors.surface,
  fontFamily: webFontStack,
  minHeight: "100vh",
});

export const srOnly = style({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

export const list = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const rowButton = style({
  background: "none",
  border: "none",
  borderBottom: `1px solid ${colors.border}`,
  cursor: "pointer",
  display: "block",
  fontFamily: webFontStack,
  minHeight: 56,
  padding: "14px 16px",
  textAlign: "left",
  width: "100%",
  ":active": {
    backgroundColor: colors.pressedSurface,
  },
  ":focus-visible": {
    outline: `2px solid ${brand}`,
    outlineOffset: 2,
  },
});

export const rowBody = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
});

export const rowTitle = style({
  color: colors.textPrimary,
  fontSize: 15,
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const rowSub = style({
  color: colors.textDimmed,
  fontSize: 13,
});

export const stateWrap = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "48px 16px",
});

export const stateTitle = style({
  color: colors.textPrimary,
  fontSize: 15,
  fontWeight: 600,
});

export const stateBody = style({
  color: colors.textDimmed,
  fontSize: 14,
});

export const retryButton = style({
  backgroundColor: brand,
  border: "none",
  borderRadius: 9999,
  color: colors.surface,
  cursor: "pointer",
  fontFamily: webFontStack,
  fontSize: 15,
  fontWeight: 600,
  height: 44,
  marginTop: 8,
  padding: "0 20px",
  ":focus-visible": {
    outline: `2px solid ${brand}`,
    outlineOffset: 3,
  },
});

export const writeFab = style({
  alignItems: "center",
  backgroundColor: brand,
  border: "none",
  borderRadius: 9999,
  bottom: 24,
  boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  color: colors.surface,
  cursor: "pointer",
  display: "flex",
  fontFamily: webFontStack,
  fontSize: 24,
  height: 56,
  justifyContent: "center",
  lineHeight: 1,
  position: "fixed",
  right: 16,
  width: 56,
  zIndex: 100,
  ":focus-visible": {
    outline: `2px solid ${brand}`,
    outlineOffset: 3,
  },
});
