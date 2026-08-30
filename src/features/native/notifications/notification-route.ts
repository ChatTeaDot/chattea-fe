export type NotificationRoute =
  | "/likes"
  | "/premium"
  | "/profile"
  | "/rooms"
  | `/community/${string}`
  | `/room/${string}`
  | `/rooms/${string}`;

export type NotificationResponseLike = {
  actionIdentifier: string;
  notification: {
    request: {
      content: { data?: Record<string, unknown> };
      identifier: string;
    };
  };
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EXACT_ROUTES = new Set(["/likes", "/premium", "/profile", "/rooms"]);

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
