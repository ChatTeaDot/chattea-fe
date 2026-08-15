import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const routeExports = [
  ["src/app/(tabs)/matches/index.tsx", "TodayMatchesScreen"],
  ["src/app/(tabs)/community/index.tsx", "CommunityScreen"],
  ["src/app/community/[post-id].tsx", "CommunityPostScreen"],
  ["src/app/community/new.tsx", "CommunityWriteScreen"],
  ["src/app/(tabs)/likes/index.tsx", "LikesScreen"],
  ["src/app/(tabs)/rooms/index.tsx", "RoomsScreen"],
  ["src/app/rooms/[room-id].tsx", "RoomScreen"],
  ["src/app/(tabs)/profile/index.tsx", "ProfileScreen"],
  ["src/app/profile/edit.tsx", "ProfileFormScreen"],
  ["src/app/notifications.tsx", "NotificationsScreen"],
  ["src/app/premium.tsx", "PremiumScreen"],
  ["src/app/settings.tsx", "SettingsScreen"],
] as const;

describe("native screen route contract", () => {
  it("keeps every route wired to its public screen export", () => {
    for (const [route, screen] of routeExports) {
      const source = readFileSync(resolve(__dirname, "..", route), "utf8");
      expect(source).toContain(screen);
    }
  });
});
