import { initializeKakaoSDK } from "@react-native-kakao/core";
import { login } from "@react-native-kakao/user";

let initialized = false;

export async function initializeKakao() {
  if (initialized) {
    return;
  }

  const nativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
  if (!nativeAppKey) {
    throw new Error("KAKAO_NATIVE_APP_KEY_REQUIRED");
  }

  await initializeKakaoSDK(nativeAppKey);
  initialized = true;
}

export async function loginWithKakaoNative() {
  await initializeKakao();
  const token = await login();

  return token.accessToken;
}
