# 모노레포 파이프라인 결정 기록 (ADR)

날짜: 2026-09-30 · 상태: 채택

## 맥락

pnpm workspace(`apps/*`, `packages/*`)만 있고 태스크 오케스트레이션이 없었다.
`pnpm -r <script>`는 패키지를 병렬로 돌릴 뿐 의존 순서, 캐시, 증분 실행이 없다.

## 대안 → 선택

| 대안           | 판단                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `pnpm -r` 유지 | 의존 그래프 무시, 매번 전체 재실행. CI 시간이 코드베이스와 함께 선형 증가   |
| Nx             | 플러그인 생태계는 강력하지만 Expo + Vite 조합에 과잉. 설정면적이 크다       |
| **Turborepo**  | 태스크 그래프 + 로컬/리모트 캐시만 얹는 최소 구성. `turbo.json` 하나로 도입 |

선택: **pnpm(의존성·스크립트 실행) + Turborepo(태스크 오케스트레이션·캐시)** 역할 분리.

## 파이프라인 구조

```text
turbo.json
├── build            dependsOn ^build, outputs dist/** + storybook-static/**
│                                                 (chattea-web, shell — vite build)
├── build-storybook  dependsOn ^build, outputs storybook-static/**
│                                                 (@chattea/design-system — 웹 Storybook)
├── typecheck        dependsOn ^build              (전 패키지 tsc --noEmit)
├── test             dependsOn ^build              (vitest, 모바일 35파일/227테스트)
├── lint             의존 없음                      (전 패키지 eslint, eslint-config-expo flat)
└── dev              cache:false, persistent       (expo start + tsx server + vite + storybook)
```

- `@chattea/design-system`은 소스만 소비하는 패키지(`main → src/index.ts`)라 `build` 태스크가 없다.
  대신 `tsconfig.json`을 추가해 `typecheck`/`lint`/`test`/`build-storybook`을 파이프라인에 올렸다.
  스토리는 두 경로로 소비된다: 모바일 온디바이스 Storybook(`apps/chattea-mobile/.rnstorybook`)과
  웹 정적 Storybook(`@storybook/react-native-web-vite` + `react-native-unistyles` babel 플러그인).
  `build-storybook`은 `storybook-static/`을 산출한다.
- `chattea-web`과 `chattea-shell`의 `lint`는 `tsc` 스텁에서 `eslint .`로 교체됐다
  (`eslint-config-expo` flat + `simple-import-sort`, 모바일과 동일 규칙).
  module federation 가상 remote(`chattea_web/*`)와 로컬 측정 스크립트의 `playwright`는
  `import/no-unresolved` ignore로 처리한다.
- `globalPassThroughEnv`에 `EXPO_PUBLIC_*`, `NODE_ENV`, `CI`, `PORT`를 열어 strict env 모드에서도
  Expo/Vite 프로세스가 필요한 변수를 받는다.
- 루트 스크립트는 `turbo run`으로 통일(`build`/`build-storybook`/`typecheck`/`lint`/`test`/`dev`).
  `dev:mobile`, `dev:web`은 `--filter`로 단일 앱만 실행한다.
- `format`/`format:check`는 turbo 밖에서 `pnpm -r`로 돌린다. 전 패키지가
  `eslint . --fix && prettier --write .` 조합으로 통일됐다.

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

| 실행                                                 | 결과                                                    |
| ---------------------------------------------------- | ------------------------------------------------------- |
| cold `turbo run lint typecheck test build` (7 tasks) | lint 9.5s, typecheck 3.1s, test 4.8s, build 2.0s (병렬) |
| warm 재실행                                          | **8ms — FULL TURBO** (7/7 cache hit)                    |

## 트레이드오프

- `turbo run dev`는 모바일/웹 dev 서버와 design-system 웹 Storybook을 동시에 띄운다.
  단일 앱만 필요하면 `dev:mobile`/`dev:web` 또는 `--filter`.
- design-system의 `test`는 아직 테스트 파일이 없어 `vitest --passWithNoTests`로 통과한다.
  RN 전용 의존(unistyles, expo-image 등)을 쓰는 단위 테스트가 생기면 모바일과 같은
  vitest RN 설정이 필요하다.
- design-system의 웹 Storybook은 시각 참조용이다. 온디바이스 Storybook(.rnstorybook)이
  여전히 주 확인 경로이며, 웹 빌드는 safe-area-context/expo-router 같은 네이티브 전용
  의존을 쓰는 컴포넌트 스토리를 커버하지 않는다.
- CI는 Expo 네이티브 빌드를 하지 않는다(기존 `expo prebuild`/`export` 검증 스텝은 유지).
  네이티브 빌드는 `release.yml`의 EAS 잡이 담당한다.
