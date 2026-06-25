export const PHONE_CODE_RESEND_SECONDS = 60;

export function getNextResendSeconds(seconds: number) {
  return Math.max(0, seconds - 1);
}

export function getResendTitle(seconds: number) {
  return seconds > 0 ? `재전송 ${seconds}초` : "인증번호 재전송";
}
