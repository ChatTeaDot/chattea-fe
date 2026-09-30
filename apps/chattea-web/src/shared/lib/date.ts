import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18n";
import { resources } from "@/i18n/resources";

import { HOURS_PER_DAY, MILLISECONDS_PER_MINUTE, MINUTES_PER_HOUR } from "./constants";

const dateStrings = (language?: string) =>
  resources[
    (SUPPORTED_LANGUAGES as readonly string[]).includes(language ?? "")
      ? (language as SupportedLanguage)
      : DEFAULT_LANGUAGE
  ].common.dates;

const interpolateCount = (template: string, count: number) =>
  template.replace("{{count}}", String(count));

export const formatRelativeDate = (value: string, language?: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dates = dateStrings(language);
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / MILLISECONDS_PER_MINUTE),
  );
  if (elapsedMinutes < 1) return dates.justNow;
  if (elapsedMinutes < MINUTES_PER_HOUR)
    return interpolateCount(dates.minutesAgo, elapsedMinutes);
  const elapsedHours = Math.floor(elapsedMinutes / MINUTES_PER_HOUR);
  if (elapsedHours < HOURS_PER_DAY) return interpolateCount(dates.hoursAgo, elapsedHours);
  return interpolateCount(dates.daysAgo, Math.floor(elapsedHours / HOURS_PER_DAY));
};
