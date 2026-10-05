import enCommon from "./locales/en/common.json";
import enCommunity from "./locales/en/community.json";
import jaCommon from "./locales/ja/common.json";
import jaCommunity from "./locales/ja/community.json";
import koCommon from "./locales/ko/common.json";
import koCommunity from "./locales/ko/community.json";
import viCommon from "./locales/vi/common.json";
import viCommunity from "./locales/vi/community.json";

export const DEFAULT_LANGUAGE = "ko";

export const SUPPORTED_LANGUAGES = ["ko", "en", "ja", "vi"] as const;

export const NAMESPACES = ["common", "community"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export type Namespace = (typeof NAMESPACES)[number];

type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : { [K in keyof T]: Widen<T[K]> };

// Korean is the source of truth; `match<Widen<typeof ko>>` annotations make
// `tsc` fail when another locale is missing keys that exist in Korean.
const match =
  <Shape>() =>
  (value: Shape) =>
    value;

export const resources = {
  en: {
    common: match<Widen<typeof koCommon>>()(enCommon),
    community: match<Widen<typeof koCommunity>>()(enCommunity),
  },
  ja: {
    common: match<Widen<typeof koCommon>>()(jaCommon),
    community: match<Widen<typeof koCommunity>>()(jaCommunity),
  },
  ko: {
    common: koCommon,
    community: koCommunity,
  },
  vi: {
    common: match<Widen<typeof koCommon>>()(viCommon),
    community: match<Widen<typeof koCommunity>>()(viCommunity),
  },
};

export const INTL_LOCALES: Record<SupportedLanguage, string> = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  vi: "vi-VN",
};
