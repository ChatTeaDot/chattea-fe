# Observability

chattea의 관측 스택은 도구별 역할을 분리한다. 겹치는 신호(에러)는 중복 전송하되 기준 소스는 하나로 둔다.

## 역할 분리

| 도구                 | 역할                                             | 범위                                                |
| -------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Sentry               | 에러/크래시 리포트, 릴리스·소스맵 연동           | mobile(`@sentry/react-native`), 에러의 기준 소스    |
| Datadog RUM          | 페이지 로드·Web Vitals·리소스/API 지연·세션 추적 | mobile(`expo-datadog`), web(`@datadog/browser-rum`) |
| PostHog              | 제품 이벤트·퍼널·행동 분석                       | web(`posthog-js`), mobile 계측은 후속               |
| `/vitals` 엔드포인트 | Web Vitals 자체 수집(백업) — `report-vitals.ts`  | web, Datadog 없이도 동작                            |

- 에러 중복이 싫으면 Datadog `trackErrors` 대신 Sentry만 보면 된다. 현재는 양쪽에 보내되 분석은 Sentry 기준.
- RUM(`service: chattea-web`)과 모바일(`expo-datadog`)은 같은 서비스 명명 규칙을 쓴다.

## 트레이스 전파 (web → backend)

1. `@datadog/browser-rum`이 `allowedTracingUrls: /api/graphql`에 대해 `traceparent`, `tracestate`, `x-datadog-*` 헤더를 주입한다 (`propagatorTypes: ["tracecontext", "datadog"]`).
2. `graphql-proxy.ts`가 `TRACE_FORWARD_HEADERS`(W3C + Datadog + B3)를 upstream `GRAPHQL_URL`로 그대로 전달한다.
3. chattea-be는 들어온 `traceparent`/`x-datadog-trace-id`를 로그 컨텍스트에 싣는다 — RUM trace id와 백엔드 로그가 같은 키로 조인된다.

프록시가 헤더를 버리면 연결이 끊기므로, 새 헤더 propagator 추가 시 `TRACE_FORWARD_HEADERS`에도 추가한다.

## 이벤트 스키마 (PostHog)

공통 속성: `screen`(화면 식별자), `source`(유입 지점). PostHog가 `session_id`를 자동 첨부한다.

| 이벤트           | 발생 지점                          | 추가 속성    | 비고                              |
| ---------------- | ---------------------------------- | ------------ | --------------------------------- |
| `webview_enter`  | `entry.tsx` 앱 부팅                | —            | 웹뷰 진입                         |
| `community_view` | `CommunityPage` 마운트             | —            | 목록 화면 노출                    |
| `post_view`      | 글 행 탭 → 네이티브 상세 이동      | `postId`     | 의도 이벤트, 상세 렌더는 네이티브 |
| `post_create`    | 글쓰기 FAB 탭 → 네이티브 작성 화면 | —            | 의도 이벤트, 완료는 네이티브      |
| `comment_create` | mobile                             | —            | web 미계측                        |
| `message_send`   | mobile                             | —            | web 미계측                        |
| `tab_switch`     | mobile                             | `from`, `to` | web 미계측                        |

스키마 정의: `apps/chattea-web/src/shared/analytics/events.ts` (`ANALYTICS_EVENT`). 새 이벤트는 거기 추가 후 `track()` 호출. 이벤트명은 `snake_case`, `대상_동작` 순서.

chattea-web은 커뮤니티 목록 웹뷰라 실제 작성·메시지·탭 UI가 네이티브에 있다. web에서는 진입/열람 의도만 찍고, 완료 이벤트는 mobile에서 같은 스키마로 전송한다 — 퍼널(진입 → 글 열람 → 작성)이 앱 경계를 넘어 이어진다.

## 환경 변수 (`apps/chattea-web/.env.example`)

| 변수                        | 용도                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `VITE_DATADOG_APP_ID`       | RUM applicationId                                                    |
| `VITE_DATADOG_CLIENT_TOKEN` | RUM clientToken                                                      |
| `VITE_DATADOG_SITE`         | Datadog 사이트 (기본 `datadoghq.com`)                                |
| `VITE_POSTHOG_KEY`          | PostHog 프로젝트 키                                                  |
| `VITE_POSTHOG_HOST`         | PostHog 호스트 (기본 `https://us.i.posthog.com`, 셀프호스트 시 교체) |

키가 없으면 두 SDK 모두 no-op — dev에서 지워도 에러·네트워크 호출 없음. SDK는 `import()`로 지연 로드되어 초기 번들에 들어가지 않는다.
