# chattea-fe

ChatTea frontend. Expo React Native + Expo Router.

## Run

```sh
pnpm install
pnpm run dev
```

## Checks

```sh
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm test
```

## Current scope

- Phone auth screens.
- Signup profile screen.
- Signup profile intro input with 60-char product limit.
- Kakao native SDK login entry using `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`.
- Code screen 60-second resend timer with GraphQL resend.
- Room list and chat room list rendering with `@legendapp/list`.
- Optimistic message temp-id replacement through `sendMessage`.
- Streaming message updates fade in newly appended text.
- Chat input product limits: first message 30 chars, general messages 90 chars.
- GraphQL phone auth mutations via `EXPO_PUBLIC_GRAPHQL_URL`.
- GraphQL Kakao login and Kakao-phone completion mutations via `EXPO_PUBLIC_GRAPHQL_URL`.
- GraphQL Kakao existing-phone attach via `attachPhoneToMe`.
- GraphQL rooms/messages/sendMessage queries via `EXPO_PUBLIC_GRAPHQL_URL`, including `messages(first, after)` cursor args.
- GraphQL editMessage/deleteMessage/markRoomRead/setTyping mutations via `EXPO_PUBLIC_GRAPHQL_URL`.
- GraphQL `reportMessage`/`blockUser` mutations via `EXPO_PUBLIC_GRAPHQL_URL`.
- GraphQL WebSocket `messageCreated`/`messageUpdated`/`messageDeleted`/`typingChanged`/`readReceiptUpdated` subscriptions via `EXPO_PUBLIC_GRAPHQL_WS_URL`.
- Chat message report action.
- Chat room read marking, typing status, and read receipt UI updates.
- GraphQL WebSocket auth headers and retry/backoff.
- Native image picker plus attachment signing and PUT upload state via `createUpload`.
- Sentry React Native init via `EXPO_PUBLIC_SENTRY_DSN`.
- Datadog RUM/log init via `EXPO_PUBLIC_DATADOG_CLIENT_TOKEN` and `EXPO_PUBLIC_DATADOG_RUM_APPLICATION_ID`.
- Sentry and Datadog Metro/config-plugin hooks for sourcemaps/debug IDs when build secrets are present.
- Native `@expo/ui` universal buttons on the phone/code/signup auth flow.
- Match candidate screen after login, with GraphQL `matchCandidates` and `likeUser`.
- Plan screen with GraphQL Free/Basic/Gold/Black catalog.
- GraphQL unread message summary preview client for Gold/Black 30+ char rule.
- Community screen with anonymous post list, post creation, comment action, and report action.
- Profile rating action on match candidates without public score display.
- React Query and session providers with GraphQL authorization header sync.
- SecureStore-backed app session persistence with hydration-gated initial routing.
- `eas.json` release profile skeleton for development, preview, and production.

Native `@expo/ui` changes require a rebuilt native app before device validation.
