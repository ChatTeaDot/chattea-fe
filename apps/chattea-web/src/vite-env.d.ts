/// <reference types="vite/client" />

interface Window {
  __CHATTEA_AUTH__?: { authorization?: string };
  __DEHYDRATED__?: import("@tanstack/react-query").DehydratedState;
  ReactNativeWebView?: { postMessage: (data: string) => void };
}
