export const KOREAN_REGIONS = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

export const MAX_PROFILE_PHOTO_BYTES = 10 * 1024 * 1024;

export const CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const MAX_PROFILE_PHOTOS = 3;

export const PROFILE_NAME_MAX_LENGTH = 40;

export const PROFILE_INTRO_MAX_LENGTH = 60;

export const PROFILE_ATTRIBUTE_ROWS = ["키", "직업", "MBTI"] as const;

export const PLAN_BADGE_LABELS = {
  basic: "Basic",
  black: "Black",
  gold: "Gold",
} as const;
