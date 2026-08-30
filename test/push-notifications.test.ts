import { describe, expect, it, vi } from "vitest";

import {
  createPushRegistrationLifecycle,
  type PushBackend,
  type PushRegistrationSdk,
  type PushRegistrationState,
  type PushRegistrationStorage,
  type StoredPushRegistration,
} from "../src/features/native/notifications/push-registration";

const emptyStoredState = (): StoredPushRegistration => ({
  currentToken: null,
  pendingToken: null,
  unregisterPending: false,
});

const createStorage = (initial = emptyStoredState()) => {
  let value = initial;
  const storage: PushRegistrationStorage = {
    load: vi.fn(async () => value),
    save: vi.fn(async (next) => {
      value = next;
    }),
  };
  return {
    get value() {
      return value;
    },
    storage,
  };
};

const createSdk = (): PushRegistrationSdk => ({
  getExpoPushToken: vi.fn(async () => ({ data: "ExponentPushToken[token-1]" })),
  getPermissions: vi.fn(async () => ({ canAskAgain: true, granted: true })),
  prepareAndroidChannel: vi.fn(async () => undefined),
  requestPermissions: vi.fn(async () => ({ canAskAgain: true, granted: true })),
});

const createBackend = (): PushBackend => ({
  register: vi.fn(async () => true),
  unregister: vi.fn(async () => true),
});

const createLifecycle = (input: {
  backend?: PushBackend;
  platform?: string;
  projectId?: string | null;
  sdk?: PushRegistrationSdk;
  storage?: ReturnType<typeof createStorage>["storage"];
}) => {
  const states: PushRegistrationState[] = [];
  const lifecycle = createPushRegistrationLifecycle({
    backend: input.backend ?? createBackend(),
    onState: (state) => states.push(state),
    platform: input.platform ?? "ios",
    projectId: input.projectId === undefined ? "project-id" : input.projectId,
    sdk: input.sdk ?? createSdk(),
    storage: input.storage ?? createStorage().storage,
  });
  return { lifecycle, states };
};

