/// <reference types="vite/client" />

interface Window {
  __CHATTEA_AUTH__?: { authorization?: string };
  __CHATTEA_LANG__?: string;
  __DEHYDRATED__?: import("@tanstack/react-query").DehydratedState;
  ReactNativeWebView?: { postMessage: (data: string) => void };
}
