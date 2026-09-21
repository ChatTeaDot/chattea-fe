# ChatTea 프론트엔드

소개팅/매칭 앱 ChatTea의 클라이언트 모노레포(pnpm 워크스페이스).

```text
apps/chattea-mobile   Expo 56 / React Native 앱 (iOS · Android)
apps/chattea-web      Vite React — 네이티브 커뮤니티 탭의 WebView용 SSR 웹
```

## 기술 스택

- **모바일**: Expo 56, Expo Router, React Native Unistyles, Apollo Client, react-native-reanimated, LegendList
- **웹**: Vite, React, Fastify(`middlewareMode` 스트리밍 SSR), TanStack Query, vanilla-extract
- **네이티브 연동**: Kakao 로그인 SDK, RevenueCat, expo-notifications, expo-secure-store
- **품질**: Vitest, strict TypeScript(`noUncheckedIndexedAccess`), ESLint + Prettier

## 아키텍처

- **피처 단위 구조**: `src/features/<name>`이 `api/`(fetchers·schemas·hooks), `components/`, `types.ts`, `hooks.ts`를 갖고 배럴로만 외부 노출
- **디자인 시스템**: `src/theme`에 scale → semantic → app 토큰 3계층, 라이트/다크 테마. 공용 컴포넌트는 온디바이스 Storybook(`EXPO_PUBLIC_STORYBOOK=true pnpm storybook`)으로 문서화
- **커뮤니티 WebView**: `chattea-web`은 Fastify + Vite middlewareMode로 개발 서버를 구성하고, `/community`를 `renderToPipeableStream`으로 스트리밍. 모바일 탭이 WebView로 로드
- **세션**: SecureStore 기반 토큰 저장 + Apollo auth link, 카카오 네이티브 로그인 → 백엔드 JWT 교환

## 화면

- 매칭: 스와이프 카드, 액션바(관심/넘기기/되돌리기), 상세 프로필
- 좋아요: 받은 좋아요 그리드, 미구독자 블러 베일
- 채팅: 방 목록(안 읽은 수), 메시지 스레드, 신고
- 커뮤니티: 카테고리 필터, 글 작성 FAB, 댓글
- 내 정보: 프로필 사진 그리드 업로드, 구독 배지, 설정
