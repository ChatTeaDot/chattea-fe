import { installExpoGlobalPolyfill } from "expo-modules-core/src/polyfill/dangerous-internal";

// expo-modules-core reads `globalThis.expo` at module-eval time (NativeModule,
// EventEmitter, SharedObject, SharedRef). Without the polyfill, import order
// decides whether that global exists — cold runs occasionally evaluate a
// consumer first and crash. Installing it up front removes the race.
installExpoGlobalPolyfill();
