import * as SecureStore from "expo-secure-store";

export type StoredSession = {
  token: string;
  userId: string;
};

const SESSION_KEY = "chattea.session";

export async function loadStoredSession(): Promise<StoredSession | null> {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    const session = JSON.parse(value) as Partial<StoredSession>;
    return typeof session.token === "string" && typeof session.userId === "string"
      ? { token: session.token, userId: session.userId }
      : null;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export async function saveStoredSession(session: StoredSession | null) {
  if (!session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}
