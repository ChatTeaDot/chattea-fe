# ChatTea 프론트엔드

두 개의 앱으로 구성된 pnpm 워크스페이스.

```text
apps/chattea-mobile   Expo 56 / React Native
apps/chattea-web      Vite React, 커뮤니티 WebView용 (:3000)
```

## 스크린샷

| 매칭 | 커뮤니티 | 채팅 |
| --- | --- | --- |
| ![매칭](https://raw.githubusercontent.com/ChatTeaDot/chattea-workspace/develop/docs/screenshots/matches.png) | ![커뮤니티](https://raw.githubusercontent.com/ChatTeaDot/chattea-workspace/develop/docs/screenshots/community.png) | ![채팅](https://raw.githubusercontent.com/ChatTeaDot/chattea-workspace/develop/docs/screenshots/chat-room.png) |

| 좋아요 | 게시글 | 프로필 |
| --- | --- | --- |
| ![좋아요](https://raw.githubusercontent.com/ChatTeaDot/chattea-workspace/develop/docs/screenshots/likes.png) | ![게시글](https://raw.githubusercontent.com/ChatTeaDot/chattea-workspace/develop/docs/screenshots/community-post.png) | ![프로필](https://raw.githubusercontent.com/ChatTeaDot/chattea-workspace/develop/docs/screenshots/profile.png) |

## 요구사항

- Node.js 24
- pnpm 11.0.4
- 네이티브 빌드는 Xcode 또는 Android Studio

## 로컬 개발

```bash
pnpm install --frozen-lockfile
pnpm dev:mobile
pnpm dev:web
```

`pnpm dev`는 모바일을 실행한다. Kakao 로그인, Sentry, Datadog, 네이브 설정 플러그인은 Expo Go가 아니라 development build가 필요하다.

모바일의 WebView는 `chattea-web`의 `http://localhost:3000/community`를 연다. 실기기에서는 머신의 LAN 주소를 사용한다.

`chattea-web`은 Fastify SSR 서버(`tsx src/app/server.ts`)로 뜬다. Vite `middlewareMode` + `@fastify/middie`로 개발 서버를 끼워 넣고, `renderToPipeableStream`으로 `/community`를 스트리밍한다. 스타일은 vanilla-extract, 데이터는 TanStack Query.

## 검증

```bash
pnpm audit:all
pnpm deps:check
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
```

`deps:check`는 `chattea-mobile`의 Expo SDK 호환성을 검증한다. TypeScript 설정은 `strict`와 `noUncheckedIndexedAccess`를 함께 사용한다.

pnpm audit 정책은 Expo Metro가 물려주는 패치되지 않은 `image-size` advisory 두 개(`GHSA-w3rx-r6r6-pgpr`, `GHSA-5p2g-fcmc-qvqq`)를 임시로 무시한다. CI는 신뢰된 레포 에셋만 처리하므로, Expo가 패치된 의존성을 출시하면 예외를 제거한다.

## 설정

모바일 환경 변수는 그대로다.

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

옵저버빌리티 설정은 선택이다. `EXPO_PUBLIC_DEV_SESSION_TOKEN`과 `EXPO_PUBLIC_DEV_REFRESH_TOKEN`은 개발 전용이며, 반드시 함께 설정해야 하고 프로덕션 빌드에는 넣으면 안 된다.

`EXPO_PUBLIC_EAS_PROJECT_ID`는 릴리스 계정이 소유한 EAS 프로젝트의 UUID여야 하며, `expo-notifications`가 Expo 푸시 토큰을 요청할 때 사용한다. `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`와 `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`는 플랫폼별 public SDK 키로, RevenueCat secret API 키가 아니다. 값이 없으면 원격 푸시 등록이나 해당 스토어 구매 UI가 명시적으로 비활성화된다. 릴리스 값은 커밋하지 말고 EAS 환경에 설정한다.

Sentry 빌드 연동은 `SENTRY_ORG`, `SENTRY_PROJECT`, 선택적으로 `SENTRY_URL`을 추가로 사용한다. Datadog 빌드 연동은 `DATADOG_API_KEY`를 사용한다.

## 아키텍처

- `chattea-mobile`: `src/app` 아래 Expo Router, Apollo Client, SecureStore, LegendList, Unistyles.
- `chattea-web`: Vite React 앱. 네이티브 커뮤니티 탭이 WebView로 불러오는 커뮤니티 페이지가 여기 있다. Fastify SSR + TanStack Query + vanilla-extract 스택.

## 빌드와 릴리스

CI는 워크스페이스 루트에서 install한 뒤 `apps/chattea-mobile`에서 Expo prebuild와 export를 실행한다. main 전용 수동 릴리스 워크플로우는 프로덕션 EAS 빌드 타깃을 노출하지만, 릴리스 계정이 실제 EAS 프로젝트 ID, owner 권한, Apple/Google 서명 크리덴셜을 제공하기 전까지 fail-closed로 동작하며 플레이스홀더 identity를 쓰지 않는다. 스토어 제출은 해당 실행의 정확한 빌드 ID에 바인딩할 승인된 워크플로우가 생기기 전까지 외부 수동 절차로 남는다. OTA 업데이트는 프로젝트가 `expo-updates`와 fingerprint 런타임 정책을 추가하기 전까지 비활성화된다.

테스트 통과, Expo config 검증, Metro export는 코드 경로를 인증하지만 외부 서비스를 인증하지는 않는다. 라이브 모바일 인증에는 다음이 모두 필요하다.

- 실제 RevenueCat iOS/Android public SDK 키, 백엔드의 다섯 개 상품 ID에 매핑된 활성 App Store Connect 및 Play Console 상품, 최신 RevenueCat offering, 백엔드 웹훅 엔드포인트와 시크릿. 서명된 샌드박스 빌드로 양 플랫폼에서 구매, 취소, 지연 웹훅 재조정, 복원, 계정 전환을 검증한다.
- 릴리스 계정에 연결된 실제 EAS 프로젝트 ID와 서명된 실기기 빌드. 양 플랫폼에서 권한 거부/허용, 토큰 등록/로테이션, 포그라운드 수신, 인증된 cold-start와 런타임 응답 라우팅, 로그아웃 등록 해제를 확인한다. Android는 API 33 이상을 포함해야 한다.
- 프로덕션 바이너리용 유효한 Apple 프로비저닝/App Store 크리덴셜과 Android keystore/Play 크리덴셜. 이 입력과 기기 검증이 갖춰지기 전까지 구매, 푸시 등록, 릴리스 제출은 프로덕션 인증이 아니라 fail-closed 상태로 유지된다.
