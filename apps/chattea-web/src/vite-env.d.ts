/// <reference types="vite/client" />

interface Window {
  __CHATTEA_AUTH__?: { authorization?: string };
  ReactNativeWebView?: { postMessage: (data: string) => void };
}
