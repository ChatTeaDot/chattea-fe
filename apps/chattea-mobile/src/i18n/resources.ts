import enAuth from "./locales/en/auth.json";
import enBilling from "./locales/en/billing.json";
import enChat from "./locales/en/chat.json";
import enCommon from "./locales/en/common.json";
import enCommunity from "./locales/en/community.json";
import enMatches from "./locales/en/matches.json";
import enNotifications from "./locales/en/notifications.json";
import enProfile from "./locales/en/profile.json";
import enSettings from "./locales/en/settings.json";
import jaAuth from "./locales/ja/auth.json";
import jaBilling from "./locales/ja/billing.json";
import jaChat from "./locales/ja/chat.json";
import jaCommon from "./locales/ja/common.json";
import jaCommunity from "./locales/ja/community.json";
import jaMatches from "./locales/ja/matches.json";
import jaNotifications from "./locales/ja/notifications.json";
import jaProfile from "./locales/ja/profile.json";
import jaSettings from "./locales/ja/settings.json";
import koAuth from "./locales/ko/auth.json";
import koBilling from "./locales/ko/billing.json";
import koChat from "./locales/ko/chat.json";
import koCommon from "./locales/ko/common.json";
import koCommunity from "./locales/ko/community.json";
import koMatches from "./locales/ko/matches.json";
import koNotifications from "./locales/ko/notifications.json";
import koProfile from "./locales/ko/profile.json";
import koSettings from "./locales/ko/settings.json";
import viAuth from "./locales/vi/auth.json";
import viBilling from "./locales/vi/billing.json";
import viChat from "./locales/vi/chat.json";
import viCommon from "./locales/vi/common.json";
import viCommunity from "./locales/vi/community.json";
import viMatches from "./locales/vi/matches.json";
import viNotifications from "./locales/vi/notifications.json";
import viProfile from "./locales/vi/profile.json";
import viSettings from "./locales/vi/settings.json";

export const DEFAULT_LANGUAGE = "ko";

export const SUPPORTED_LANGUAGES = ["ko", "en", "ja", "vi"] as const;

export const NAMESPACES = [
  "common",
  "auth",
  "billing",
  "chat",
  "community",
  "matches",
  "notifications",
  "profile",
  "settings",
] as const;

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
    auth: match<Widen<typeof koAuth>>()(enAuth),
    billing: match<Widen<typeof koBilling>>()(enBilling),
    chat: match<Widen<typeof koChat>>()(enChat),
    common: match<Widen<typeof koCommon>>()(enCommon),
    community: match<Widen<typeof koCommunity>>()(enCommunity),
    matches: match<Widen<typeof koMatches>>()(enMatches),
    notifications: match<Widen<typeof koNotifications>>()(enNotifications),
    profile: match<Widen<typeof koProfile>>()(enProfile),
    settings: match<Widen<typeof koSettings>>()(enSettings),
  },
  ja: {
    auth: match<Widen<typeof koAuth>>()(jaAuth),
    billing: match<Widen<typeof koBilling>>()(jaBilling),
    chat: match<Widen<typeof koChat>>()(jaChat),
    common: match<Widen<typeof koCommon>>()(jaCommon),
    community: match<Widen<typeof koCommunity>>()(jaCommunity),
    matches: match<Widen<typeof koMatches>>()(jaMatches),
    notifications: match<Widen<typeof koNotifications>>()(jaNotifications),
    profile: match<Widen<typeof koProfile>>()(jaProfile),
    settings: match<Widen<typeof koSettings>>()(jaSettings),
  },
  ko: {
    auth: koAuth,
    billing: koBilling,
    chat: koChat,
    common: koCommon,
    community: koCommunity,
    matches: koMatches,
    notifications: koNotifications,
    profile: koProfile,
    settings: koSettings,
  },
  vi: {
    auth: match<Widen<typeof koAuth>>()(viAuth),
    billing: match<Widen<typeof koBilling>>()(viBilling),
    chat: match<Widen<typeof koChat>>()(viChat),
    common: match<Widen<typeof koCommon>>()(viCommon),
    community: match<Widen<typeof koCommunity>>()(viCommunity),
    matches: match<Widen<typeof koMatches>>()(viMatches),
    notifications: match<Widen<typeof koNotifications>>()(viNotifications),
    profile: match<Widen<typeof koProfile>>()(viProfile),
    settings: match<Widen<typeof koSettings>>()(viSettings),
  },
};

export const INTL_LOCALES: Record<SupportedLanguage, string> = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  vi: "vi-VN",
};
