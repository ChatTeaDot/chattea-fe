import * as SecureStore from "expo-secure-store";

import type { PushRegistrationStorage, StoredPushRegistration } from "./push-registration";

const PUSH_REGISTRATION_KEY = "chattea.pushRegistration.v1";

const emptyState = (): StoredPushRegistration => ({
  currentToken: null,
  pendingToken: null,
  unregisterPending: false,
});

const optionalString = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value;
};

const parseStoredState = (value: string | null): StoredPushRegistration => {
  if (!value) return emptyState();
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return emptyState();
    const currentToken = optionalString(Reflect.get(parsed, "currentToken"));
    const pendingToken = optionalString(Reflect.get(parsed, "pendingToken"));
    const unregisterPending = Reflect.get(parsed, "unregisterPending");
    if (
      currentToken === undefined ||
      pendingToken === undefined ||
      typeof unregisterPending !== "boolean"
    ) {
      return emptyState();
    }
    return { currentToken, pendingToken, unregisterPending };
  } catch {
    return emptyState();
  }
};

export const pushRegistrationStorage: PushRegistrationStorage = {
  load: async () => parseStoredState(await SecureStore.getItemAsync(PUSH_REGISTRATION_KEY)),
  save: async (state) => {
    await SecureStore.setItemAsync(PUSH_REGISTRATION_KEY, JSON.stringify(state));
  },
};
