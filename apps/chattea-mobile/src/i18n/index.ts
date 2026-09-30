import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  NAMESPACES,
  resources,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "./resources";

const resolveDeviceLanguage = (): SupportedLanguage => {
  try {
    const code = getLocales()[0]?.languageCode ?? "";
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
      ? (code as SupportedLanguage)
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

// Resources are bundled, so init resolves synchronously and `t` is usable at
// module scope (e.g. constants evaluated during import).
void i18next.use(initReactI18next).init({
  compatibilityJSON: "v4",
  defaultNS: "common",
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  lng: resolveDeviceLanguage(),
  load: "languageOnly",
  ns: NAMESPACES,
  resources,
  returnNull: false,
});

const i18n = i18next;

export type { Namespace, SupportedLanguage } from "./resources";
export { DEFAULT_LANGUAGE, INTL_LOCALES, NAMESPACES, SUPPORTED_LANGUAGES } from "./resources";
export { useTranslation } from "react-i18next";
export default i18n;
