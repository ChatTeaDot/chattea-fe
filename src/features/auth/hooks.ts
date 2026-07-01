import { useMutation } from "@tanstack/react-query";

import {
  attachPhoneToMe,
  completeKakaoPhoneSignup,
  completePhoneSignup,
  loginWithKakao,
  requestPhoneCode,
  verifyPhoneCode,
} from "./api";

export const useRequestPhoneCode = () => {
  return useMutation({ mutationFn: requestPhoneCode });
};

export const useVerifyPhoneCode = () => {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyPhoneCode(phone, code),
  });
};

export const useCompletePhoneSignup = () => {
  return useMutation({
    mutationFn: ({
      signupToken,
      nickname,
      intro,
    }: {
      signupToken: string;
      nickname: string;
      intro?: string;
    }) => completePhoneSignup(signupToken, nickname, intro),
  });
};

export const useLoginWithKakao = () => {
  return useMutation({ mutationFn: loginWithKakao });
};

export const useCompleteKakaoPhoneSignup = () => {
  return useMutation({
    mutationFn: ({
      kakaoToken,
      signupToken,
      nickname,
      intro,
    }: {
      kakaoToken: string;
      signupToken: string;
      nickname: string;
      intro?: string;
    }) => completeKakaoPhoneSignup(kakaoToken, signupToken, nickname, intro),
  });
};

export const useAttachPhoneToMe = () => {
  return useMutation({
    mutationFn: ({
      kakaoToken,
      phone,
      code,
    }: {
      kakaoToken: string;
      phone: string;
      code: string;
    }) => attachPhoneToMe(kakaoToken, phone, code),
  });
};
