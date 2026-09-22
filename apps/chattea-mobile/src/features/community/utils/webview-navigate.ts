import { COMMUNITY_NAVIGABLE_PREFIX, COMMUNITY_NAVIGATE_MESSAGE_TYPE } from "../constants";

export type CommunityWebviewRoute = "/community" | `/community/${string}`;

export const parseNavigateMessage = (raw: string): CommunityWebviewRoute | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { path, type } = parsed as Record<string, unknown>;
    if (type !== COMMUNITY_NAVIGATE_MESSAGE_TYPE || typeof path !== "string") return null;
    if (path !== COMMUNITY_NAVIGABLE_PREFIX && !path.startsWith(`${COMMUNITY_NAVIGABLE_PREFIX}/`)) {
      return null;
    }
    if (path.includes("?") || path.includes("#") || path.includes("..")) return null;
    return path as CommunityWebviewRoute;
  } catch {
    return null;
  }
};
