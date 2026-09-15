import * as SecureStore from "expo-secure-store";

import { devRefreshToken, devSessionToken, SESSION_KEY } from "@/providers/constants";

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
};

let saveQueue: Promise<unknown> = Promise.resolve();

const isJwt = (token: string) => token.split(".").length === 3;

const fallbackSession = (): StoredSession | null => {
  return devSessionToken && devRefreshToken && isJwt(devSessionToken) && isJwt(devRefreshToken)
    ? { accessToken: devSessionToken, refreshToken: devRefreshToken }
    : null;
};

export const loadStoredSession = async (): Promise<StoredSession | null> => {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) {
    return fallbackSession();
  }

  try {
    const session: unknown = JSON.parse(value);
    if (!session || typeof session !== "object") {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return fallbackSession();
    }
    const accessToken = Reflect.get(session, "accessToken");
    const refreshToken = Reflect.get(session, "refreshToken");
    if (
      typeof accessToken !== "string" ||
      typeof refreshToken !== "string" ||
      !isJwt(accessToken) ||
      !isJwt(refreshToken)
    ) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return fallbackSession();
    }

    return { accessToken, refreshToken };
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return fallbackSession();
  }
};

export const saveStoredSession = (session: StoredSession | null): Promise<void> => {
  const result = saveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!session) {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return;
      }
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    });
  saveQueue = result;
  return result;
};
