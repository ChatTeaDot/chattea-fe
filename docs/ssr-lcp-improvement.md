# SSR Streaming: Suspense Boundary for Early Shell

## Context

`apps/chattea-web` renders `/community` through Fastify + `renderToPipeableStream`
with TanStack Query. Previously `entry-server.tsx` ran
`await queryClient.prefetchQuery(communityTitleQuery())` before `streamReact()`,
so no app markup could stream until the query resolved.

Note: `create-app.ts` writes the template `head` before calling `render()`, so
response TTFB (first byte) was already fast. The bottleneck was the *app shell*:
the `<main>` markup only left the server after the upstream wait.

## Instrumentation

- `web-vitals` beacon in `src/app/report-vitals.ts` → `navigator.sendBeacon`
  posts `{name, value}` JSON to `POST /vitals`.
- `src/app/vitals/` — in-memory store + routes (`GET /vitals` returns
  count/min/p50/p75/max per metric).
- `SLOW_QUERY_MS` env var injects latency into `communityTitleQuery`'s queryFn
  (server only).
- `Server-Timing: shell;dur=<ms>` response trailer reports time-to-shell.

## Method

Server: `SLOW_QUERY_MS=300 pnpm --filter chattea-web dev`.
Stream chunks timed via `fetch` + `ReadableStream` reader; browser metrics via
headless Chromium (`chrome-headless-shell`, playwright-core) reading
`navigation`/`paint`/`largest-contentful-paint` entries. n=5 per run,
first (cold) run reported but excluded from medians.

## Results (SLOW_QUERY_MS=300)

Chunk arrival times (node fetch, marker = title string `지금 나누는 이야기`):

| | head | app shell | title chunk | total |
|---|---|---|---|---|
| before | ~3–5 ms | ~307 ms (shell+title combined) | ~307 ms | ~307 ms |
| after | ~2–3 ms | ~3 ms | ~304 ms | ~304 ms |

Browser metrics (headless Chromium, ms):

| metric | before | after | delta |
|---|---|---|---|
| TTFB (responseStart) | ~1.5 | ~1.4 | ~0 |
| FCP | 312–316 | 12–28 | **~−290** |
| LCP | 312–316 | 328–344 | ~+25 |
| DOMContentLoaded | ~347 | ~340 | ~0 |

Beacon aggregate confirms: `GET /vitals` after 5 page loads →
`FCP p50: 312` before, `FCP p50: 12` after.

## Diagnosis

- FCP improved ~290 ms: the suspense fallback (`불러오는 중…`) paints as soon as
  the shell arrives instead of waiting on the query.
- LCP did not improve (~+25 ms, within noise + deferred-swap cost). The LCP
  element is the `<h1>` title itself, which is genuinely upstream-bound — no
  amount of shell streaming makes upstream data arrive sooner. Deferred
  Suspense content is also swapped by an inline script (`$RC`), adding a small
  JS parse/exec cost before paint.
- Real-browser LCP gains from this pattern require either a faster upstream or
  a paintable LCP candidate inside the shell (e.g. a layout hero, headline
  copy that does not depend on the query).

## Changes

- `entry-server.tsx`: `await prefetchQuery` → fire-and-forget `void
  prefetchQuery` + `useSuspenseQuery` in `CommunityTitle`, wrapped in
  `<Suspense>` in `CommunityPage`.
- `stream-react.ts`: new `onShellReady` option; `create-app.ts` uses it to emit
  the `server-timing` trailer.
- Regression test `test/entry-server.test.tsx` asserts the shell chunk
  (with fallback, without title) arrives before query resolution.

## Caveats

- No dehydrated state is embedded yet; on hydration the suspense query refetches
  client-side (currently resolves from the same synchronous queryFn).
- `SLOW_QUERY_MS` only affects the server render path (`typeof window` guard).
- `GET /vitals` aggregation is per-process memory only — resets on restart.
