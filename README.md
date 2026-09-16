# ChatTea frontend

pnpm workspace with two apps.

```text
apps/chattea-mobile   Expo 56 / React Native
apps/chattea-web      Vite React, served at :3000 for the community WebView
```

## Requirements

- Node.js 24
- pnpm 11.0.4
- Xcode or Android Studio for native builds

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev:mobile
pnpm dev:web
```

`pnpm dev` starts mobile. Kakao login, Sentry, Datadog, and native configuration plugins require a development build rather than Expo Go.

WebView in mobile opens `http://localhost:3000/community` against `chattea-web`. On a device use the machine LAN address.

## Verification

```bash
pnpm audit:all
pnpm deps:check
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
```

`deps:check` validates Expo SDK compatibility in `chattea-mobile`. The TypeScript configuration uses both `strict` and `noUncheckedIndexedAccess`.

The pnpm audit policy temporarily ignores the two unpatched `image-size` advisories inherited by Expo Metro (`GHSA-w3rx-r6r6-pgpr` and `GHSA-5p2g-fcmc-qvqq`). CI processes trusted repository assets only; remove the exceptions when Expo ships a patched dependency.

## Configuration

Mobile environment variables stay the same.

```text
EXPO_PUBLIC_GRAPHQL_URL
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY
EXPO_PUBLIC_EAS_PROJECT_ID
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_DATADOG_CLIENT_TOKEN
EXPO_PUBLIC_DATADOG_RUM_APPLICATION_ID
EXPO_PUBLIC_SERVICE_ENV
EXPO_PUBLIC_SERVICE_VERSION
```

Observability settings are optional. `EXPO_PUBLIC_DEV_SESSION_TOKEN` and `EXPO_PUBLIC_DEV_REFRESH_TOKEN` are development-only, must be configured together, and must never be configured in a production build.

`EXPO_PUBLIC_EAS_PROJECT_ID` must be the UUID of the EAS project owned by the release account. It is passed to `expo-notifications` when requesting an Expo push token. `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` must be the platform-specific public SDK keys; they are not RevenueCat secret API keys. Missing values explicitly disable remote push registration or the corresponding store purchase UI. Configure release values in the EAS environment rather than committing them.

Sentry build integration additionally uses `SENTRY_ORG`, `SENTRY_PROJECT`, and optionally `SENTRY_URL`. Datadog build integration uses `DATADOG_API_KEY`.

## Architecture

- `chattea-mobile`: Expo Router under `src/app`, Apollo Client, SecureStore, LegendList, Unistyles.
- `chattea-web`: Vite React app. Community pages live here so the native community tab can load them in a WebView.

## Builds and releases

CI installs at the workspace root, then runs Expo prebuild and export inside `apps/chattea-mobile`. The main-only manual release workflow exposes a blocking production EAS build target, which fails closed until the release account supplies the real EAS project ID, owner access, and Apple/Google signing credentials; no placeholder identity is used. Store submission remains an external manual prerequisite until an approved workflow can bind it to that run's exact build ID. OTA updates remain disabled until the project adds `expo-updates` and a fingerprint runtime policy.

Passing tests, Expo config validation, and Metro exports certifies the code paths but not the external services. Live mobile certification requires all of the following:

- Real RevenueCat iOS and Android public SDK keys, active App Store Connect and Play Console products mapped to the five backend product IDs, a current RevenueCat offering, and the backend webhook endpoint and secret. Use signed sandbox builds to exercise purchase, cancellation, delayed webhook reconciliation, restore, and account switching on both platforms.
- A real EAS project ID associated with the release account and signed physical-device builds. On both platforms verify permission denial and grant, token registration and rotation, foreground delivery, authenticated cold-start and runtime response routing, and logout unregistration. Android testing must include API 33 or newer.
- Valid Apple provisioning/App Store credentials and Android keystore/Play credentials for production binaries. Until these inputs and device checks exist, purchases, push registration, and release submission remain fail-closed rather than production-certified.
