const kakaoNativeAppKey =
  process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? "set-kakao-native-app-key";
const plugins = [
  "expo-router",
  "expo-secure-store",
  "expo-splash-screen",
  "expo-image",
  [
    "expo-image-picker",
    {
      photosPermission: "프로필과 채팅에 사진을 올리기 위해 사진 보관함에 접근합니다.",
    },
  ],
  [
    "@react-native-kakao/core",
    {
      nativeAppKey: kakaoNativeAppKey,
      android: {
        authCodeHandlerActivity: true,
      },
      ios: {
        handleKakaoOpenUrl: true,
      },
    },
  ],
];

if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  plugins.push([
    "@sentry/react-native",
    {
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      url: process.env.SENTRY_URL ?? "https://sentry.io/",
    },
  ]);
}

if (process.env.DATADOG_API_KEY) {
  plugins.push([
    "expo-datadog",
    {
      errorTracking: {
        serviceName: "chattea-fe",
      },
    },
  ]);
}

module.exports = {
  expo: {
    name: "ChatTea",
    slug: "chattea",
    scheme: "chattea",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    plugins,
    ios: {
      bundleIdentifier: "com.cyjoon.chattea",
    },
    android: {
      package: "com.cyjoon.chattea",
    },
  },
};
