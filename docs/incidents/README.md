# 인시던트 프로세스

chattea-fe 장애 대응 절차. 개별 장애 기록은 이 디렉터리에 `YYYY-MM-DD-<slug>.md`로 추가한다.
실행 순서·명령어는 [../runbook.md](../runbook.md), 기록 양식은 [POSTMORTEM_TEMPLATE.md](POSTMORTEM_TEMPLATE.md)를 본다.

## 심각도

| 등급 | 기준 | 예시 |
| --- | --- | --- |
| SEV1 | 핵심 플로우 불가 또는 크래시·데이터 손상 | 앱 부팅 크래시, 커뮤니티 탭 전면 실패, remoteEntry 로드 불가 |
| SEV2 | 핵심 플로우 저하, 우회 경로 존재 | 커뮤니티 목록 지연 급증, 특정 화면 렌더 실패 |
| SEV3 | 국소 결함, 사용은 가능 | 비핵심 화면 깨짐, 분석 이벤트 누락 |

SEV1/2 또는 사용자 영향이 확인된 모든 장애는 포스트모텀을 쓴다. SEV3은 회귀 테스트만 필수다.

## 배포 단위별 복구 수단

같은 버그라도 어느 배포 단위에 있는지가 복구 시간을 결정한다. 트리아지 때 먼저 이 표에서 위치를 찾는다.

| 단위 | 배포 방식 | 롤백 수단 | 전파 지연 |
| --- | --- | --- | --- |
| `chattea-web` remote (`remoteEntry.js`) | web 서비스 재배포 | 커밋 리버트 후 재배포. shell 재배포 불필요 — `remoteEntry.js`만 갱신되면 다음 로드부터 적용 | `remoteEntry.js` 캐시 TTL(짧게 유지 전제, [../module-federation.md](../module-federation.md)) |
| `chattea-web` standalone (모바일 커뮤니티 WebView) | web 서비스 재배포 | 동일. **앱 릴리스 없이** WebView가 서빙하는 콘텐츠가 바뀐다 | 즉시~캐시 TTL |
| `apps/shell` host | shell 재배포 | 이전 빌드 재배포. shared singleton(react/react-dom/react-query) 버전 변경이 원인이면 remote와 함께 맞춰 되돌린다 | 배포 파이프라인 |
| `chattea-mobile` 네이티브 코드 | EAS build → 스토어 심사 (`eas.json` production, autoIncrement) | OTA 없음(expo-updates 미도입). 심사 전까지는 서버측 토글·백엔드 우회·WebView 경로 우회가 유일한 완화 | 스토어 심사(시간~일) |

모바일 커뮤니티 탭은 WebView로 `chattea-web`을 로드하므로, 커뮤니티 관련 네이티브 장애라도 원인이 웹 콘텐츠면 web 재배포로 완화된다. 네이티브 코드 자체가 원인이면 새 EAS 빌드 + 심사가 필요하므로 긴급 심사(expedited review) 요청을 검토한다.

## 절차

### 1. 탐지

- **Sentry**(mobile): 새 이슈, 회귀(regression) 표시, 릴리스별 크래시. `release`는 `EXPO_PUBLIC_SERVICE_VERSION`과 같다.
- **Datadog RUM**: web(`service: chattea-web`, `trackErrors` 에러), mobile(`service: chattea-fe`). 에러율·세션·view 단위 이상 징후.
- **`/vitals` 자체 수집**(web): Datadog 무관한 백업 지표. LCP/INP/CLS 악화로 성능 회귀 탐지.
- 사용자 제보가 먼저 올 수도 있다 — 제보도 동일하게 RUM/Sentry에서 확인한다.

### 2. 트리아지

1. 영향 범위를 위 표의 배포 단위로 특정한다: 웹 standalone인가, shell 경로인가, 네이티브인가.
2. Sentry `release` / RUM `version`·`env`로 어느 배포에서 시작됐는지 확인한다.
3. 심각도를 매기고 담당자를 정한다. SEV1은 완화(롤백)가 원인 분석보다 먼저다.

### 3. 완화

- **롤백 우선.** 원인 수정보다 이전 상태 복귀가 빠르다. 배포 단위별 수단은 위 표.
- 네이티브 원인인데 심사가 막히면 서버측에서 기능을 끄거나 우회 경로를 제공한다.
- 완료 기준: 에러율/지표가 장애 전 수준으로 돌아옴을 RUM·Sentry에서 확인.

### 4. 포스트모텀

- 완화 후 **48시간 내** `docs/incidents/YYYY-MM-DD-<slug>.md`에 템플릿으로 작성.
- 비난 없이(blameless) 타임라인·근본 원인·기여 요인을 적는다. 개인이 아니라 프로세스와 가드를 고친다.

### 5. 액션 아이템

- 모든 액션 아이템은 **담당자와 기한**을 가진다. 유형은 완화/예방/탐지/테스트로 분류한다.
- "탐지" 유형 예시: 재발한 패턴에 대한 Datadog 모니터나 Sentry 알림 규칙 추가 — 현재 명시적 알림 규칙은 문서화돼 있지 않으므로 이슈에서 만든다.

### 6. 회귀 테스트 (필수)

- 장애를 고친 PR 또는 직후 PR에 **재발을 검증하는 테스트를 반드시** 포함한다.
  - 로직·렌더 결함: vitest(`pnpm test`). mobile은 `test/`, web은 `test/` 하위.
  - 네이티브 플로우(부팅·탭·로그아웃): `apps/chattea-mobile/maestro/` 플로우 추가.
  - remote 로드 실패 계열: shell의 `ErrorBoundary` fallback 경로를 커버하는 테스트.
- 테스트가 불가능한 영역(스토어 심사 등)이면 대신 검증 절차를 포스트모텀에 적고 체크리스트에 추가한다.
