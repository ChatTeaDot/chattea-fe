# WebView boundary timing — community tab

`apps/chattea-mobile` renders the community tab as a `react-native-webview` pointed at
`chattea-web`'s SSR `/community` page. This note documents the end-to-end timing
instrumentation and the measured effect of pre-warming the WebView.

## Trace format

Each tab visit emits one JSON record tagged `[webview-trace]`:

```json
{
  "schema": "webview-trace/1",
  "screen": "community",
  "env": "development",
  "release": "dev",
  "marks": { "tab-focus": 0, "load-start": 318, "load-end": 446 },
  "segments": { "tab-focus->load-start": 318, "load-start->load-end": 127 },
  "totalMs": 446
}
```

Marks, in chronological order when present:

| mark | source |
| --- | --- |
| `tab-focus` | community screen focus (JS-visible proxy for the tab tap, t0) |
| `screen-mount` | community screen mount commit |
| `webview-mount` | `CommunityWebview` mount commit |
| `load-start` | `WebView.onLoadStart` |
| `load-end` | `WebView.onLoadEnd` |
| `web:<NAME>` | web vitals beacon via `postMessage` (see below) |
| `webview-ready` | revisit where the WebView is already loaded |

`segments` are deltas between consecutive marks; `totalMs` is first→last mark.
A trace closes on `load-end` + `WEBVIEW_TRACE_SETTLE_MS` (4s) settle window, on `web:LCP`,
on blur (emits a partial record), or on the next focus.

Web beacon contract: the page may `window.ReactNativeWebView.postMessage(JSON.stringify({
type: "chattea.community.vital", name: "FCP" | "LCP" | "INP" | "CLS" | "TTFB", value: number }))`.
Messages with any other `type` are ignored, so the native side works before the web beacon
ships and vice versa. `COMMUNITY_VITALS_MESSAGE_TYPE` is the contract constant.

## Sinks

- `console.info("[webview-trace]", <json>)` always.
- Optional HTTP collector: set `EXPO_PUBLIC_WEBVIEW_TRACE_URL` to POST each record.
- Env knobs: `EXPO_PUBLIC_COMMUNITY_WEB_URL` (defaults to `http://localhost:3000/community`,
  `http://10.0.2.2:3000/community` on Android), `EXPO_PUBLIC_COMMUNITY_WEBVIEW_PREWARM=0`
  disables the pre-warm.

## Measurement setup (used for the numbers below)

- iPhone 17 simulator, iOS 26.5, dev client (`Debug-iphonesimulator` build).
- Metro: `EXPO_PUBLIC_DEV_SESSION_TOKEN/…_REFRESH_TOKEN` (JWT-shaped dev tokens),
  `EXPO_PUBLIC_WEBVIEW_TRACE_URL=http://localhost:4000/trace`.
- Local stub GraphQL on `:4000` answering `NativeMe`/`currentSubscription`/empty lists,
  plus `POST /trace` appending JSONL.
- `pnpm --filter chattea-web dev` on `:3000`.
- Maestro flow: launch → dev-client link → dismiss dev menu → tap `커뮤니티`. 5 cold
  launches per configuration.

## Results (median of 5 cold runs, ms)

| segment | prewarm off | prewarm on | delta |
| --- | --- | --- | --- |
| `tab-focus → load-start` | 318 | 175 | -45% |
| `load-start → load-end` | 127 | 122 | -4% |
| total (tap → `load-end`) | 446 | 294 | -34% |

Dominant segment was `tab-focus → load-start`: WKWebView content-process spawn and
navigation setup (~71% of cold total). `CommunityWebviewPrewarm` mounts a hidden 1×1
WebView at the same URL inside `NativeIntegrationsProvider`, warming the shared web
content process and HTTP cache before the first tap. The `load-start → load-end`
segment is unchanged — it is the SSR stream itself, out of scope here (see web-side
LCP work in `docs/ssr-lcp-improvement.md`).

## Trade-offs

- One extra WKWebView stays alive while signed in: ~30–50MB web content process plus
  one extra fetch/render of `/community` per session.
- The pre-warmed page is the anonymous view; it never becomes visible.
- Mitigation if memory becomes an issue: `EXPO_PUBLIC_COMMUNITY_WEBVIEW_PREWARM=0`,
  or downgrade to `prefetch`-only warming.

## Reproduce

```bash
node apps/chattea-mobile/maestro/stub-graphql.mjs   # stub API + /trace collector
pnpm --filter chattea-web dev                     # :3000
cd apps/chattea-mobile
EXPO_PUBLIC_COMMUNITY_WEBVIEW_PREWARM=0 \         # baseline; omit for optimized run
EXPO_PUBLIC_WEBVIEW_TRACE_URL=http://localhost:4000/trace \
EXPO_PUBLIC_DEV_SESSION_TOKEN=<jwt> EXPO_PUBLIC_DEV_REFRESH_TOKEN=<jwt> \
  pnpm start
~/.maestro/bin/maestro test maestro/community-timing.yaml
```

Records land in `/tmp/webview-traces.jsonl` (or wherever the collector writes).
