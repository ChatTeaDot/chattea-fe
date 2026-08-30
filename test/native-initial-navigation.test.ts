import { describe, expect, it, vi } from "vitest";

import {
  createNotificationNavigationCoordinator,
  type NotificationResponseLike,
} from "../src/features/native/notifications/notification-route";
import { getNativeSessionDestination, getSessionRedirect } from "../src/providers/session-routing";

const roomId = "37e62526-6f75-4fbc-9df8-10fabd98929b";

const response = (identifier: string, route: string): NotificationResponseLike => ({
  actionIdentifier: "default",
  notification: {
    request: {
      content: { data: { route } },
      identifier,
    },
  },
});

describe("authenticated initial navigation", () => {
  it("defers and consumes a cold notification once after profile gating", () => {
    const coldResponse = response("cold-response", `/rooms/${roomId}`);
    const clearLastResponse = vi.fn();
    const coordinator = createNotificationNavigationCoordinator({
      clearLastResponse,
      getLastResponse: () => coldResponse,
    });

    expect(
      getNativeSessionDestination(
        {
          hasSession: false,
          hydrated: true,
          inTabs: false,
          isPublic: false,
          onCompletion: false,
          profileCompleted: null,
        },
        coordinator.consumeInitial,
      ),
    ).toBe("/");
    expect(clearLastResponse).not.toHaveBeenCalled();

    expect(
      getNativeSessionDestination(
        {
          hasSession: true,
          hydrated: true,
          inTabs: false,
          isPublic: true,
          onCompletion: false,
          profileCompleted: false,
        },
        coordinator.consumeInitial,
      ),
    ).toBe("/profile-completion");
    expect(clearLastResponse).not.toHaveBeenCalled();

    expect(coordinator.handleRuntime(coldResponse)).toBeNull();
    expect(
      getNativeSessionDestination(
        {
          hasSession: true,
          hydrated: true,
          inTabs: false,
          isPublic: true,
          onCompletion: false,
          profileCompleted: true,
        },
        coordinator.consumeInitial,
      ),
    ).toBe(`/rooms/${roomId}`);
    expect(clearLastResponse).toHaveBeenCalledOnce();

    expect(
      getNativeSessionDestination(
        {
          hasSession: true,
          hydrated: true,
          inTabs: false,
          isPublic: true,
          onCompletion: false,
          profileCompleted: true,
        },
        coordinator.consumeInitial,
      ),
    ).toBe("/matches");
    expect(clearLastResponse).toHaveBeenCalledOnce();
    expect(coordinator.handleRuntime(response("runtime-response", "/premium"))).toBe("/premium");
  });

  it("leaves authenticated root navigation to the profile-aware session gate", () => {
    expect(getSessionRedirect(true, true)).toBeNull();
  });
});
