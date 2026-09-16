import { EXACT_ROUTES, UUID_PATTERN } from "../constants";
import type { NotificationResponseLike, NotificationRoute } from "../types";

export const parseNotificationRoute = (value: unknown): NotificationRoute | null => {
  if (typeof value !== "string" || value.trim() !== value) return null;
  if (value.includes("?") || value.includes("#") || value.includes("..") || value.includes(":")) {
    return null;
  }
  if (EXACT_ROUTES.has(value)) return value as NotificationRoute;
  const segments = value.split("/");
  if (segments.length !== 3 || segments[0] !== "") return null;
  const root = segments[1];
  const id = segments[2];
  if (!id || !UUID_PATTERN.test(id)) return null;
  return root === "community" || root === "room" || root === "rooms"
    ? (value as NotificationRoute)
    : null;
};

export const createNotificationResponseHandler = () => {
  const handled = new Set<string>();
  const handle = (response: NotificationResponseLike): NotificationRoute | null => {
    const identifier = response.notification.request.identifier;
    if (handled.has(identifier)) return null;
    handled.add(identifier);
    return parseNotificationRoute(response.notification.request.content.data?.route);
  };
  return { handle };
};

export const createNotificationNavigationCoordinator = (input: {
  clearLastResponse: () => void;
  getLastResponse: () => NotificationResponseLike | null;
}) => {
  const responseHandler = createNotificationResponseHandler();
  let initialConsumed = false;
  let queuedRuntimeResponse: NotificationResponseLike | null = null;

  const handleRuntime = (response: NotificationResponseLike): NotificationRoute | null => {
    if (!initialConsumed) {
      queuedRuntimeResponse ??= response;
      return null;
    }
    return responseHandler.handle(response);
  };

  const consumeInitial = (): NotificationRoute | null => {
    if (initialConsumed) return null;
    initialConsumed = true;
    const lastResponse = input.getLastResponse();
    const response = queuedRuntimeResponse ?? lastResponse;
    queuedRuntimeResponse = null;
    if (lastResponse) input.clearLastResponse();
    return response ? responseHandler.handle(response) : null;
  };

  return { consumeInitial, handleRuntime };
};
