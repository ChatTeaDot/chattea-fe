import { toByteArray } from "base64-js";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export type AuthContinuation = {
  readonly kakaoToken?: string;
  readonly phone?: string;
  readonly signupToken?: string;
};

type StoredAuthContinuation = AuthContinuation & {
  readonly expiresAt: number;
};

const AUTH_CONTINUATION_KEY = "chattea.authContinuation";

export const PHONE_CONTINUATION_TTL_MS = 5 * 60 * 1000;
export const SIGNUP_CONTINUATION_TTL_MS = 15 * 60 * 1000;

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
    const phone = Reflect.get(stored, "phone");
    const signupToken = Reflect.get(stored, "signupToken");
    if (
      (phone !== undefined && (typeof phone !== "string" || !phone)) ||
      typeof expiresAt !== "number" ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= Date.now() ||
      (kakaoToken !== undefined && (typeof kakaoToken !== "string" || !kakaoToken)) ||
      (signupToken !== undefined && (typeof signupToken !== "string" || !signupToken)) ||
      (!phone && !kakaoToken) ||
      (signupToken !== undefined && !phone)
    ) {
      await clearAuthContinuation();
      return null;
    }

    return { kakaoToken, phone, signupToken };
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

export const useAuthContinuation = () => {
  const [continuation, setContinuation] = useState<AuthContinuation | null>();

  useEffect(() => {
    let active = true;
    void loadAuthContinuation()
      .then((value) => {
        if (active) setContinuation(value);
      })
      .catch(() => {
        if (active) setContinuation(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return continuation;
};
