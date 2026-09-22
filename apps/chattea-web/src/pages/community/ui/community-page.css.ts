import { style } from "@vanilla-extract/css";

const fontStack =
  '"SF Pro Rounded", "Arial Rounded MT Bold", "Gowun Dodum", "Pretendard", sans-serif';

export const page = style({
  backgroundColor: "#FFFFFF",
  fontFamily: fontStack,
  minHeight: "100vh",
});

export const list = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const rowButton = style({
  background: "none",
  border: "none",
  borderBottom: "1px solid #E5E7EB",
  cursor: "pointer",
  display: "block",
  fontFamily: fontStack,
  minHeight: 56,
  padding: "14px 16px",
  textAlign: "left",
  width: "100%",
  ":active": {
    backgroundColor: "#F5F5F7",
  },
});

export const rowBody = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
});

export const rowTitle = style({
  color: "#111827",
  fontSize: 15,
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const rowSub = style({
  color: "#6B7280",
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
  color: "#111827",
  fontSize: 15,
  fontWeight: 600,
});

export const stateBody = style({
  color: "#6B7280",
  fontSize: 14,
});

export const retryButton = style({
  backgroundColor: "#EC4899",
  border: "none",
  borderRadius: 9999,
  color: "#FFFFFF",
  cursor: "pointer",
  fontFamily: fontStack,
  fontSize: 15,
  fontWeight: 600,
  height: 44,
  marginTop: 8,
  padding: "0 20px",
});

export const writeFab = style({
  alignItems: "center",
  backgroundColor: "#EC4899",
  border: "none",
  borderRadius: 9999,
  bottom: 24,
  boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  color: "#FFFFFF",
  cursor: "pointer",
  display: "flex",
  fontFamily: fontStack,
  fontSize: 24,
  height: 56,
  justifyContent: "center",
  lineHeight: 1,
  position: "fixed",
  right: 16,
  width: 56,
  zIndex: 100,
});
