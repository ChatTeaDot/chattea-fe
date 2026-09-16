export const getNextResendSeconds = (seconds: number) => {
  return Math.max(0, seconds - 1);
};

export const getResendTitle = (seconds: number) => {
  return seconds > 0 ? `재전송 ${seconds}초` : "인증번호 재전송";
};

export const formatResendClock = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};
