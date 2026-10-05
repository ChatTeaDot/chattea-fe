# Module Federation

`chattea-web`은 Module Federation remote이자 standalone 앱이다. `apps/shell`(`chattea-shell`)은 remote를 런타임에 로드하는 얇은 host다. 플러그인은 `@module-federation/vite`(Vite 7 지원)를 사용한다.

## 구조

```
apps/chattea-web  (remote, 이름: chattea_web)
  exposes ./CommunityApp -> src/pages/community/ui/community-app.tsx
  dev:    pnpm --filter chattea-web dev   # Fastify + Vite middleware, :3000
  build:  pnpm --filter chattea-web build # dist/remoteEntry.js + index.html

apps/shell        (host, 이름: chattea_shell)
  dev:    pnpm --filter chattea-shell dev # Vite, :3100
  build:  pnpm --filter chattea-shell build
```

- `/community` 경로에서 shell이 `chattea_web/CommunityApp`을 `React.lazy`로 로드한다. 로드 실패 시 error boundary fallback이 렌더된다.
- shell은 `QueryClientProvider`를 소유한다. remote는 provider를 가져오지 않고 context를 공유한다. `MantineProvider`는 shell에 없으므로 remote가 `community-app.tsx`에서 자체 provider로 감싼다.
- remote의 `/api/graphql` 요청은 shell dev server가 `VITE_CHATTEA_WEB_URL`로 프록시한다(`server.proxy["/api"]`).

## remote entry URL

- 기본값 `http://localhost:3000`. `VITE_CHATTEA_WEB_URL`로 변경한다(예: `.env.local` 또는 실행 환경 변수).
- `apps/shell/vite.config.ts`의 `loadEnv`가 `VITE_CHATTEA_WEB_URL`을 읽어 `remotes.chattea_web.entry`에 `${VITE_CHATTEA_WEB_URL}/remoteEntry.js`를 설정한다. 빌드 시점 값이므로 배포 환경별로 빌드하거나 env를 주입한다.

## standalone 유지

chattea-web의 기존 실행·빌드는 그대로다. federation 플러그인은 `remoteEntry.js`와 공유 스코프 청크를 추가로 emit할 뿐 `index.html` 기반 standalone 진입(`src/app/entry.tsx`의 hydrate)을 변경하지 않는다. WebView에서 쓰는 직접 실행 경로는 영향이 없다.

## shared singletons

remote와 host 모두 다음을 `singleton: true`로 공유한다.

- `react`
- `react-dom`
- `@tanstack/react-query`

두 앱의 버전이 호환돼야 한다(현재 react `^19.2.3`, react-query `^5.102.8`). singleton이므로 remote는 host가 제공하는 인스턴스를 재사용하고, 중복 로드되지 않는다. 버전이 갈리면 런타임이 경고하고 remote가 자체 사본을 로드할 수 있으므로, 버전 변경은 양쪽을 함께 올린다.

## 독립 배포 검증

- remote만 변경 → `chattea-web` dev server가 바로 새 코드를 서빙, shell은 무수정(로컬에서 확인: remote 소스 변경이 shell 재시작 없이 반영됨).
- 배포 단위도 분리된다: shell은 `remoteEntry.js` URL만 알면 되고, remote 재배포는 content hash 청크로 이뤄지므로 shell 재배포 없이 반영된다. `remoteEntry.js`는 캐시를 끄거나 짧게 둬야 한다.

## 트레이드오프 (솔직하게)

MF 도입의 실제 이득은 제한적이다.

- 이미 독립 배포 중이다. `chattea-web`은 지금도 별도 Fastify/Vite 앱으로 독립 배포된다. MF 없이도 "remote만 재배포"는 달성 가능하다.
- 얻는 것: 런타임 통합 — shell 라우트 안에서 remote UI를 SPA 전환 없이 마운트하고, react·react-query 인스턴스를 공유해 번들을 중복 로드하지 않는다. 향후 다른 remote(예: 채팅 웹 뷰)를 같은 shell에 붙일 수 있는 구조.
- 치는 비용:
  - 빌드 복잡도 증가: remoteEntry·shared scope·청크 분리가 추가되고, `@module-federation/vite`는 Vite 버전별 청크 전략 차이(Vite 5~7 Rollup vs Vite 8+ Rolldown)가 있다.
  - shared singleton 버전 드리프트 리스크: react/react-query를 양쪽이 같이 올려야 한다.
  - SSR과의 불일치: standalone은 Fastify SSR+hydration이지만 shell 경로는 CSR lazy 로드다. shell 경로에서 SSR 프라이밍·`__DEHYDRATED__`·`server-timing` 트레일러 이점이 없다.
  - WebView 브리지(`window.ReactNativeWebView`, `__CHATTEA_AUTH__`)는 shell context에서도 동작하지만, native 쪽이 shell origin을 로드하도록 바뀌어야 의미가 있다.

결론: 이 변경은 포트폴리오/러닝 목적의 MF 도입이다(공고 우대사항 "Micro Frontend"). production 의사결정이라면 단일 remote·단일 페이지 규모에서는 MF 오버헤드가 이득보다 클 수 있다. remote가 2개 이상으로 늘거나 shell이 공통 셸(내비·인증·디자인 시스템)을 소유하게 될 때 본래 가치가 나온다.
