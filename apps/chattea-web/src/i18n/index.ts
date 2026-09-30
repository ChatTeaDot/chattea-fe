import i18next, { type i18n as I18nInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  NAMESPACES,
  resources,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "./resources";

export const resolveLanguage = (code?: string | null): SupportedLanguage => {
  const normalized = (code ?? "").split("-")[0]?.toLowerCase() ?? "";
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(normalized)
    ? (normalized as SupportedLanguage)
    : DEFAULT_LANGUAGE;
};

// Picks the best supported language from an `Accept-Language` header value,
// honoring `q` weights (e.g. "en-US,en;q=0.9,ko;q=0.5").
export const resolveAcceptLanguage = (header?: string): SupportedLanguage => {
  if (!header) return DEFAULT_LANGUAGE;
  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      return { tag: tag ?? "", weight: q ? Number.parseFloat(q.slice(2)) : 1 };
    })
    .sort((a, b) => b.weight - a.weight);
  for (const { tag } of candidates) {
    const language = resolveLanguage(tag);
    if (language !== DEFAULT_LANGUAGE || tag.toLowerCase().startsWith("ko")) return language;
  }
  return DEFAULT_LANGUAGE;
};

const baseOptions = {
  defaultNS: "common",
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  load: "languageOnly",
  ns: NAMESPACES,
  resources,
  returnNull: false,
} as const;

// Creates an isolated i18next instance. Used per request on the server so
// language state never leaks between concurrent SSR renders.
export const createI18n = (language?: string): I18nInstance => {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    ...baseOptions,
    lng: resolveLanguage(language),
  });
  return instance;
};

// Browser instance: honors an explicit language (the one resolved during SSR)
// and otherwise detects from navigator/document via the language detector.
export const createClientI18n = (language?: string): I18nInstance => {
  const instance = i18next.createInstance();
  if (language) {
    void instance.use(initReactI18next).init({ ...baseOptions, lng: resolveLanguage(language) });
    return instance;
  }
  void instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ...baseOptions,
      detection: { caches: [], order: ["navigator", "htmlTag"] },
    });
  return instance;
};

// Shared default instance. SSR renders always pass an explicit per-request
// instance through I18nextProvider, so this singleton only covers client-side
// entry points without a provider (module federation remote, unit tests).
const i18n = typeof window === "undefined" ? createI18n() : createClientI18n();

export { useTranslation } from "react-i18next";
export { DEFAULT_LANGUAGE, INTL_LOCALES, NAMESPACES, SUPPORTED_LANGUAGES } from "./resources";
export type { Namespace, SupportedLanguage } from "./resources";
export default i18n;
