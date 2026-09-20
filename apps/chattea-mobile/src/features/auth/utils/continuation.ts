import { toByteArray } from "base64-js";
import * as SecureStore from "expo-secure-store";

import { AUTH_CONTINUATION_KEY } from "../constants";
import type { AuthContinuation, StoredAuthContinuation } from "../types";

const getTokenExpiresAt = (token: string): number => {
  const payload = token.split(".")[1];
  if (!payload) {
    throw new Error("AUTH_CONTINUATION_TOKEN_INVALID");
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded: unknown = JSON.parse(
    new TextDecoder().decode(toByteArray(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))),
  );
  const exp = decoded && typeof decoded === "object" ? Reflect.get(decoded, "exp") : undefined;
  if (typeof exp !== "number" || !Number.isSafeInteger(exp)) {
    throw new Error("AUTH_CONTINUATION_TOKEN_INVALID");
  }

  return exp * 1000;
};

export const getAuthContinuationExpiresAt = (ttlMs: number, tokens: readonly string[] = []) => {
  const now = Date.now();
  const expiresAt = Math.min(now + ttlMs, ...tokens.map(getTokenExpiresAt));
  if (expiresAt <= now) {
    throw new Error("AUTH_CONTINUATION_EXPIRED");
  }
  return expiresAt;
};

export const loadAuthContinuation = async (): Promise<AuthContinuation | null> => {
  const value = await SecureStore.getItemAsync(AUTH_CONTINUATION_KEY);
  if (!value) {
    return null;
  }

  try {
    const stored: unknown = JSON.parse(value);
    if (!stored || typeof stored !== "object") {
      await clearAuthContinuation();
      return null;
    }
    const expiresAt = Reflect.get(stored, "expiresAt");
    const kakaoToken = Reflect.get(stored, "kakaoToken");
    if (
      typeof expiresAt !== "number" ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= Date.now() ||
      typeof kakaoToken !== "string" ||
      !kakaoToken
    ) {
      await clearAuthContinuation();
      return null;
    }

    return { kakaoToken };
  } catch {
    await clearAuthContinuation();
    return null;
  }
};

export const saveAuthContinuation = async (value: AuthContinuation, expiresAt: number) => {
  await SecureStore.setItemAsync(
    AUTH_CONTINUATION_KEY,
    JSON.stringify({ ...value, expiresAt } satisfies StoredAuthContinuation),
  );
};

export const clearAuthContinuation = () => SecureStore.deleteItemAsync(AUTH_CONTINUATION_KEY);
