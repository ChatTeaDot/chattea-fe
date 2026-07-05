import * as SecureStore from "expo-secure-store";

export type StoredSession = {
  token: string;
};

const SESSION_KEY = "chattea.session";
const devSessionToken = process.env.EXPO_PUBLIC_DEV_SESSION_TOKEN;

const isJwt = (token: string) => token.split(".").length === 3;

const fallbackSession = (): StoredSession | null => {
  return devSessionToken && isJwt(devSessionToken) ? { token: devSessionToken } : null;
};

export const loadStoredSession = async (): Promise<StoredSession | null> => {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) {
    return fallbackSession();
  }

  try {
    const session = JSON.parse(value) as Partial<StoredSession>;
    if (typeof session.token !== "string" || !isJwt(session.token)) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return fallbackSession();
    }

    return { token: session.token };
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return fallbackSession();
  }
};

export const saveStoredSession = async (session: StoredSession | null) => {
  if (!session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};
