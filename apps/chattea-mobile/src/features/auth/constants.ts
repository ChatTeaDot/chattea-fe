import { Gender } from "./types";

export const AUTH_CONTINUATION_KEY = "chattea.authContinuation";

export const PHONE_CONTINUATION_TTL_MS = 5 * 60 * 1000;

export const SIGNUP_CONTINUATION_TTL_MS = 15 * 60 * 1000;

export const PHONE_CODE_RESEND_SECONDS = 60;

export const genderOptions: { label: string; value: Gender }[] = [
  { label: "남자", value: "male" },
  { label: "여자", value: "female" },
];

export const SIGNUP_NAME_MAX_LENGTH = 20;

export const PHONE_CODE_LENGTH = 6;
