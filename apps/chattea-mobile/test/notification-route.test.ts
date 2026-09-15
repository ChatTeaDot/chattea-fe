import { describe, expect, it } from "vitest";

import {
  createNotificationResponseHandler,
  parseNotificationRoute,
} from "../src/features/notifications/utils/notification-route";

const roomId = "37e62526-6f75-4fbc-9df8-10fabd98929b";

const response = (identifier: string, route: unknown) => ({
  actionIdentifier: "default",
  notification: {
    request: {
      content: { data: { route } },
      identifier,
    },
  },
});

describe("notification routes", () => {
  it.each([
    ["/premium", "/premium"],
    ["/profile", "/profile"],
    ["/likes", "/likes"],
    ["/rooms", "/rooms"],
    [`/rooms/${roomId}`, `/rooms/${roomId}`],
    [`/room/${roomId}`, `/room/${roomId}`],
    [`/community/${roomId}`, `/community/${roomId}`],
  ])("accepts the internal route %s", (input, expected) => {
    expect(parseNotificationRoute(input)).toBe(expected);
  });

  it.each([
    "https://example.com/rooms",
    "chattea://rooms",
    "/rooms?room=1",
    "/rooms#latest",
    "/rooms/../premium",
    "/rooms/not-a-uuid",
    "/community/not-a-uuid",
    "//example.com/rooms",
    " /premium",
  ])("rejects the unsafe route %s", (input) => {
    expect(parseNotificationRoute(input)).toBeNull();
  });

  it("rejects non-string notification data", () => {
    expect(parseNotificationRoute({ route: "/premium" })).toBeNull();
  });

  it("handles one response identifier only once", () => {
    const handler = createNotificationResponseHandler();

    expect(handler.handle(response("notification-1", "/premium"))).toBe("/premium");
    expect(handler.handle(response("notification-1", "/profile"))).toBeNull();
    expect(handler.handle(response("notification-2", "/profile"))).toBe("/profile");
  });

  it("marks a malformed response handled without navigating", () => {
    const handler = createNotificationResponseHandler();

    expect(handler.handle(response("notification-1", "https://example.com"))).toBeNull();
    expect(handler.handle(response("notification-1", "/premium"))).toBeNull();
  });
});