const createDeferred = <Value>() => {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe("push registration lifecycle", () => {
  it("prepares the Android notification channel before permission and token access", async () => {
    const order: string[] = [];
    const sdk = createSdk();
    vi.mocked(sdk.prepareAndroidChannel).mockImplementation(async () => {
      order.push("channel");
    });
    vi.mocked(sdk.getPermissions).mockImplementation(async () => {
      order.push("permission");
      return { canAskAgain: true, granted: true };
    });
    vi.mocked(sdk.getExpoPushToken).mockImplementation(async () => {
      order.push("token");
      return { data: "ExponentPushToken[token-1]" };
    });
    const { lifecycle } = createLifecycle({ platform: "android", sdk });

    await lifecycle.start("user-1");

    expect(order).toEqual(["channel", "permission", "token"]);
  });

  it("does not create an Android notification channel on iOS", async () => {
    const sdk = createSdk();
    const { lifecycle } = createLifecycle({ platform: "ios", sdk });

    await lifecycle.start("user-1");

    expect(sdk.prepareAndroidChannel).not.toHaveBeenCalled();
  });

  it("does not request permission before an authenticated user exists", async () => {
    const sdk = createSdk();
    const { lifecycle } = createLifecycle({ sdk });

    await lifecycle.start(null);

    expect(sdk.getPermissions).not.toHaveBeenCalled();
    expect(sdk.requestPermissions).not.toHaveBeenCalled();
  });

  it("disables remote registration without a project ID before requesting permission", async () => {
    const sdk = createSdk();
    const { lifecycle, states } = createLifecycle({ projectId: null, sdk });

    await lifecycle.start("user-1");

    expect(states.at(-1)).toEqual({
      message: "이 빌드에는 원격 알림 프로젝트가 설정되지 않았어요.",
      status: "disabled",
    });
    expect(sdk.getPermissions).not.toHaveBeenCalled();
  });

  it("does not make disabled push configuration a network dependency of logout", async () => {
    const backend = createBackend();
    vi.mocked(backend.unregister).mockRejectedValue(new Error("offline"));
    const stored = createStorage();
    const { lifecycle } = createLifecycle({
      backend,
      projectId: null,
      storage: stored.storage,
    });
    await lifecycle.start("user-1");

    await expect(lifecycle.unregisterInstallation()).resolves.toBeUndefined();

    expect(backend.unregister).not.toHaveBeenCalled();
    expect(stored.value).toEqual(emptyStoredState());
  });

  it("does not obtain or register a token when permission is denied", async () => {
    const sdk = createSdk();
    vi.mocked(sdk.getPermissions).mockResolvedValue({ canAskAgain: false, granted: false });
    const backend = createBackend();
    const { lifecycle, states } = createLifecycle({ backend, sdk });

    await lifecycle.start("user-1");

    expect(states.at(-1)).toEqual({
      message: "기기 설정에서 알림 권한을 허용하면 원격 알림을 받을 수 있어요.",
      status: "denied",
    });
    expect(sdk.getExpoPushToken).not.toHaveBeenCalled();
    expect(backend.register).not.toHaveBeenCalled();
  });

  it("requests permission and registers the Expo token for the installation", async () => {
    const sdk = createSdk();
    vi.mocked(sdk.getPermissions).mockResolvedValue({ canAskAgain: true, granted: false });
    const backend = createBackend();
    const stored = createStorage();
    const { lifecycle, states } = createLifecycle({ backend, sdk, storage: stored.storage });

    await lifecycle.start("user-1");

    expect(sdk.requestPermissions).toHaveBeenCalledTimes(1);
    expect(sdk.getExpoPushToken).toHaveBeenCalledWith({ projectId: "project-id" });
    expect(backend.register).toHaveBeenCalledWith({
      platform: "ios",
      token: "ExponentPushToken[token-1]",
    });
    expect(stored.value).toEqual({
      currentToken: "ExponentPushToken[token-1]",
      pendingToken: null,
      unregisterPending: false,
    });
    expect(states.at(-1)).toEqual({ status: "ready" });
  });

  it("serializes token rotations and registers each derived Expo token in order", async () => {
    const sdk = createSdk();
    const backend = createBackend();
    const order: string[] = [];
    vi.mocked(sdk.getExpoPushToken).mockImplementation(async ({ devicePushToken }) => {
      const data = String(devicePushToken?.data ?? "initial");
      order.push(`expo:${data}`);
      return { data: `ExponentPushToken[${data}]` };
    });
    vi.mocked(backend.register).mockImplementation(async ({ token }) => {
      order.push(`register:${token}`);
      return true;
    });
    const { lifecycle } = createLifecycle({ backend, sdk });
    await lifecycle.start("user-1");
    order.length = 0;

    const first = lifecycle.rotate({ data: "native-1", type: "ios" });
    const second = lifecycle.rotate({ data: "native-2", type: "ios" });
    await Promise.all([first, second]);

    expect(order).toEqual([
      "expo:native-1",
      "register:ExponentPushToken[native-1]",
      "expo:native-2",
      "register:ExponentPushToken[native-2]",
    ]);
    expect(backend.unregister).not.toHaveBeenCalled();
  });

  it("drops a stale token callback after authentication stops", async () => {
    const token = createDeferred<{ data: string }>();
    const sdk = createSdk();
    vi.mocked(sdk.getExpoPushToken)
      .mockResolvedValueOnce({ data: "ExponentPushToken[initial]" })
      .mockImplementationOnce(() => token.promise);
    const backend = createBackend();
    const { lifecycle } = createLifecycle({ backend, sdk });
    await lifecycle.start("user-1");
    vi.mocked(backend.register).mockClear();

    const rotation = lifecycle.rotate({ data: "native-2", type: "ios" });
    await vi.waitFor(() => expect(sdk.getExpoPushToken).toHaveBeenCalledTimes(2));
    lifecycle.stop();
    token.resolve({ data: "ExponentPushToken[stale]" });
    await rotation;

    expect(backend.register).not.toHaveBeenCalled();
  });

  it("persists a failed registration and retries it without requesting another token", async () => {
    const sdk = createSdk();
    const backend = createBackend();
    vi.mocked(backend.register).mockRejectedValueOnce(new Error("offline"));
    const stored = createStorage();
    const { lifecycle } = createLifecycle({ backend, sdk, storage: stored.storage });

    await expect(lifecycle.start("user-1")).rejects.toThrow("offline");
    expect(stored.value.pendingToken).toBe("ExponentPushToken[token-1]");
    await lifecycle.retry();

    expect(sdk.getExpoPushToken).toHaveBeenCalledTimes(1);
    expect(backend.register).toHaveBeenCalledTimes(2);
    expect(stored.value.pendingToken).toBeNull();
  });

  it("retries the complete Android registration after channel preparation fails", async () => {
    const order: string[] = [];
    const sdk = createSdk();
    vi.mocked(sdk.prepareAndroidChannel)
      .mockRejectedValueOnce(new Error("channel unavailable"))
      .mockImplementationOnce(async () => {
        order.push("channel");
      });
    vi.mocked(sdk.getPermissions).mockImplementation(async () => {
      order.push("permission");
      return { canAskAgain: true, granted: true };
    });
    vi.mocked(sdk.getExpoPushToken).mockImplementation(async () => {
      order.push("token");
      return { data: "ExponentPushToken[token-1]" };
    });
    const stored = createStorage();
    const { lifecycle } = createLifecycle({ platform: "android", sdk, storage: stored.storage });

    await expect(lifecycle.start("user-1")).rejects.toThrow("channel unavailable");
    expect(stored.value.pendingToken).toBeNull();
    await lifecycle.retry();

    expect(sdk.prepareAndroidChannel).toHaveBeenCalledTimes(2);
    expect(order).toEqual(["channel", "permission", "token"]);
  });

  it("retries permission and token acquisition when no pending token exists", async () => {
    const sdk = createSdk();
    vi.mocked(sdk.getPermissions)
      .mockRejectedValueOnce(new Error("permission service unavailable"))
      .mockResolvedValueOnce({ canAskAgain: true, granted: true });
    const { lifecycle } = createLifecycle({ sdk });

    await expect(lifecycle.start("user-1")).rejects.toThrow("permission service unavailable");
    await lifecycle.retry();

    expect(sdk.getPermissions).toHaveBeenCalledTimes(2);
    expect(sdk.getExpoPushToken).toHaveBeenCalledTimes(1);
  });

  it("drops a full registration retry when the authenticated generation stops", async () => {
    const channel = createDeferred<void>();
    const sdk = createSdk();
    vi.mocked(sdk.prepareAndroidChannel)
      .mockRejectedValueOnce(new Error("channel unavailable"))
      .mockImplementationOnce(() => channel.promise);
    const backend = createBackend();
    const { lifecycle } = createLifecycle({ backend, platform: "android", sdk });

    await expect(lifecycle.start("user-1")).rejects.toThrow("channel unavailable");
    const retry = lifecycle.retry();
    await vi.waitFor(() => expect(sdk.prepareAndroidChannel).toHaveBeenCalledTimes(2));
    lifecycle.stop();
    channel.resolve();
    await retry;

    expect(sdk.getPermissions).not.toHaveBeenCalled();
    expect(backend.register).not.toHaveBeenCalled();
  });

  it("does not continue registration after pending cleanup completes for a stopped user", async () => {
    const unregister = createDeferred<boolean>();
    const sdk = createSdk();
    const backend = createBackend();
    vi.mocked(backend.unregister).mockImplementationOnce(() => unregister.promise);
    const stored = createStorage({
      currentToken: "ExponentPushToken[token-1]",
      pendingToken: null,
      unregisterPending: true,
    });
    const { lifecycle } = createLifecycle({ backend, sdk, storage: stored.storage });

    const registration = lifecycle.start("user-1");
    await vi.waitFor(() => expect(backend.unregister).toHaveBeenCalledTimes(1));
    lifecycle.stop();
    unregister.resolve(true);
    await registration;

    expect(sdk.getPermissions).not.toHaveBeenCalled();
    expect(sdk.getExpoPushToken).not.toHaveBeenCalled();
  });

  it("transfers both distinct stored tokens before clearing a foreign cleanup marker", async () => {
    const backend = createBackend();
    vi.mocked(backend.unregister).mockResolvedValue(false);
    const sdk = createSdk();
    const stored = createStorage({
      currentToken: "ExponentPushToken[old]",
      pendingToken: "ExponentPushToken[rotated]",
      unregisterPending: true,
    });
    const { lifecycle } = createLifecycle({ backend, sdk, storage: stored.storage });

    await lifecycle.start("next-user");

    expect(backend.register).toHaveBeenNthCalledWith(1, {
      platform: "ios",
      token: "ExponentPushToken[old]",
    });
    expect(backend.register).toHaveBeenNthCalledWith(2, {
      platform: "ios",
      token: "ExponentPushToken[rotated]",
    });
    expect(sdk.getExpoPushToken).not.toHaveBeenCalled();
    expect(stored.value).toEqual({
      currentToken: "ExponentPushToken[rotated]",
      pendingToken: null,
      unregisterPending: false,
    });
  });

  it("preserves the pending marker and token when a foreign installation transfer fails", async () => {
    const backend = createBackend();
    vi.mocked(backend.unregister).mockResolvedValue(false);
    vi.mocked(backend.register).mockRejectedValue(new Error("offline"));
    const stored = createStorage({
      currentToken: "ExponentPushToken[old]",
      pendingToken: null,
      unregisterPending: true,
    });
    const { lifecycle } = createLifecycle({ backend, storage: stored.storage });

    await expect(lifecycle.start("next-user")).rejects.toThrow("offline");

    expect(stored.value).toEqual({
      currentToken: "ExponentPushToken[old]",
      pendingToken: null,
      unregisterPending: true,
    });
  });

  it("preserves both distinct tokens when the second foreign installation transfer fails", async () => {
    const backend = createBackend();
    vi.mocked(backend.unregister).mockResolvedValue(false);
    vi.mocked(backend.register)
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error("offline"));
    const stored = createStorage({
      currentToken: "ExponentPushToken[old]",
      pendingToken: "ExponentPushToken[rotated]",
      unregisterPending: true,
    });
    const { lifecycle } = createLifecycle({ backend, storage: stored.storage });

    await expect(lifecycle.start("next-user")).rejects.toThrow("offline");

    expect(backend.register).toHaveBeenNthCalledWith(1, {
      platform: "ios",
      token: "ExponentPushToken[old]",
    });
    expect(backend.register).toHaveBeenNthCalledWith(2, {
      platform: "ios",
      token: "ExponentPushToken[rotated]",
    });
    expect(stored.value).toEqual({
      currentToken: "ExponentPushToken[old]",
      pendingToken: "ExponentPushToken[rotated]",
      unregisterPending: true,
    });
  });

  it("marks installation cleanup pending before unregistering without token arguments", async () => {
    const backend = createBackend();
    const stored = createStorage({
      currentToken: "ExponentPushToken[token-1]",
      pendingToken: null,
      unregisterPending: false,
    });
    const snapshots: StoredPushRegistration[] = [];
    vi.mocked(stored.storage.save).mockImplementation(async (next) => {
      snapshots.push(next);
    });
    const { lifecycle } = createLifecycle({ backend, storage: stored.storage });

    await lifecycle.unregisterInstallation();

    expect(snapshots[0]?.unregisterPending).toBe(true);
    expect(backend.unregister).toHaveBeenCalledWith();
    expect(snapshots.at(-1)).toEqual(emptyStoredState());
  });

  it("keeps pending cleanup when installation unregister fails", async () => {
    const backend = createBackend();
    vi.mocked(backend.unregister).mockRejectedValue(new Error("offline"));
    const stored = createStorage({
      currentToken: "ExponentPushToken[token-1]",
      pendingToken: null,
      unregisterPending: false,
    });
    const { lifecycle } = createLifecycle({ backend, storage: stored.storage });

    await expect(lifecycle.unregisterInstallation()).rejects.toThrow("offline");

    expect(stored.value.unregisterPending).toBe(true);
  });
});
