const isSecureUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
};
const configuredKakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY?.trim();
const configuredEasProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();

if (process.env.NODE_ENV === "production" || process.env.EAS_BUILD_PROFILE === "production") {
  const invalid = [];
  if (!isSecureUrl(process.env.EXPO_PUBLIC_GRAPHQL_URL)) invalid.push("EXPO_PUBLIC_GRAPHQL_URL");
  if (!configuredKakaoNativeAppKey || configuredKakaoNativeAppKey === "set-kakao-native-app-key") {
    invalid.push("EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY");
  }
  if (process.env.EXPO_PUBLIC_DEV_SESSION_TOKEN) invalid.push("EXPO_PUBLIC_DEV_SESSION_TOKEN");
  if (process.env.EXPO_PUBLIC_DEV_REFRESH_TOKEN) invalid.push("EXPO_PUBLIC_DEV_REFRESH_TOKEN");
  if (invalid.length) throw new Error(`PRODUCTION_APP_CONFIG_INVALID:${invalid.sort().join(",")}`);
}

const kakaoNativeAppKey = configuredKakaoNativeAppKey || "set-kakao-native-app-key";
const plugins = [
  "expo-router",
  "expo-notifications",
  "expo-secure-store",
  "expo-splash-screen",
  "expo-image",
  [
    "expo-image-picker",
    {
      microphonePermission: false,
      photosPermission: "프로필 사진을 올리기 위해 사진 보관함에 접근합니다.",
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
    name: "채티",
    slug: "chattea",
    scheme: "chattea",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    plugins,
    ...(configuredEasProjectId
      ? {
          extra: {
            eas: {
              projectId: configuredEasProjectId,
            },
          },
        }
      : {}),
    ios: {
      bundleIdentifier: "com.cyjoon.chattea",
    },
    android: {
      edgeToEdgeEnabled: true,
      package: "com.cyjoon.chattea",
      softwareKeyboardLayoutMode: "resize",
    },
  },
};
