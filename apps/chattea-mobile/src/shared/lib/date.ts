import { HOURS_PER_DAY, MILLISECONDS_PER_MINUTE, MINUTES_PER_HOUR } from "./constants";

export const formatRelativeDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / MILLISECONDS_PER_MINUTE),
  );
  if (elapsedMinutes < 1) return "방금";
  if (elapsedMinutes < MINUTES_PER_HOUR) return `${elapsedMinutes}분 전`;
  const elapsedHours = Math.floor(elapsedMinutes / MINUTES_PER_HOUR);
  if (elapsedHours < HOURS_PER_DAY) return `${elapsedHours}시간 전`;
  return `${Math.floor(elapsedHours / HOURS_PER_DAY)}일 전`;
};

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(value));
