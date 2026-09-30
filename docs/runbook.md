# 런북: 장애 신호 → 핫픽스 → 검증

Sentry/Datadog에서 신호를 받았을 때의 실행 순서. 절차 전체와 심각도 기준은
[incidents/README.md](incidents/README.md)를 본다.

## 1. 신호 확인

| 신호 | 어디서 | 보는 값 |
| --- | --- | --- |
| 새 에러·크래시·회귀 | Sentry Issues (mobile) | `release`(`EXPO_PUBLIC_SERVICE_VERSION`), 영향 세션 수, 스택 |
| 웹 에러·세션 이상 | Datadog RUM (`service: chattea-web`) | `version`·`env`, error view/session 수, 리소스 실패 |
| 모바일 세션 이상 | Datadog RUM (`service: chattea-fe`, env `EXPO_PUBLIC_SERVICE_ENV`) | view 단위 에러, 크래시 프리 세션 |
| Web Vitals 악화 | `/vitals` 자체 수집 + RUM | LCP/INP/CLS, 배포 시점과 상관 |

에러 기준 소스는 Sentry(mobile)·RUM `trackErrors`(web) — [observability.md](observability.md) 역할 분리 표 참조.

## 2. 세션 상관

1. Sentry 이슈 → 해당 `release`의 RUM 세션으로 넘어간다(같은 `version`/`env` 태그).
2. web 세션이면 `/api/graphql` 호출의 `traceparent`/`x-datadog-trace-id`로 chattea-be 로그를 조인한다
   (RUM이 헤더 주입 → `graphql-proxy.ts`의 `TRACE_FORWARD_HEADERS`가 upstream에 전달).
3. 모바일이면 `x-request-id`(installId-session-seq)·`x-device-id`로 백엔드 `http_request` 로그를 조인한다.
4. 이 지점에서 배포 단위를 확정한다: standalone web인가 shell 경로인가 네이티브인가 —
   롤백 수단이 달라진다(README 표).

## 3. 재현

```bash
pnpm dev:web        # chattea-web standalone (:3000) — WebView와 같은 경로
pnpm dev:mobile     # Expo — 네이티브 경로
pnpm --filter chattea-shell dev   # shell host (:3100) — MF remote 경로, web 서버도 함께 띄울 것
```

- shell 경로 장애는 standalone에서 재현 안 될 수 있다(SSR hydrate vs CSR lazy 로드 차이).
  반드시 shell로 확인.
- remote 로드 실패 재현: web 서버를 내리거나 `VITE_CHATTEA_WEB_URL`을 죽은 주소로 두고 shell을 띄운다
  → `ErrorBoundary` fallback("커뮤니티 앱을 불러오지 못했어요")이 떠야 한다.

## 4. 핫픽스

- 브랜치: `hotfix/<slug>` (예: `hotfix/community-remote-crash`). 베이스는 장애를 낸 릴리스 라인 —
  보통 `develop`에서 따고, 이미 `main`까지 나갔으면 `main`에서 따서 양쪽에 머지한다.
- 커밋: conventional, `fix(<scope>): ...` (예: `fix(chattea-web): ...`). 장애 PR을 되돌리는 게
  최선이면 `git revert`로 롤백한다 — 원인 분석은 복구 후에 한다.
- 롤백 계획을 PR 본문에 적는다(템플릿에 항목 있음).

## 5. 검증 체크리스트

머지 전 로컬:

- [ ] `pnpm lint && pnpm typecheck && pnpm test` 통과
- [ ] 재발 방지 테스트 추가(vitest 또는 `apps/chattea-mobile/maestro/` 플로우) — [README](incidents/README.md) §6
- [ ] web 변경: `pnpm --filter chattea-web build` 후 standalone 부팅, `/community` 스트리밍 확인
- [ ] MF 변경: shell에서 remote 로드 확인 + shared singleton(react/react-dom/react-query) 버전이 양쪽 일치하는지
- [ ] mobile 네이티브 변경: 관련 vitest 통과, 필요하면 `apps/chattea-mobile/maestro/run.sh`로 플로우 재생

배포 후:

- [ ] Sentry `release`에 에러 유입이 멈췄는지 / 새 이슈가 안 생기는지 확인
- [ ] RUM에서 에러율·세션이 장애 전 수준으로 돌아왔는지 확인
- [ ] remote 재배포였다면 `remoteEntry.js`가 새 빌드를 가리키는지 확인(캐시 TTL)

## 6. 사후

- [incidents/POSTMORTEM_TEMPLATE.md](incidents/POSTMORTEM_TEMPLATE.md)로 `docs/incidents/YYYY-MM-DD-<slug>.md` 작성(48시간 내).
- 포스트모텀 액션 아이템에 회귀 테스트를 포함해 추적한다.
