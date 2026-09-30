# 모노레포 파이프라인 결정 기록 (ADR)

날짜: 2026-09-30 · 상태: 채택

## 맥락

pnpm workspace(`apps/*`, `packages/*`)만 있고 태스크 오케스트레이션이 없었다.
`pnpm -r <script>`는 패키지를 병렬로 돌릴 뿐 의존 순서, 캐시, 증분 실행이 없다.

## 대안 → 선택

| 대안 | 판단 |
| --- | --- |
| `pnpm -r` 유지 | 의존 그래프 무시, 매번 전체 재실행. CI 시간이 코드베이스와 함께 선형 증가 |
| Nx | 플러그인 생태계는 강력하지만 Expo + Vite 조합에 과잉. 설정면적이 크다 |
| **Turborepo** | 태스크 그래프 + 로컬/리모트 캐시만 얹는 최소 구성. `turbo.json` 하나로 도입 |

선택: **pnpm(의존성·스크립트 실행) + Turborepo(태스크 오케스트레이션·캐시)** 역할 분리.

## 파이프라인 구조

```text
turbo.json
├── build       dependsOn ^build, outputs dist/**     (chattea-web만 build 스크립트 보유)
├── typecheck   dependsOn ^build
├── test        dependsOn ^build                       (vitest, 모바일 35파일/227테스트)
├── lint        의존 없음                              (모바일 eslint / 웹 tsc)
└── dev         cache:false, persistent               (expo start + tsx server 병렬)
```

- `@chattea/design-system`은 소스만 소비하는 패키지(`main → src/index.ts`)라 `build` 태스크가 없다.
  `^build` 체인은 워크스페이스 의존이 빌드 산출물을 만들기 시작하면 그대로 동작한다.
- `globalPassThroughEnv`에 `EXPO_PUBLIC_*`, `NODE_ENV`, `CI`, `PORT`를 열어 strict env 모드에서도
  Expo/Vite 프로세스가 필요한 변수를 받는다.
- 루트 스크립트는 `turbo run`으로 통일(`build`/`typecheck`/`lint`/`test`/`dev`).
  `dev:mobile`, `dev:web`은 `--filter`로 단일 앱만 실행한다.

## 캐시 전략

- **로컬**: `.turbo/cache` (gitignore). 작업 단위 해시로 재실행을 생략하고 로그까지 리플레이한다.
- **워크트리**: git worktree 간 캐시를 자동 공유한다(공통 git 디렉터리). 브랜치 이동 시에도 캐시 히트.
- **CI**: `chattea-workspace` 슈퍼프로젝트의 `frontend` 잡에서 `actions/cache`로 `chattea-fe/.turbo`를
  lockfile 해시로 캐시한다. pnpm store 캐시(`setup-node cache: pnpm`)와 별개로 동작.
- **리모트 캐시 미도입**: Vercel Remote Cache는 외부 의존. 규모가 커지면 self-host 캐시 서버로 확장 가능.

### 변경 패키지만 실행하지 않는 이유

계획안의 `turbo run lint test --filter=[HEAD^]`는 루트 파일(`pnpm-lock.yaml`, `turbo.json`)만
변경된 PR에서 어느 패키지도 선택하지 않아 lint/test가 통째로 스킵될 수 있다.
대신 **항상 전체 실행 + 캐시**를 택했다. 변경이 없는 패키지는 캐시 히트로 수 ms 만에 끝나므로
필터의 절감 효과를 캐시가 대신 흡수한다.

## 측정 (Apple Silicon, 로컬)

| 실행 | 결과 |
| --- | --- |
| cold `turbo run lint typecheck test build` (7 tasks) | lint 9.5s, typecheck 3.1s, test 4.8s, build 2.0s (병렬) |
| warm 재실행 | **8ms — FULL TURBO** (7/7 cache hit) |

## 트레이드오프

- `turbo run dev`는 모바일/웹 dev 서버를 동시에 띄운다. 단일 앱만 필요하면 `dev:mobile`/`dev:web`.
- design-system은 typecheck 스크립트가 없어(자체 tsconfig 부재) 파이프라인에서 빠진다.
  소비자(모바일)의 `tsc`가 임포트된 소스를 함께 검사하므로 현재는 커버된다.
- CI는 Expo 네이티브 빌드를 하지 않는다(기존 `expo prebuild`/`export` 검증 스텝은 유지).
  네이티브 빌드는 `release.yml`의 EAS 잡이 담당한다.
