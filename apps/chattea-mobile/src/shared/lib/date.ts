import i18n, { INTL_LOCALES, type SupportedLanguage } from "@/i18n";

import { HOURS_PER_DAY, MILLISECONDS_PER_MINUTE, MINUTES_PER_HOUR } from "./constants";

const intlLocale = () =>
  INTL_LOCALES[i18n.language as SupportedLanguage] ?? INTL_LOCALES.ko;

export const formatRelativeDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / MILLISECONDS_PER_MINUTE),
  );
  if (elapsedMinutes < 1) return i18n.t("dates.justNow");
  if (elapsedMinutes < MINUTES_PER_HOUR)
    return i18n.t("dates.minutesAgo", { count: elapsedMinutes });
  const elapsedHours = Math.floor(elapsedMinutes / MINUTES_PER_HOUR);
  if (elapsedHours < HOURS_PER_DAY) return i18n.t("dates.hoursAgo", { count: elapsedHours });
  return i18n.t("dates.daysAgo", { count: Math.floor(elapsedHours / HOURS_PER_DAY) });
};

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat(intlLocale(), { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat(intlLocale(), { month: "long", day: "numeric" }).format(new Date(value));
