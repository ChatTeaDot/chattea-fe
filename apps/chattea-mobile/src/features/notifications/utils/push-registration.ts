import type { DevicePushToken } from "../api";
import type {
  PushRegistrationLifecycleInput,
  PushRegistrationState,
  StoredPushRegistration,
} from "../types";

const emptyStoredState = (): StoredPushRegistration => ({
  currentToken: null,
  pendingToken: null,
  unregisterPending: false,
});

export const createPushRegistrationLifecycle = (input: PushRegistrationLifecycleInput) => {
  let activeUserId: string | null = null;
  let generation = 0;
  let queue = Promise.resolve();
  let storedState: StoredPushRegistration | null = null;

  const emit = (state: PushRegistrationState) => input.onState(state);
  const load = async (): Promise<StoredPushRegistration> => {
    storedState ??= await input.storage.load();
    return storedState;
  };
  const save = async (state: StoredPushRegistration): Promise<void> => {
    await input.storage.save(state);
    storedState = state;
  };
  const enqueue = <Value>(operation: () => Promise<Value>): Promise<Value> => {
    const pending = queue.catch(() => undefined).then(operation);
    queue = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  };
  const nativePlatform =
    input.platform === "ios" || input.platform === "android" ? input.platform : null;

  const registerToken = async (token: string, requestGeneration: number): Promise<void> => {
    if (requestGeneration !== generation || !activeUserId || !nativePlatform) return;
    const current = await load();
    await save({ ...current, pendingToken: token });
    if (requestGeneration !== generation || !activeUserId) return;
    const registered = await input.backend.register({ platform: nativePlatform, token });
    if (!registered) throw new Error("PUSH_TOKEN_REGISTRATION_FAILED");
    if (requestGeneration !== generation || !activeUserId) return;
    await save({ currentToken: token, pendingToken: null, unregisterPending: false });
  };

  const reportFailure = (error: unknown, requestGeneration: number): never => {
    if (requestGeneration === generation) {
      emit({
        message: "원격 알림 등록을 완료하지 못했어요. 연결되면 다시 시도할게요.",
        status: "error",
      });
    }
    throw error;
  };

  const attemptRegistration = async (
    projectId: string,
    requestGeneration: number,
  ): Promise<void> => {
    let current = await load();
    if (requestGeneration !== generation || !activeUserId || !nativePlatform) return;
    if (current.unregisterPending) {
      const unregistered = await input.backend.unregister();
      if (requestGeneration !== generation || !activeUserId) return;
      if (!unregistered) {
        const transferTokens: string[] = [];
        if (current.currentToken) transferTokens.push(current.currentToken);
        if (current.pendingToken && current.pendingToken !== current.currentToken) {
          transferTokens.push(current.pendingToken);
        }
        if (transferTokens.length === 0) throw new Error("PUSH_TOKEN_UNREGISTER_FAILED");
        if (nativePlatform === "android") {
          await input.sdk.prepareAndroidChannel();
          if (requestGeneration !== generation || !activeUserId) return;
        }
        for (const token of transferTokens) {
          if (requestGeneration !== generation || !activeUserId) return;
          const registered = await input.backend.register({ platform: nativePlatform, token });
          if (!registered) throw new Error("PUSH_TOKEN_REGISTRATION_FAILED");
        }
        if (requestGeneration !== generation || !activeUserId) return;
        await save({
          currentToken: transferTokens[transferTokens.length - 1] ?? null,
          pendingToken: null,
          unregisterPending: false,
        });
        if (requestGeneration === generation) emit({ status: "ready" });
        return;
      }
      current = emptyStoredState();
      await save(current);
      if (requestGeneration !== generation || !activeUserId) return;
    }
    if (nativePlatform === "android") {
      await input.sdk.prepareAndroidChannel();
      if (requestGeneration !== generation || !activeUserId) return;
    }
    if (current.pendingToken) {
      await registerToken(current.pendingToken, requestGeneration);
      if (requestGeneration === generation) emit({ status: "ready" });
      return;
    }

    let permission = await input.sdk.getPermissions();
    if (requestGeneration !== generation || !activeUserId) return;
    if (!permission.granted && permission.canAskAgain) {
      permission = await input.sdk.requestPermissions();
    }
    if (requestGeneration !== generation || !activeUserId) return;
    if (!permission.granted) {
      emit({
        message: "기기 설정에서 알림 권한을 허용하면 원격 알림을 받을 수 있어요.",
        status: "denied",
      });
      return;
    }

    const token = await input.sdk.getExpoPushToken({ projectId });
    if (requestGeneration !== generation || !activeUserId) return;
    await registerToken(token.data, requestGeneration);
    if (requestGeneration === generation) emit({ status: "ready" });
  };

  const start = (userId: string | null): Promise<void> => {
    const requestGeneration = ++generation;
    const projectId = input.projectId;
    activeUserId = userId;
    if (!userId) {
      emit({ message: "로그인 후 원격 알림을 설정할 수 있어요.", status: "disabled" });
      return Promise.resolve();
    }
    if (!projectId || !nativePlatform) {
      emit({
        message: "이 빌드에는 원격 알림 프로젝트가 설정되지 않았어요.",
        status: "disabled",
      });
      return Promise.resolve();
    }
    emit({ status: "loading" });

    return enqueue(async () => {
      try {
        await attemptRegistration(projectId, requestGeneration);
      } catch (error) {
        reportFailure(error, requestGeneration);
      }
    });
  };

  const rotate = (devicePushToken: DevicePushToken): Promise<void> => {
    const requestGeneration = generation;
    const projectId = input.projectId;
    if (!activeUserId || !projectId || !nativePlatform) return Promise.resolve();
    return enqueue(async () => {
      try {
        if (requestGeneration !== generation || !activeUserId) return;
        const token = await input.sdk.getExpoPushToken({
          devicePushToken,
          projectId,
        });
        if (requestGeneration !== generation || !activeUserId) return;
        await registerToken(token.data, requestGeneration);
        if (requestGeneration === generation) emit({ status: "ready" });
      } catch (error) {
        reportFailure(error, requestGeneration);
      }
    });
  };

  const retry = (): Promise<void> => {
    const requestGeneration = generation;
    const projectId = input.projectId;
    if (!activeUserId || !projectId || !nativePlatform) return Promise.resolve();
    return enqueue(async () => {
      try {
        await attemptRegistration(projectId, requestGeneration);
      } catch (error) {
        reportFailure(error, requestGeneration);
      }
    });
  };

  const stop = (): void => {
    ++generation;
    activeUserId = null;
    emit({ message: "로그인 후 원격 알림을 설정할 수 있어요.", status: "disabled" });
  };

  const unregisterInstallation = (): Promise<void> => {
    ++generation;
    activeUserId = null;
    return enqueue(async () => {
      const current = await load();
      if (!current.currentToken && !current.pendingToken && !current.unregisterPending) {
        emit({ message: "로그인 후 원격 알림을 설정할 수 있어요.", status: "disabled" });
        return;
      }
      await save({ ...current, unregisterPending: true });
      try {
        const unregistered = await input.backend.unregister();
        if (!unregistered) throw new Error("PUSH_TOKEN_UNREGISTER_FAILED");
        await save(emptyStoredState());
        emit({ message: "로그인 후 원격 알림을 설정할 수 있어요.", status: "disabled" });
      } catch (error) {
        emit({
          message: "이 기기의 알림 등록을 해제하지 못했어요. 다시 로그아웃해 주세요.",
          status: "error",
        });
        throw error;
      }
    });
  };

  const clearLocal = async (): Promise<void> => {
    ++generation;
    activeUserId = null;
    await save(emptyStoredState());
    emit({ message: "로그인 후 원격 알림을 설정할 수 있어요.", status: "disabled" });
  };

  return { clearLocal, retry, rotate, start, stop, unregisterInstallation };
};
